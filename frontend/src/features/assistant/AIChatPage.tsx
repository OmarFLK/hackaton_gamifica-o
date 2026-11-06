import { useEffect, useRef, useState } from 'react'
import { Bot, Link2, RefreshCw, Send, Sparkles } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { api, errorText, post } from '../../lib/api'
import type { AIAnswer, AIStatus, AITurn } from '../../lib/types'
import { ErrorState } from '../../components/common/Feedback'

interface DisplayTurn extends AITurn { source?: string; escalate?: boolean; citations?: { id: string; title: string }[] }
const suggestions = ['Como organizar minhas dúvidas para conversar com a equipe?', 'Como usar o Pendi para acompanhar a rotina?', 'Quero entender a diferença entre mensagens e avisos.']

export function AIChatPage() {
  const { offline } = useAuth()
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [checking, setChecking] = useState(!offline)
  const [turns, setTurns] = useState<DisplayTurn[]>([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  useEffect(() => {
    if (offline) { setChecking(false); setStatus(null); return }
    const controller = new AbortController(); setChecking(true)
    api<AIStatus>('/api/ai/status', { signal: controller.signal }).then(data => { if (!controller.signal.aborted) { setStatus(data); setError('') } }).catch(error => { if (!controller.signal.aborted) setError(errorText(error)) }).finally(() => { if (!controller.signal.aborted) setChecking(false) })
    return () => controller.abort()
  }, [offline, revision])
  const ready = !offline && !!status?.configured
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!ready || busy || !question.trim()) return
    const text = question.trim(); setBusy(true); setError('')
    const history = turns.slice(-10).map(turn => ({ role: turn.role, content: turn.content.slice(0, 2000) }))
    try {
      const response = await post<AIAnswer>('/api/ai/chat', { question: text, history }, { timeoutMs: 100000 })
      if (!mounted.current) return
      setTurns(previous => [...previous, { role: 'user', content: text }, { role: 'assistant', content: response.answer, source: response.source, escalate: response.escalate, citations: response.citations }]); setQuestion('')
    } catch (error) { if (mounted.current) setError(errorText(error)) }
    finally { if (mounted.current) setBusy(false) }
  }
  return <><div className="page-heading"><div><span className="eyebrow">ASSISTENTE COM INTELIGÊNCIA ARTIFICIAL</span><h1>Converse com o Pendi<span className="heading-dot">.</span></h1><p className="muted">Um espaço de apoio para dúvidas gerais e para conhecer o Pendi.</p></div><span className={`ai-connection ${ready ? 'ready' : ''}`}><Link2 size={16}/>{offline ? 'Sem conexão no modo offline' : checking ? 'Verificando integração…' : ready ? 'Integração configurada' : 'Aguardando conexão'}</span></div>
    <div className="notice"><Bot size={24}/><p><strong>Este é o assistente de IA, separado da conversa com a equipe.</strong> Nenhum profissional recebe o que você digita aqui. Não inclua dados pessoais. Para falar com seu médico ou família, abra Mensagens.</p></div>
    {!ready && !checking && <section className="card ai-pending"><Sparkles size={33}/><div><h2>A conexão com a IA será ativada em breve</h2><p>A tela está preparada. O envio ficará disponível quando a API de IA for conectada.</p></div><button className="button ghost small" disabled={offline} onClick={() => setRevision(n => n + 1)}><RefreshCw size={16}/>Verificar conexão</button></section>}
    <section className="card ai-chat-card"><div className="section-heading"><h2><Bot size={21}/>{status?.provider_label || 'Assistente Pendi'}</h2><button className="text-button" disabled={busy || !turns.length} onClick={() => setTurns([])}>Limpar conversa</button></div><div className="ai-conversation" role="log" aria-label="Conversa com a IA" aria-live="polite">{!turns.length && <div className="ai-welcome"><Bot size={40}/><h2>Como posso ajudar?</h2><p>{ready ? 'Escolha uma sugestão ou escreva sua pergunta.' : 'Assim que a integração estiver pronta, você poderá conversar aqui.'}</p><div className="ai-suggestions">{suggestions.map(suggestion => <button className="button ghost" key={suggestion} disabled={!ready} onClick={() => setQuestion(suggestion)}>{suggestion}</button>)}</div></div>}{turns.map((turn, index) => <article key={index} className={`message-bubble ${turn.role === 'user' ? 'mine' : ''} ${turn.escalate ? 'ai-escalation' : ''}`}><span className="message-author">{turn.role === 'user' ? 'Você' : turn.source || 'Assistente'}</span><p>{turn.content}</p>{!!turn.citations?.length && <details className="rag-sources"><summary>Base consultada pelo Pendi</summary><ul>{turn.citations.map(item => <li key={item.id}>{item.title}</li>)}</ul></details>}</article>)}{busy && <p className="muted" role="status">Consultando a IA…</p>}</div>{error && <ErrorState message={error}/>}<form onSubmit={submit} className="message-compose"><label htmlFor="ai-question">Sua mensagem para o Pendi</label><textarea id="ai-question" value={question} maxLength={1500} onChange={e => setQuestion(e.target.value)} disabled={!ready || busy} placeholder={ready ? 'Escreva uma dúvida geral…' : 'Aguardando a conexão com a API de IA'}/><div className="compose-footer"><span className="muted small-text">Conversa somente nesta sessão · não substitui avaliação profissional.</span><button className="button primary" disabled={!ready || busy || !question.trim()}><Send size={17}/>{busy ? 'Aguardando…' : 'Enviar para o Pendi'}</button></div></form></section></>
}
