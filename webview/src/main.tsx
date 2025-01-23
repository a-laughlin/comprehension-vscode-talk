import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppWithTheme from './App'
import { ExtensionDataProvider } from './components/Providers'

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <ExtensionDataProvider>
      <AppWithTheme />
    </ExtensionDataProvider>
  </StrictMode>,
)
