import vscode from 'vscode';
import { MessageToWebView } from '../shared';

export const dataWithCommand = (
  command:MessageToWebView['command'],
  data:Omit<MessageToWebView['data'],'extensionCommand'>
):MessageToWebView['data']=>({extensionCommand:command,...data});

export const postMessageToWebView = async (
  webView:vscode.Webview,
  command:MessageToWebView['command'],
  data:Omit<MessageToWebView['data'],'extensionCommand'>
) =>{
  const _data = dataWithCommand(command,data);
  console.log(`MessageToWebview`,_data);
  const msg = {
    command,
    data:JSON.stringify(_data),
  };
  await webView.postMessage(msg);
};
