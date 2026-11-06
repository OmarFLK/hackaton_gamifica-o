import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Fontes empacotadas no build (sem depender de CDN); fallback de sistema definido em tokens.css.
import '@fontsource-variable/montserrat'
import '@fontsource-variable/open-sans'
import '@fontsource-variable/nunito'
import { App } from './app/App'
import './styles/index.css'
import './styles/app.css'
import './styles/communication.css'
import './styles/preferences.css'

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App/></BrowserRouter></StrictMode>)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js').catch(() => { /* Sem cache, a navegação online continua normal. */ }) })
}
