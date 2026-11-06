import { useEffect, useRef, useState } from 'react'
import { HandHeart, Mic, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { phrases, safeVoiceAnswer, welcome } from './phrases'

interface RecognitionInstance {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
  start: () => void; abort: () => void
}
type RecognitionConstructor = new () => RecognitionInstance
type VoiceWindow = Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }

export function MascotVoice({ onCallAdult, mascotName = 'Pandi' }: { onCallAdult?: () => void; mascotName?: string }) {
  const [text, setText] = useState(welcome)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [adult, setAdult] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const recognition = useRef<RecognitionInstance | null>(null)
  const ttsSupported = 'speechSynthesis' in window
  const Constructor = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition
  const stop = () => { if (ttsSupported) window.speechSynthesis.cancel(); recognition.current?.abort(); setSpeaking(false); setListening(false) }
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const update = () => setVoices(synth.getVoices())
    update(); synth.addEventListener('voiceschanged', update)
    return () => { synth.removeEventListener('voiceschanged', update); synth.cancel() }
  }, [])
  useEffect(() => {
    const pause = () => { if (document.visibilityState === 'hidden') stop() }
    document.addEventListener('visibilitychange', pause)
    return () => { document.removeEventListener('visibilitychange', pause); recognition.current?.abort(); if (ttsSupported) window.speechSynthesis.cancel() }
    // O componente não solicita câmera nem mantém streams de mídia próprios.
  }, [ttsSupported])
  const speak = () => {
    if (!ttsSupported) return
    stop(); setError('')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'; utterance.rate = 0.92
    utterance.voice = voices.find(v => v.lang === 'pt-BR' && v.localService) || voices.find(v => v.lang.startsWith('pt')) || null
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => { setSpeaking(false); setError('O áudio não está disponível agora. Você pode continuar lendo e usando os botões.') }
    window.speechSynthesis.speak(utterance)
  }
  const listen = () => {
    if (!Constructor || !consent) return
    stop(); setError('')
    const instance = new Constructor(); recognition.current = instance
    instance.lang = 'pt-BR'; instance.continuous = false; instance.interimResults = false
    instance.onresult = event => { setText(safeVoiceAnswer(event.results[0][0].transcript)); instance.abort(); setListening(false) }
    instance.onerror = () => { setListening(false); setError('Não consegui ouvir. Você pode escolher qualquer um dos botões abaixo.') }
    instance.onend = () => setListening(false)
    try { instance.start(); setListening(true) } catch { setListening(false); setError('Microfone indisponível. Continue pelos botões.') }
  }
  const callAdult = () => { stop(); setAdult(true); setText(phrases[2].answer); onCallAdult?.() }
  return <div className="voice-world">
    <div className="voice-top"><span className="child-label">UM MOMENTO DE COMPANHIA</span><button className="button ghost" onClick={stop}><Pause size={18}/>Pausar</button></div>
    <div className="voice-scene"><span className="scene-star star-one">✦</span><span className="scene-star star-two">✧</span><div className="mascot-orbit"><img src="/mascote/pandi-principal.png" alt={`Seu companheiro ${mascotName}`} width="170" height="185"/></div><span className="scene-star star-three">✦</span></div>
    <h1>Oi, eu sou o {mascotName}<span className="heading-dot">!</span></h1><p className="child-subtitle">Vamos no seu tempo. Você escolhe.</p>
    <div className="voice-bubble" aria-live="polite"><p>{text}</p><button className="button voice-play" onClick={speaking ? stop : speak} disabled={!ttsSupported}>{speaking ? <VolumeX size={19}/> : <Volume2 size={19}/>}{speaking ? 'Parar áudio' : ttsSupported ? 'Ouvir mensagem' : 'Áudio indisponível · leia acima'}</button></div>
    <div className="voice-choices">{phrases.map((phrase, index) => <button className="voice-choice" key={phrase.question} onClick={() => { stop(); setText(phrase.answer); if (index === 2) callAdult() }}>{index === 0 ? <Play/> : index === 1 ? <Pause/> : <HandHeart/>}{phrase.question}</button>)}</div>
    <div className="voice-mic"><h2>Quer usar a voz?</h2><p>Os botões acima sempre funcionam sem microfone.</p>{Constructor ? <><label className="consent"><input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); if (!e.target.checked) stop() }}/><span>Com autorização do responsável, usar reconhecimento de voz do navegador. Ele pode processar áudio no serviço do fornecedor; o Pendi não recebe nem salva gravações.</span></label><button className="button ghost" disabled={!consent} onClick={listening ? stop : listen}><Mic size={18}/>{listening ? 'Parar de ouvir' : 'Usar microfone'}</button></> : <p className="muted small-text">Reconhecimento de voz indisponível neste navegador. Escolha pelos botões.</p>}{error && <p role="status">{error}</p>}</div>
    <button className="button call-adult" onClick={callAdult}><HandHeart size={20}/>Chamar adulto</button>{adult && <div className="notice" role="alert">Chame um adulto de confiança perto de você. Este botão não envia mensagens nem chama um serviço externo.</div>}
    <p className="muted small-text">Falas originais e voz genérica do navegador · demonstração acompanhada por responsável.</p>
  </div>
}
