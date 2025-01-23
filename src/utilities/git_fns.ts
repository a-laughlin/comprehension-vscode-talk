import {EMPTY_STRING, NodePosition, WEBVIEW_DATA_DEFAULTS, WebViewData } from "../shared";
import {exec as _exec,execSync,spawn} from 'node:child_process';
import {dirname,join,sep,parse as parsePath,relative} from 'node:path';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { Merge } from 'type-fest';
import vscode,{ window } from 'vscode';
import { partition } from 'effect/Array';

export const getRelatedResources = async(repoRootPath:string,filePath:string,selection:string)=>{
  const commitMessages = await getLocalCommitMessages(repoRootPath,filePath,selection);
  console.log('commitMessages',commitMessages);
  // const issueNumbers = commitMessagesToIssueNumbers(commitMessages);
  // const {issues,prs} = await issueNumbersToIssuesAndPrContents(repoRootPath)(issueNumbers);
  const {issues,prs} = {issues:[],prs:[]};
  return {commitMessages,issues,prs};
}

const getLocalCommitMessages = (
  repoRootPath: string,
  pathFromRepoRoot: string,
  selection: string,
  execFn = exec
) => {
  // Escape selection text for use in git command
  const escapedSelection = selection?.replace(/[`$"\\]/g, '\\$&');

  // Git pickaxe search (-S) finds commits that changed this exact text
  // Format with %h for short hash, %B for full commit message
  // Use custom delimiter to reliably separate commits
  const delimiter = '===COMMIT_DELIMITER===';
  // example: git log -S"  if (options.fromPackage) {" --pretty=format:"%h%n%B===COMMIT_DELIMITER===" -- packages/cli/src/lib/config.ts

  const gitCommand = `git log -S"${escapedSelection}" --pretty=format:"%ad %B${delimiter}" --date=format:"%Y-%m-%d" -- ${pathFromRepoRoot}`;
  console.log('gitCommand',gitCommand);
  return execFn(gitCommand, repoRootPath)
    // @ts-expect-error
    .then(result=>console.log(result)||result.split(delimiter).filter(Boolean))
    .catch(e=>{
      console.log('Error getting commit messages:');
      console.error(e);
      return [];
    });
};



const commitMessagesToIssueNumbers = (commitMessages:string[])=>
  commitMessages.flatMap(
    message=>(message.match(/\#\d+/g) ?? []).map(issue=>issue.slice(1))
  );

const issueNumbersToIssuesAndPrContents = (repoRootPath:string)=>async (issueNumbers: string[]) => {
  // Get repo owner and name from remote URL
  const remoteUrl = execSync('git config --get remote.origin.url', {cwd: repoRootPath}).toString().trim();
  const [owner, repo] = remoteUrl.match(/[\/:]([^\/]+)\/([^\/]+?)(?:\.git)?$/i)?.slice(1) ?? [];

  if (!owner || !repo) {
    throw new Error('Could not determine repository owner and name');
  }

  // Build a single GraphQL query for all issue numbers
  const query = `
    query($owner: String!, $repo: String!, $numbers: [Int!]!) {
      repository(owner: $owner, name: $repo) {
        nodes: issueOrPullRequests(numbers: $numbers) {
          ... on Issue {
            title
            body
            number
            url
            type: __typename
          }
          ... on PullRequest {
            title
            body
            number
            url
            type: __typename
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          owner,
          repo,
          numbers: issueNumbers.map(num => parseInt(num.replace('#', ''), 10))
        }
      })
    });

    const json = await response.json() as {
      data?: {
        repository?: {
          nodes?: Array<{
            title: string;
            body: string;
            number: number;
            url: string;
            type: string;
          }>
        }
      }
    };

    const nodes = json.data?.repository?.nodes ?? [];
    const [issues,prs] = partition(nodes,node=>node.type === 'Issue');
    return {issues,prs};
  } catch (error) {
    console.error('Error fetching issues/PRs:', error);
    return {issues:[],prs:[]};
  }
}

/**
 * shortens any strings containing `Library/CloudStorage/Dropbox` to `Dropbox`
 * because VSCode alternates between the two paths in
 * different contexts that I haven't fully understood yet.
 */
const dropboxFullPath = `Library${sep}CloudStorage${sep}Dropbox`;
export const shortenDropboxPaths = (path:string):string=>
  path.replace(dropboxFullPath,'Dropbox');

/**
 * given a file or directory, finds the closest ancestor that satisfies the predicate
 * example:
 * ```
 *  findAncestorPath(
 *    '/Foo/bar/my-repo/src/components',
 *    dir=>existsSync(join(dir,'bar'))
 *  ) === '/Foo/bar'
 * ```
 */
export const findAncestorPath = (selectedDirectory:string,predicate:(currentDirectory:string)=>boolean)=> {
  selectedDirectory = shortenDropboxPaths(selectedDirectory);
  let currentDir = selectedDirectory;
  const rootPath = parsePath(process.cwd()).root; // "/" on unix, "C:\" on windows
  while (currentDir !== rootPath) {
    if (predicate(currentDir)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }
  return EMPTY_STRING;
};


/**
 * gets the closest directory with a .git file/folder
 * should return the submodule if in one, or the root directory if not.
 * ```
 *  findModuleRoot('/Foo/bar/my-repo/src/components') === '/Foo/bar/my-repo'
 * ```
 */
export type FindModuleRoot = (selectedDirectory:string)=>string;
export const findModuleRoot:FindModuleRoot = selectedDirectory=>
  findAncestorPath(selectedDirectory,dir=>existsSync(join(dir,'.git')));

/**
 * equivalent to "git rev-parse --show-prefix" but faster since we don't need to spawn a process
 * finds the path from the repo root to the selected directory
 * ```
 * findGitPrefix('/Foo/bar/my-repo/src/components') === 'src/components/'
 * ```
 * @param selectedDirectory
 * @returns the relative path from the current file to the repo root
 */
export type FindGitPefix = (selectedDirectory:string)=>string;
export const findGitPrefix:FindGitPefix = (selectedDirectory)=>
  relative(findModuleRoot(selectedDirectory), selectedDirectory);


/** exec is child_process.exec, promisified, with required cwd and throwing stderr */
const __exec = promisify(_exec);
const exec = async (cmd:string,cwd:string,options?:Parameters<typeof __exec>[1]):Promise<string> =>{
  const {stdout,stderr} = await __exec(cmd,{...options,encoding:'utf-8',cwd});
  if(stderr.length>0){ throw new Error(stderr); }
  return stdout;
};

