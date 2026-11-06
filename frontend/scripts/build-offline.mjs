import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const assets = (await readdir('dist/assets')).map(file => `/assets/${file}`)
const mascotFiles = (await readdir('dist/mascote')).map(file => `/mascote/${file}`)
const publicFiles = ['/index.html', '/manifest.webmanifest', '/brand/pendi-wordmark.png', '/brand/pendi-symbol.png', ...mascotFiles]
const version = createHash('sha256').update(await readFile('dist/index.html')).digest('hex').slice(0, 12)
// A lista é fechada. Nenhuma resposta da API ou recurso autenticado entra no cache.
const worker = `const CACHE = 'pendi-public-${version}';
const PUBLIC_FILES = ${JSON.stringify([...publicFiles, ...assets])};
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC_FILES))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pendi-public-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api') || request.headers.has('Authorization')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }
  if (!PUBLIC_FILES.includes(url.pathname)) return;
  event.respondWith(caches.match(url.pathname).then(cached => cached || fetch(request)));
});
`
await writeFile('dist/sw.js', worker)
process.stdout.write(`Offline: ${publicFiles.length + assets.length} arquivos públicos; API excluída.\n`)
