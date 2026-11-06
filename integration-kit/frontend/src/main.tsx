import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { SessionProvider } from './app/SessionProvider'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><SessionProvider><App/></SessionProvider></BrowserRouter></StrictMode>)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js').catch(() => { /* Sem cache, a navegação online continua normal. */ }) })
}
