import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tailwind.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@theme/ThemeProvider'
import { ToastProvider } from '@components/feedback'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider position="top-right" maxVisible={3}>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
