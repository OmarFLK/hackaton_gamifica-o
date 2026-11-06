import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const api = env.VITE_API_URL || 'http://localhost:8000'
  const sources = ["'self'", 'blob:']
  if (!api.startsWith('/')) {
    const url = new URL(api)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('VITE_API_URL deve usar HTTP(S).')
    sources.push(url.origin)
  }
  if (command === 'serve') sources.push('ws://localhost:*', 'ws://127.0.0.1:*')
  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-vision-network-policy',
      // Bloqueia inclusive a telemetria do SDK; permite apenas a origem e a API configurada.
      transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: `connect-src ${sources.join(' ')};` }, injectTo: 'head-prepend' }],
    }],
    server: { strictPort: true },
  }
})
