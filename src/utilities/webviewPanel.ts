import { readdirSync } from 'node:fs';
import { getNonce } from './getNonce';
import { join } from 'node:path';
import { ExtensionContext, Uri, Webview, WebviewPanel, window } from 'vscode';
import { getUri } from './getUri';
import { DASHBOARD_TITLE, MessageToWebView, WebViewData } from '../shared';

export const getWebviewPanel = ({
  extensionContext,
  onDispose,
  panelTitle
}:{
  extensionContext:ExtensionContext,
  onDispose:()=>void,
  panelTitle:string
})=>{
  const currentPanel = window.createWebviewPanel(
    DASHBOARD_TITLE,
    DASHBOARD_TITLE+` (${panelTitle})`,
    {
      viewColumn: 1,
      preserveFocus: true
    },
    {
      enableScripts: true,
      localResourceRoots: [
        Uri.joinPath(extensionContext.extensionUri, "out"),
        Uri.joinPath(extensionContext.extensionUri, "webview/dist")
      ]
    }
  );
  currentPanel.onDidDispose(
    () => {
      currentPanel?.dispose();
      onDispose();
    },
    undefined,
    extensionContext.subscriptions
  );
  return currentPanel;
};



export const getWebviewHTML = ({
  extensionContext,webview,bootstrappedData
}:{
  extensionContext:ExtensionContext,
  webview:Webview,
  bootstrappedData:MessageToWebView['data']
})=>{

  const nonce = getNonce();

  const [cssPath,jsPath] =
    readdirSync(join(extensionContext.extensionPath, 'webview', 'dist', 'assets'))
    // sort them so css is before js
    .sort((a,b)=>a.replace(/^.*\./,'').localeCompare(b.replace(/^.*\./,'')))
    // convert them to Uris for the webview's constraints
    .map(fileName=>getUri(webview, extensionContext.extensionUri, ["webview", "dist", "assets", fileName]));

  // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
  return /*html*/ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
      <link rel="stylesheet" type="text/css" href="${cssPath}" nonce="${nonce}">
      <title>${DASHBOARD_TITLE}</title>
    </head>
    <body>
      <div id="root"></div>

      <script type="text/javascript" nonce="${nonce}">
        window.bootstrapedNonce="${nonce}";
        window.bootstrappedData = ${JSON.stringify( bootstrappedData )};
      </script>
      
      <script type="module" nonce="${nonce}" src="${jsPath}"></script>
    </body>
  </html>
`
}
