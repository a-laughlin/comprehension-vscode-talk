// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { relative } from 'node:path';
import vscode,{commands, ExtensionContext, window, WebviewPanel } from "vscode";
import { EXTENSION_ID, WEBVIEW_DATA_DEFAULTS } from "./shared";
import { maybeWatch } from './utilities/maybeWatch';
import { postMessageToWebView } from './utilities/messageToWebview';
import { getWebviewHTML, getWebviewPanel } from './utilities/webviewPanel';
import { findModuleRoot, getRelatedResources } from './utilities/getRelatedResources';

export async function activate(extensionContext: ExtensionContext) {
  console.log(`Registering extension "${EXTENSION_ID}"`);
  try{

    let currentPanels:Record<string,WebviewPanel> = {};

    extensionContext.subscriptions.push(
      ...maybeWatch(extensionContext.extensionPath),
      commands.registerCommand("comprehension.backstory", async () => {

        const editor = window.activeTextEditor;
        const document = editor?.document;
        if(!editor || !document) {
          window.showErrorMessage('Click into a document to enable backstory');
          return;
        };

        const fullFilePath = document.uri.fsPath!;
        const selection = document.getText(editor.selection) || document.lineAt(editor.selection.active.line).text;
        const repoRootPath = findModuleRoot(fullFilePath);
        const gitFilePath = relative(repoRootPath, fullFilePath);


        currentPanels[fullFilePath] ??= getWebviewPanel({
          extensionContext,
          panelTitle:fullFilePath,
          onDispose:()=>{delete currentPanels[fullFilePath];}
        });

        const currentPanel = currentPanels[fullFilePath];

        currentPanel.reveal();

        currentPanel.webview.html = getWebviewHTML({
          extensionContext,
          webview:currentPanel.webview,
          bootstrappedData:WEBVIEW_DATA_DEFAULTS
        });


        const {commits,prs} = await getRelatedResources(repoRootPath, gitFilePath, selection);


        // select the 4o chat model
        let [model] = await vscode.lm.selectChatModels({
          vendor: 'copilot',
          family: 'gpt-4o',
        });



        if (model) {
          // accumulate commit summaries
          const commitChats = [
            vscode.LanguageModelChatMessage.User('please summarize the following commit messages:'),
            vscode.LanguageModelChatMessage.User(
              commits
              .map(({message})=>message)
              .join('\n\n')
            ),
          ];
          // send the messages array to the model and get the response
          const commitChatResponse = await model.sendRequest( commitChats, {}, new vscode.CancellationTokenSource().token);

          // handle chat response
          let commitResponseText = '';
          for await (const fragment of commitChatResponse.text) {
            commitResponseText += fragment;
            // wait to make each word print separately instead of in jarring chunks
            await new Promise(resolve => setTimeout(resolve, 100));
            await postMessageToWebView(
              currentPanel.webview,
              'analyzedFiles',
              {commitSummaries: commitResponseText,prSummaries:'',filePath: gitFilePath}
            );
          }

          // accumulate PR summaries
          const prChats = [
            vscode.LanguageModelChatMessage.User('please summarize the following pr messages:'),
            vscode.LanguageModelChatMessage.User(
              prs
              .map((pr)=>pr.associatedPullRequests.edges[0]!.node.bodyText)
              .join('\n\n')
            ),
          ];
          // send the messages array to the model and get the response
          const prChatResponse = await model.sendRequest( prChats, {}, new vscode.CancellationTokenSource().token);

          // handle chat response
          let prResponseText = '';
          for await (const fragment of prChatResponse.text) {
            prResponseText += fragment;
            // wait to make each word print separately instead of in jarring chunks
            await new Promise(resolve => setTimeout(resolve, 100));
            await postMessageToWebView(
              currentPanel.webview,
              'analyzedFiles',
              {commitSummaries: commitResponseText,prSummaries:prResponseText,filePath: gitFilePath}
            );
          }
        }
      })

    );
  } catch(e){
    console.log(`Unexpected error initializing extension "${EXTENSION_ID}"`);
    console.error(e);
  }

};


// This method is called when your extension is deactivated
export function deactivate() {}
