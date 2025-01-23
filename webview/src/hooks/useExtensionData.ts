import { useCallback, useEffect, useMemo, useState,createContext, useContext } from 'react';
import {MessageToWebView, WEBVIEW_DATA_DEFAULTS, WebViewData } from '../../../src/shared';
import { vscode } from '../utilities/vscode';
import { MessageToWebviewFixture } from '../utilities/messageToWebviewFixture';

type SetWebviewDataArgs =
  | Partial<WebViewData>
  | ((prevData:WebViewData)=>Partial<WebViewData>);

type ExtensionDataContextType = {
  data:WebViewData,
  setComponentAndTabCache:(data:SetWebviewDataArgs)=>void,
}

export const extensionDataContext = createContext({
  data:WEBVIEW_DATA_DEFAULTS,
  setComponentAndTabCache:(data)=>{},
} satisfies ExtensionDataContextType);

const mergeToNextState = (prevData:WebViewData,newData:SetWebviewDataArgs):WebViewData=>{
  return typeof newData === 'function'
    ? ({...prevData,...newData(prevData)})
    : ({...prevData,...newData});
}

export const useExtensionData = ()=>useContext(extensionDataContext);

export const useExtensionDataForProvider = ():ExtensionDataContextType=>{
  const initialState = useMemo(()=>{
    return {
      ...WEBVIEW_DATA_DEFAULTS,
      // @ts-expect-error window.bootstrappedData is defined in extension.ts html section
      ...globalThis.bootstrappedData as unknown as WebViewData,
      ...(
        vscode.inBrowser
          ? MessageToWebviewFixture
          : vscode.getState<MessageToWebView['data']>()
      )
     }
  },[]);

  const [data,setComponentData] = useState<MessageToWebView['data']>(initialState);

  const setComponentAndTabCache = useCallback(( newData:SetWebviewDataArgs ):void=>{
    setComponentData((prevData)=>{
      const nextState = mergeToNextState(prevData,newData);
      vscode.setState(nextState);
      return nextState;
    });
  },[setComponentData]);

  useEffect(() => {
    // listens for data from comprehension/src/extension.ts
    const messageListener = (message:MessageEvent<{command:MessageToWebView['command'],data:string}>) => {
      if(vscode.inBrowser){return;}
      const newData:MessageToWebView['data'] = JSON.parse(message.data.data) as WebViewData;
      // persist for the duration of the webview in case user switches tabs
      setComponentAndTabCache((existingData)=>{
        const command = message.data.command;
        console.log(`setting MessageToWebView data:`,command,newData);
        return {...existingData,...newData,extensionCommand:command} satisfies WebViewData;
      });

    };
    window.addEventListener('message', messageListener);
    return ()=>{window.removeEventListener('message', messageListener);}
  }, [setComponentAndTabCache]);

  return {
    data,
    setComponentAndTabCache,
  };
};
