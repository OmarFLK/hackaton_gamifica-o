import { useEffect, useRef, useState } from 'react'
import { HandHeart, Send, Sparkles, Volume2 } from 'lucide-react'
import { api, errorText, post } from '../../lib/api'
import type { AIAnswer, AIStatus, AITurn } from '../../lib/types'
import { requestAdult } from '../../components/layouts/ChildLayout'
import { SpeechToText } from '../child-voice/SpeechToText'
import { narrate } from '../../lib/preferences'

export function PendiChildChat({ patientId, offline }: { patientId: number; offline: boolean }) {
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [turns, setTurns] = useState<AITurn[]>([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    const quiet = () => { if (document.visibilityState === 'hidden') window.speechSynthesis?.cancel() }
    document.addEventListener('visibilitychange', quiet)
    const controller = new AbortController()
    if (!offline) api<AIStatus>('/api/ai/status', { signal: controller.signal }).then(data => { if (!controller.signal.aborted) setStatus(data) }).catch(() => { if (!controller.signal.aborted) setError('O Pendi não conseguiu se conectar agora. Peça ajuda ao adulto.') })
    return () => { mounted.current = false; controller.abort(); window.speechSynthesis?.cancel(); document.removeEventListener('visibilitychange', quiet) }
  }, [offline, patientId])
  const ready = !offline && !!status?.configured
  const send = async (event: React.FormEvent) => {
    event.preventDefault(); if (!ready || busy || !question.trim()) return
    setBusy(true); setError('')
    const text = question.trim()
    try {
      const response = await post<AIAnswer>(`/api/ai/child/${patientId}/chat`, { question: text, history: turns.slice(-8).map(turn => ({ ...turn, content: turn.content.slice(0, 2000) })) }, { timeoutMs: 100000 })
      if (mounted.current) { setTurns(previous => [...previous, { role: 'user', content: text }, { role: 'assistant', content: response.answer }]); setQuestion('') }
    } catch (error) { if (mounted.current) setError(errorText(error)) } finally { if (mounted.current) setBusy(false) }
  }
  const speak = (text: string) => {
    narrate(text, .9)
  }
  return <section className="pendi-child-chat"><header><img src="/mascote/pandi-principal.png" alt="Pandi, seu companheiro" width="96" height="104" className="mascot-img pendi-chat-mascot"/><div><span className="child-label">SEU AMIGO VIRTUAL</span><h1>Oi, eu sou o Pendi!</h1><p>Podemos conversar, imaginar ou fazer uma pausa. Você escolhe.</p></div></header><div className="child-chat-log" role="log" aria-label="Conversa com o Pendi" aria-live="polite">{!turns.length && <div className="child-chat-welcome"><Sparkles size={29}/><p>Quer inventar uma história comigo?</p><div>{['Vamos imaginar uma aventura nas nuvens?', 'Hoje estou com saudade.', 'Quero descansar um pouquinho.'].map(text => <button className="kid-button" key={text} disabled={!ready || busy} onClick={() => setQuestion(text)}>{text}</button>)}</div></div>}{turns.map((turn, index) => <article className={`child-chat-message ${turn.role === 'user' ? 'from-child' : ''}`} key={index}><span>{turn.role === 'user' ? 'Você' : 'Pendi'}</span><p>{turn.content}</p>{turn.role === 'assistant' && 'speechSynthesis' in window && <button type="button" className="kid-button" onClick={() => speak(turn.content)}><Volume2 size={18}/>Ouvir</button>}</article>)}{busy && <p role="status">O Pendi está preparando uma resposta…</p>}</div>{(!ready || offline) && <p className="kid-chat-warning" role="status">{offline ? 'Estamos sem conexão. Você pode continuar nas brincadeiras por toque.' : 'Estamos conectando o Pendi. Se precisar, chame um adulto.'}</p>}{error && <p className="kid-chat-warning" role="alert">{error}</p>}<form onSubmit={send}><label htmlFor="child-ai-message">O que você quer contar para o Pendi?<textarea id="child-ai-message" value={question} onChange={e => setQuestion(e.target.value)} maxLength={1500} disabled={busy || !ready} placeholder="Escreva ou use o microfone abaixo…"/></label><div className="child-chat-send"><p>Confira o texto com seu adulto antes de enviar.</p><button className="kid-big-button" disabled={!ready || busy || !question.trim()}><Send size={21}/>{busy ? 'Esperando…' : 'Enviar para o Pendi'}</button></div></form>{!offline && <SpeechToText patientId={patientId} disabled={busy} onText={setQuestion}/>}<button className="kid-button kid-call" onClick={requestAdult}><HandHeart size={21}/>Quero chamar um adulto</button><p className="child-chat-privacy">Sou um amigo virtual. Não conte seu endereço, telefone ou senhas. Um adulto de confiança pode ficar com você.</p></section>
}
