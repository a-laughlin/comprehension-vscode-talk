import type { WebviewApi } from "vscode-webview";

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;
  public inBrowser = true;
  constructor() {
    // Check if the acquireVsCodeApi function exists in the current development
    // context (i.e. VS Code development window or web browser)
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
      this.inBrowser = false;
    }
  }

  /**
   * Post a message (i.e. send arbitrary data) to the owner of the webview.
   *
   * @remarks When running webview code inside a web browser, postMessage will instead
   * log the given message to the console.
   *
   * @param message Abitrary data (must be JSON serializable) to send to the extension context.
   */
  public postMessage(message: unknown): void {
    if(process.env.NODE_ENV === 'development'){
      console.log(`vscode.postMessage posting MessageFromWebView`,message);
    }
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    }
  }

  /**
   * Get the persistent state stored for this webview, or `undefined` if no state has been set.
   */
  public getState<T>(): T | undefined {
    return this.vsCodeApi?.getState() as T | undefined;
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   */
  public setState<T>(newState: T): void {
    this.vsCodeApi?.setState(newState);
  }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper();
