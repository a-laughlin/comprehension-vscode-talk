import { Component, ReactNode,ErrorInfo } from 'react';
import { WebViewData } from '../../../src/shared';

type State = {error:undefined|Error};
type Props = {
  children:ReactNode,
  fallback:(resetErrorState:()=>void)=>ReactNode,
  selectedFilePath:WebViewData['filePath']
};
export class ErrorBoundary extends Component<Props,State> {
  constructor(props:Props) {
    super(props);
    this.state = { error: undefined };
  }

  componentDidCatch(error:Error, info:ErrorInfo) {
    console.log('Error Boundary caught:')
    console.error(error);
    console.log(info.digest);
    // Example "info.componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.log(info.componentStack);
    this.setState({error}); // show the fallback ui
  }
  resetState(){
    // do something to reset the state
  }

  render() {
    return this.state.error===undefined
      ? this.props.children
      : this.props.fallback(this.resetState.bind(this));
  }
}

