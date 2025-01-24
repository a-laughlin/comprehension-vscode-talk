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
import { get } from 'node:http';

export const getRelatedResources = async(repoRootPath:string,filePath:string,selection:string)=>{
  return {
    commits: await getLocalCommitMessages(repoRootPath,filePath,selection),
    prs:getPrs()
  };
}

const getPrs = ()=>{
  // pretend that this came from Github's GraphQL API
  return [
    {
      "id": "MDY6Q29tbWl0MjM2MDk1NTc2OjAxNDVmYWE2ZWUyZmFmOGQ0OTM4YzdkNTE4ZjA1M2E2MzQwMDk4MTE=",
      "associatedPullRequests": {
        "edges": [
          {
            "node": {
              "title": "cli: add versions:check and versions:bump",
              "bodyText": "Hey, I just made a Pull Request!\nAdds backstage-cli versions:bump and backstage-cli versions:check, which allow users to bump @backstage packages to the latest versions, and remove duplicates.\nThe bump commands will pull down the latest version of each @backstage package and then run a deduplication. The idea is that this command can be used to easily stay on top of the latest releases without having to manually sift though package.jsons. There's currently no way to select which weekly release of the packages to use, it will always use the latest release. The metadata returned from npm contains enough information about the releases that it should be possible to add that if we want to.\nThe check command will detect duplicates of the @backstage packages and warn the user. If the --fix flag is provided, it will act like yarn-deduplicate and get rid of any duplicates that can be removed while staying within the requested version range. It will also warn about packages that can't be deduplicated automatically, and exit with an error if any of those packages are known to not function if there are duplicates, such as @backstage/core.\nFixes #3185, although will likely leave this undocumented until after the next release. I did some local verification but want to make sure this works properly with a released version too.\n✔️ Checklist\n\n\n A changeset describing the change and affected packages. (more info)\n Added or updated documentation\n Tests for new functionality and regression tests for bug fixes\n Screenshots attached (for UI changes)"
            }
          }
        ]
      }
    }
  ];
};

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

  const gitCommand = `git log -S"${escapedSelection}" --pretty=format:"%h %ad %B${delimiter}" --date=format:"%Y-%m-%d" -- ${pathFromRepoRoot}`;
  return execFn(gitCommand, repoRootPath)
    .then(result=>{
      console.log(result);
      return result
        .split(delimiter)
        .filter(Boolean)
        .map(commit=>{
          const commitParts = commit.trim().match(/^(.+?) (.+?) ([\s\S]+)$/) ?? [];
          const [,sha,date,message] = commitParts;
          return {sha,date,message} as {sha:string,date:string,message:string};
        })
    })
    .catch(e=>{
      console.log('Error getting commit messages:');
      console.error(e);
      return [];
    });
};

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

