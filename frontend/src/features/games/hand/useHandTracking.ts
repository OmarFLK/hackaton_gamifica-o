import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision'

export interface TrackingStatus {
  camera: 'off' | 'starting' | 'ready' | 'error'
  model: 'off' | 'loading' | 'ready' | 'error'
  delegate: 'GPU' | 'CPU' | null
  message: string
}
export interface FrameTiming { fps: number; inferenceMs: number }
const OFF: TrackingStatus = { camera: 'off', model: 'off', delegate: null, message: '' }
const WASM = '/mediapipe/1.2.2/wasm'
const MODEL = '/models/hand_landmarker.task'
let cameraQueue: Promise<void> = Promise.resolve()

/** Serializa pedidos pendentes do StrictMode e encerra grants recebidos apos cancelamento. */
async function acquireCamera(cancelled: () => boolean): Promise<MediaStream | null> {
  const previous = cameraQueue
  let release!: () => void
  cameraQueue = new Promise(resolve => { release = resolve })
  await previous
  try {
    if (cancelled()) return null
    const preferred = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } }, audio: false } as const
    let stream: MediaStream
    try { stream = await navigator.mediaDevices.getUserMedia(preferred) }
    catch (error) {
      if (cancelled()) return null
      const name = error instanceof DOMException ? error.name : ''
      if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      } else if (name === 'NotReadableError' || name === 'AbortError') {
        // Alguns drivers ainda liberam a camera apos track.stop(). Uma tentativa curta na retomada.
        await new Promise(resolve => setTimeout(resolve, 250))
        if (cancelled()) return null
        stream = await navigator.mediaDevices.getUserMedia(preferred)
      } else throw error
    }
    if (cancelled()) { stream.getTracks().forEach(track => track.stop()); return null }
    return stream
  } finally { release() }
}

function cameraMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'A câmera não foi permitida. Você pode liberar a permissão ou jogar com toque.'
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Não encontrei uma câmera neste aparelho. Podemos jogar com toque.'
  return 'A câmera está ocupada ou não conseguiu iniciar. Tente novamente ou jogue com toque.'
}

export function useHandTracking(enabled: boolean, videoRef: RefObject<HTMLVideoElement | null>,
  onFrame: (result: HandLandmarkerResult, now: number, timing: FrameTiming) => void) {
  const callback = useRef(onFrame)
  callback.current = onFrame
  const [status, setStatus] = useState<TrackingStatus>(OFF)
  const [attempt, setAttempt] = useState(0)
  const [visible, setVisible] = useState(document.visibilityState !== 'hidden')
  useEffect(() => {
    const changed = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', changed)
    return () => document.removeEventListener('visibilitychange', changed)
  }, [])
  useEffect(() => {
    if (!enabled || !visible) { setStatus(OFF); return }
    const video = videoRef.current
    if (!video || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus({ ...OFF, camera: 'error', message: 'A câmera precisa de HTTPS ou localhost e de um navegador compatível. Jogue com toque.' })
      return
    }
    let cancelled = false
    let stream: MediaStream | null = null
    let detector: HandLandmarker | null = null
    let frame = 0, timer: ReturnType<typeof setTimeout> | null = null
    let lastVideoTime = -1, lastInference = 0, nextInterval = 55
    let fpsStarted = performance.now(), frames = 0, fps = 0, busy = false
    const stop = () => {
      cancelAnimationFrame(frame)
      if (timer) clearTimeout(timer)
      if (video.srcObject === stream) { video.pause(); video.srcObject = null }
      stream?.getTracks().forEach(track => track.stop()); stream = null
      detector?.close(); detector = null
    }
    const fail = (message: string, modelError = false) => {
      if (cancelled) return
      cancelled = true; stop()
      setStatus({ camera: 'error', model: modelError ? 'error' : 'off', delegate: null, message })
    }
    setStatus({ ...OFF, camera: 'starting', message: 'Preparando a câmera e procurando sua mão...' })
    void (async () => {
      try { stream = await acquireCamera(() => cancelled) }
      catch (error) { fail(cameraMessage(error)); return }
      if (!stream) return
      if (cancelled) { stream.getTracks().forEach(track => track.stop()); stream = null; return }
      stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => fail('A câmera foi desligada. Tente novamente ou jogue com toque.'), { once: true }))
      video.srcObject = stream
      timer = setTimeout(() => fail('A câmera demorou para mostrar a imagem. Tente novamente ou jogue com toque.'), 10000)
      try { await video.play() } catch { if (!cancelled) fail('Não consegui exibir a câmera. Tente novamente ou jogue com toque.'); return }
      if (cancelled) return
      if (timer) clearTimeout(timer)
      setStatus({ camera: 'ready', model: 'loading', delegate: null, message: 'Preparando a câmera e procurando sua mão...' })
      timer = setTimeout(() => fail('O reconhecimento demorou para carregar. Tente novamente ou jogue com toque.', true), 30000)
      try {
        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision')
        if (cancelled) return
        const files = await FilesetResolver.forVisionTasks(WASM)
        if (cancelled) return
        // O primeiro WASM pode chegar antes do SW controlar a pagina. Garante seu cache
        // depois de a camera ser escolhida, sem baixar as duas variantes nem dados privados.
        if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then(registration => {
          if (!cancelled) registration.active?.postMessage({ type: 'CACHE_HAND_RUNTIME', files: [files.wasmLoaderPath, files.wasmBinaryPath, MODEL] })
        }).catch(() => {})
        const create = (delegate: 'GPU' | 'CPU') => HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: 'VIDEO', numHands: 2,
          minHandDetectionConfidence: .5, minHandPresenceConfidence: .5, minTrackingConfidence: .5,
        })
        let delegate: 'GPU' | 'CPU' = 'GPU'
        let created: HandLandmarker
        try { created = await create('GPU') }
        catch {
          if (cancelled) return
          delegate = 'CPU'; created = await create('CPU')
        }
        if (cancelled) { created.close(); return }
        detector = created
        if (timer) clearTimeout(timer)
        setStatus({ camera: 'ready', model: 'ready', delegate, message: 'Mostre sua mão para a câmera' })
      } catch {
        fail('Não consegui carregar o reconhecimento de mãos neste aparelho. Tente novamente ou jogue com toque.', true)
        return
      }
      const tick = (now: number) => {
        if (cancelled || document.visibilityState === 'hidden') return
        frame = requestAnimationFrame(tick)
        if (!detector || busy || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
            !video.videoWidth || video.currentTime === lastVideoTime || now - lastInference < nextInterval) return
        busy = true; lastVideoTime = video.currentTime; lastInference = now
        try {
          const started = performance.now()
          const result = detector.detectForVideo(video, now)
          const inferenceMs = performance.now() - started
          frames++
          if (now - fpsStarted >= 1000) { fps = frames * 1000 / (now - fpsStarted); frames = 0; fpsStarted = now }
          nextInterval = inferenceMs > 80 ? Math.min(180, inferenceMs * 1.25) : 55
          callback.current(result, performance.now(), { fps, inferenceMs })
        } catch { fail('O reconhecimento foi interrompido. Podemos tentar novamente ou jogar com toque.', true) }
        finally { busy = false }
      }
      frame = requestAnimationFrame(tick)
    })()
    return () => { cancelled = true; stop() }
  }, [enabled, visible, attempt, videoRef])
  return { status, retry: useCallback(() => setAttempt(value => value + 1), []) }
}
