import { useEffect, useRef, useState } from 'react'
import { micThreshold, rms } from './logic'

export type SensorStatus = 'off' | 'starting' | 'on' | 'denied' | 'unsupported'

/**
 * Nível de som do microfone (RMS simplificado via Web Audio). Apenas sinal interativo.
 * O áudio não é gravado nem enviado. Stream e AudioContext são encerrados ao desligar/desmontar.
 */
export function useMicrophoneLevel(enabled: boolean) {
  const [status, setStatus] = useState<SensorStatus>('off')
  const [level, setLevel] = useState(0)
  const levelRef = useRef(0)
  const thresholdRef = useRef(micThreshold(0))
  const calibrationRef = useRef<number[]>([])

  useEffect(() => {
    if (!enabled) { setStatus('off'); setLevel(0); levelRef.current = 0; return }
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) { setStatus('unsupported'); return }
    let stream: MediaStream | null = null
    let context: AudioContext | null = null
    let frame = 0
    let cancelled = false
    let lastPaint = 0
    setStatus('starting')
    calibrationRef.current = []
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false } }).then(media => {
      if (cancelled) { media.getTracks().forEach(t => t.stop()); return }
      stream = media
      context = new AudioContext()
      const analyser = context.createAnalyser(); analyser.fftSize = 1024
      context.createMediaStreamSource(media).connect(analyser)
      const buffer = new Float32Array(analyser.fftSize)
      const started = performance.now()
      setStatus('on')
      const tick = (now: number) => {
        analyser.getFloatTimeDomainData(buffer)
        const value = rms(buffer)
        levelRef.current = levelRef.current * 0.6 + value * 0.4
        // Calibragem simples: ~1 s de ruído ambiente ao iniciar.
        if (now - started < 1000) calibrationRef.current.push(value)
        else if (calibrationRef.current.length) {
          const samples = calibrationRef.current
          thresholdRef.current = micThreshold(samples.reduce((a, b) => a + b, 0) / samples.length)
          calibrationRef.current = []
        }
        if (now - lastPaint > 80) { setLevel(levelRef.current); lastPaint = now }
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }).catch(() => {
      stream?.getTracks().forEach(t => t.stop())
      if (context && context.state !== 'closed') void context.close().catch(() => undefined)
      if (!cancelled) setStatus('denied')
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach(t => t.stop())
      if (context && context.state !== 'closed') void context.close().catch(() => undefined)
      levelRef.current = 0
    }
  }, [enabled])

  const recalibrate = () => { calibrationRef.current = []; thresholdRef.current = micThreshold(levelRef.current) }
  return { status, level, levelRef, thresholdRef, recalibrate }
}

/** Câmera apenas como fundo visual. Nenhuma detecção de mão/objeto é feita. */
export function useCamera(enabled: boolean) {
  const [status, setStatus] = useState<SensorStatus>('off')
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (!enabled) { setStatus('off'); return }
    if (!navigator.mediaDevices?.getUserMedia) { setStatus('unsupported'); return }
    let stream: MediaStream | null = null
    let cancelled = false
    setStatus('starting')
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 } }, audio: false }).then(media => {
      if (cancelled) { media.getTracks().forEach(t => t.stop()); return }
      stream = media
      if (videoRef.current) { videoRef.current.srcObject = media; void videoRef.current.play().catch(() => undefined) }
      setStatus('on')
    }).catch(() => { if (!cancelled) setStatus('denied') })
    return () => {
      cancelled = true
      stream?.getTracks().forEach(t => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [enabled])
  return { status, videoRef }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

export const SENSOR_MESSAGES: Record<SensorStatus, string> = {
  off: '', starting: 'Pedindo permissão…', on: '',
  denied: 'Permissão negada ou dispositivo indisponível. Tudo bem: continue pelo toque.',
  unsupported: 'Este navegador não oferece esse recurso. Continue pelo toque.',
}
