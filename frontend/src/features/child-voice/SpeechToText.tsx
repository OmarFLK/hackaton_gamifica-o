import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, Square, X } from 'lucide-react'
import { api, errorText } from '../../lib/api'
import { CHILD_PAUSE_EVENT } from '../../components/layouts/ChildLayout'

interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: { results: { length: number; [key: number]: { [key: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
  start(): void; stop(): void; abort(): void
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }

export function SpeechToText({ patientId, disabled, onText }: { patientId: number; disabled?: boolean; onText: (text: string) => void }) {
  const [consent, setConsent] = useState(false)
  const [localReady, setLocalReady] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'recording' | 'transcribing'>('idle')
  const [notice, setNotice] = useState('')
  const [seconds, setSeconds] = useState(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const recognition = useRef<Recognition | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null)
  const shouldUpload = useRef(false)
  const mounted = useRef(true)
  const request = useRef<AbortController | null>(null)
  const chunks = useRef<Blob[]>([])
  const generation = useRef(0)
  const requesting = useRef(false)
  const Native = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition
  const canRecord = !!navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window
  const clean = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    if (ticker.current) clearInterval(ticker.current)
    stream.current?.getTracks().forEach(track => track.stop()); stream.current = null
  }, [])
  const stop = useCallback((upload: boolean) => {
    if (!upload) { generation.current += 1; requesting.current = false }
    shouldUpload.current = upload
    if (recorder.current?.state === 'recording') recorder.current.stop()
    if (upload) recognition.current?.stop()
    else recognition.current?.abort()
    if (!upload) { request.current?.abort(); request.current = null }
    clean(); if (mounted.current && !upload) { setPhase('idle'); setNotice('Gravação cancelada. Nenhuma mensagem foi enviada.') }
  }, [clean])
  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    api<{ available: boolean }>('/api/speech/status', { signal: controller.signal }).then(data => { if (!controller.signal.aborted) setLocalReady(data.available) }).catch(() => undefined)
    const cancel = () => stop(false)
    const hidden = () => { if (document.visibilityState === 'hidden') stop(false) }
    window.addEventListener(CHILD_PAUSE_EVENT, cancel); document.addEventListener('visibilitychange', hidden)
    return () => { mounted.current = false; controller.abort(); stop(false); window.removeEventListener(CHILD_PAUSE_EVENT, cancel); document.removeEventListener('visibilitychange', hidden) }
  }, [stop])
  const start = async () => {
    if (!consent || disabled || requesting.current) return
    setNotice(''); setSeconds(0)
    const session = ++generation.current
    if (localReady && canRecord) {
      requesting.current = true; setNotice('Pedindo permissão para o microfone…')
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true })
        requesting.current = false
        if (!mounted.current || generation.current !== session) { media.getTracks().forEach(track => track.stop()); return }
        stream.current = media
        setNotice('')
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type))
        const recording = new MediaRecorder(media, mimeType ? { mimeType } : undefined)
        recorder.current = recording; chunks.current = []; shouldUpload.current = false
        recording.ondataavailable = event => { if (event.data.size) chunks.current.push(event.data) }
        recording.onerror = () => { stop(false); if (mounted.current) setNotice('Não consegui gravar. Tente novamente ou digite.') }
        recording.onstop = async () => {
          clean()
          if (!shouldUpload.current || !mounted.current) return
          setPhase('transcribing')
          const controller = new AbortController(); request.current = controller
          const data = new FormData(); data.append('patient_id', String(patientId)); data.append('audio', new Blob(chunks.current, { type: recording.mimeType }), 'fala.webm')
          chunks.current = []
          try {
            const response = await api<{ text: string }>('/api/speech/transcribe', { method: 'POST', body: data, timeoutMs: 120000, signal: controller.signal })
            if (mounted.current && !controller.signal.aborted) { onText(response.text); setNotice('Sua fala virou texto. Confira e corrija antes de tocar em Enviar.') }
          } catch (error) { if (mounted.current && !controller.signal.aborted) setNotice(errorText(error)) }
          finally { if (mounted.current && request.current === controller) setPhase('idle') }
        }
        recording.start(1000); setPhase('recording')
        ticker.current = setInterval(() => setSeconds(value => value + 1), 1000)
        timeout.current = setTimeout(() => stop(true), 30000)
      } catch { requesting.current = false; clean(); setPhase('idle'); setNotice('Não foi possível usar o microfone. Peça ajuda ao adulto ou digite sua mensagem.') }
    } else if (Native) {
      const instance = new Native(); recognition.current = instance
      instance.lang = 'pt-BR'; instance.continuous = false; instance.interimResults = false
      instance.onresult = event => { if (mounted.current) { onText(event.results[event.results.length - 1][0].transcript); setNotice('Confira o texto antes de tocar em Enviar.'); setPhase('idle') } }
      instance.onerror = () => { if (mounted.current) { setNotice('Não consegui ouvir. Tente de novo ou digite com ajuda de um adulto.'); setPhase('idle') } }
      instance.onend = () => { clean(); if (mounted.current) setPhase('idle') }
      try { instance.start(); setPhase('recording'); timeout.current = setTimeout(() => stop(true), 30000) } catch { setNotice('Reconhecimento indisponível. Você pode digitar.'); setPhase('idle') }
    } else setNotice('O microfone não está disponível aqui. Você pode digitar com ajuda de um adulto.')
  }
  return <section className="speech-input"><label className="speech-consent"><input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); if (!e.target.checked) stop(false) }} disabled={disabled}/><span>Meu responsável está comigo e autoriza usar o microfone.</span></label><p className="muted small-text">{localReady ? 'O áudio vira texto no servidor Pendi e não é enviado ao modelo da Mauá. Revise o texto antes de enviar.' : 'Sem transcrição local preparada, o navegador pode usar seu próprio serviço de voz. Digitar continua disponível.'}</p><div className="speech-actions">{phase === 'recording' ? <><span role="status">Ouvindo… {seconds}s / 30s</span><button type="button" className="button primary" onClick={() => stop(true)}><Square size={17}/>Parar e transcrever</button><button type="button" className="button ghost" onClick={() => stop(false)}><X size={17}/>Cancelar</button></> : phase === 'transcribing' ? <><span role="status">Transformando sua fala em texto…</span><button type="button" className="button ghost" onClick={() => stop(false)}>Cancelar transcrição</button></> : <button type="button" className="button ghost" disabled={!consent || disabled || (!canRecord && !Native)} onClick={() => void start()}><Mic size={20}/>Falar com o Pendi</button>}</div>{notice && <p role="status" className="speech-notice">{notice}</p>}</section>
}
