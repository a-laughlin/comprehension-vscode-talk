/** random stuff shared by extension and webview. Types. Constants. Utils. */
import {Tagged} from 'type-fest';

/**
 *
 * Types
 *
 */
export type EmptyString = Tagged<string,'EmptyString'>;


export type WebViewData = {
  readonly extensionCommand:'openDashboard'|'analyzedFiles'
  /**
   * selectedFilePath
   * the path of the file we want to analyze
   */
  readonly filePath:string,
  /**
   * commitSummaries
   * summarized commit messages
   */
  readonly commitSummaries:string
  /**
   * prSummaries
   * summarized pr messages
   */
  readonly prSummaries:string
};

export type MessageToWebView = {
  readonly command:WebViewData['extensionCommand'],
  readonly data:WebViewData
};

export type NodePosition = {
  readonly startLine: number,
  readonly startCol: number,
  readonly endLine: number,
  readonly endCol: number,
  readonly startDoc: number,
  readonly endDoc: number
};


/**
 *
 * Constants
 *
 */
export const EMPTY_STRING = '' as EmptyString;
export const EXTENSION_PUBLISHER = "comprehension";
export const EXTENSION_NAME = "comprehension";
export const EXTENSION_ID = `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
export const EXTENSION_STORAGE_KEY = 'extensionStorageKey';
export const DASHBOARD_TITLE = 'Comprehension Lens';

export const WEBVIEW_DATA_DEFAULTS:WebViewData = {
  extensionCommand:'openDashboard',
  filePath:'',
  commitSummaries:'',
  prSummaries:''
};


/**
 *
 * UTILITIES
 *
 */

export const isDefined = <T>(x: T | undefined): x is Exclude<T,undefined> => x !== undefined;

export const pick = <const T extends Record<string,any>,const K extends ReadonlyArray<keyof T>>(obj:T,keys:K):Pick<T,K[number]>=>{
  const acc = Object.create(null);
  let k;
  for (k of keys) acc[k] = obj[k];
  return acc;
};
