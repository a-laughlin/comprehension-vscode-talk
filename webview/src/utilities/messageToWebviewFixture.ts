import { WebViewData } from '../../../src/shared';

export const MessageToWebviewFixture = ({
  extensionCommand: 'openDashboard',
  filePath:'/foo/bar/baz/test.ts',
  summary:'some summary',
}) satisfies WebViewData;
