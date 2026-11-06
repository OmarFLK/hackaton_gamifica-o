import { readFile, readdir, mkdir, copyFile, writeFile } from 'node:fs/promises'
const project = JSON.parse(await readFile('package.json', 'utf8'))
const installed = JSON.parse(await readFile('node_modules/@mediapipe/tasks-vision/package.json', 'utf8'))
if (installed.version !== project.dependencies['@mediapipe/tasks-vision'] || installed.version !== '1.2.2') {
  throw new Error('Versao MediaPipe divergente: alinhe package-lock, runtime e hook antes de compilar.')
}
const destination = `public/mediapipe/${installed.version}/wasm`
await mkdir(destination, { recursive: true })
for (const file of await readdir('node_modules/@mediapipe/tasks-vision/wasm')) {
  if (file.endsWith('.js') || file.endsWith('.wasm')) await copyFile(`node_modules/@mediapipe/tasks-vision/wasm/${file}`, `${destination}/${file}`)
}
await writeFile(`public/mediapipe/${installed.version}/NOTICE.txt`, 'MediaPipe Tasks Vision ' + installed.version + '\nGoogle LLC. Pacote npm sob Apache-2.0.\nhttps://github.com/google-ai-edge/mediapipe\n')
process.stdout.write(`MediaPipe ${installed.version}: WASM local preparado.\n`)
