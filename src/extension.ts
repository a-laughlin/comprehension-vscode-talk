// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { relative } from 'node:path';
import vscode,{commands, ExtensionContext, window, WebviewPanel } from "vscode";
import { EXTENSION_ID, WEBVIEW_DATA_DEFAULTS } from "./shared";
import { maybeWatch } from './utilities/maybeWatch';
import { postMessageToWebView } from './utilities/webviewCommunication';
import { getWebviewHTML, getWebviewPanel } from './utilities/webviewPanel';
import { findModuleRoot, getRelatedResources } from './utilities/git_fns';

type ToolParams = {
  pattern: string;
}
export class BackstoryTool implements vscode.LanguageModelTool<ToolParams> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<ToolParams>,
	) {

		return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart('tool result:'+options.input.pattern)
    ]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<ToolParams>
	) {
		return {
			invocationMessage: `Searching workspace for "${options.input.pattern}"`,
		};
	}
}

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


        const {commitMessages,issues,prs} = await getRelatedResources(repoRootPath, gitFilePath, selection);

        // select the 4o chat model
        let [model] = await vscode.lm.selectChatModels({
          vendor: 'copilot',
          family: 'gpt-4o',
        });

        // init the chat message
        const messages = [
          vscode.LanguageModelChatMessage.User('please summarize the following commit messages, keeping any numbers present in them:'),
          vscode.LanguageModelChatMessage.User(commitMessages.join('\n\n')),
        ];


        if (model) {
          // send the messages array to the model and get the response
          let chatResponse = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
          );

          // handle chat response
          let accumulatedResponse = '';
          for await (const fragment of chatResponse.text) {
            accumulatedResponse += fragment;
            // wait to make each word print separately instead of in jarring chunks
            await new Promise(resolve => setTimeout(resolve, 100));
            await postMessageToWebView(
              currentPanel.webview,
              'analyzedFiles',
              {summary: accumulatedResponse,filePath: gitFilePath}
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
