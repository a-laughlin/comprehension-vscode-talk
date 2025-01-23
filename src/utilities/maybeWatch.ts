import { watch } from 'node:fs';
import { join } from 'node:path';
import vscode from "vscode";
import { execSync } from 'node:child_process';

/**
 * maybeWatch checks for env variables set in launch.json to watch and build appropriate files only in development.
 * It also exits gracefully unlike other 'watch' commands defined by esbuild, tsc, or .vscode/launch|tasks.json.
 * Most of those leave a second terminal open and watching, creating unexpected out/ directory artifacts while editing files.
 */
export const maybeWatch = (extensionPath:string) => {
  if(process.env.NODE_ENV !== 'development'){
    return [];
  }

  const srcPath = join(extensionPath, "src");
  const webviewPath = join(extensionPath, "webview");
  console.log(`WATCHING "src" and "webview/src" for changes`);

  // these watch, rebuild appropriate resources, and reload the window.
  // ensure we don't watch more than once when maybeWatchWithDashboard is called multiple times
  const watchers = [
    watch(srcPath, {recursive:true}, async (eventType:'change'|'rename', filename) => {
      try{
        if(filename===null){
          console.warn(`Skipping null filename while watching. EventType: ${eventType}`);
          return;
        }

        // using raw command instead of npm run build:devlopment for slightly faster rebuild
        console.info(`${join(srcPath,filename)} changed. Reloading VSCode...`);
        execSync(`NODE_ENV='development' node esbuild.cjs`,{cwd:extensionPath});
        await vscode.commands.executeCommand("workbench.action.reloadWindow");
      } catch (e){
        if((e as Error).message==='Canceled'){
          return;
        } else {
          console.log(`Error rebuilding extension`);
          console.error(e);
        }
      }
    }),
    // this watcher doesn't need to recompile extension files, only webview files
    // so it only needs to reload the webview, not the whole window
    // buuut.. that would also take getting the selection, which I don't have time for pre-talk.
    // Just reload the whole thing.
    watch(join(webviewPath,'src'), {recursive:true}, async (eventType:'change'|'rename', filename) => {
      if(filename===null){
        console.warn(`Skipping null filename while watching. EventType: ${eventType}`);
        return;
      }
      console.info(`${join(webviewPath,'src',filename)} changed.\nRebuilding vite and reloading webview.`);
      execSync(`npx vite build --mode development`,{cwd:webviewPath});
      await vscode.commands.executeCommand("workbench.action.reloadWindow");
      // await vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction")
    })
  ];

  return [
    {dispose:()=>{
      console.log(`UNWATCHING "src" and "webview/src" directories`);
      for (const watcher of watchers){
        watcher.close();
        watcher.unref();
      }
      watchers.length = 0;
    }}
  ] satisfies vscode.Disposable[];
};


