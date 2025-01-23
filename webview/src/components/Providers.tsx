import { ReactNode } from 'react';
import { extensionDataContext, useExtensionDataForProvider } from '../hooks/useExtensionData';

export const ExtensionDataProvider = (props:{children:ReactNode}) =>
  <extensionDataContext.Provider value={useExtensionDataForProvider()}>
    {props.children}
  </extensionDataContext.Provider>;
