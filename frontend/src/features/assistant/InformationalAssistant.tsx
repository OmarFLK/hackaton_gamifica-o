import { useState } from 'react'
import { BookOpen, ArrowUpRight, Send, ShieldCheck } from 'lucide-react'
import { post, errorText } from '../../lib/api'
import { offlineFaq } from '../../lib/demoOffline'
import type { Answer } from '../../lib/types'
import { ErrorState } from '../../components/common/Feedback'

export function InformationalAssistant({ offline = false }: { offline?: boolean }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ask = async (text: string, index?: number) => {
    if (!text.trim() || busy) return
    setQuestion(text); setError(''); setBusy(true); setAnswer(null)
    try {
      if (offline && index !== undefined) setAnswer({ answer: offlineFaq[index][1], source: 'FAQ Pendi — demonstração offline', escalate: false, is_demo: true })
      else if (!offline) setAnswer(await post<Answer>('/api/assistant/ask', { question: text }))
    } catch (error) { setError(errorText(error)) } finally { setBusy(false) }
  }
  return <>
    <div className="page-heading"><div><span className="eyebrow">INFORMAÇÃO SEM COMPLICAÇÃO</span><h1>Como podemos ajudar<span className="heading-dot">?</span></h1><p className="muted">Conheça os recursos do Pendi, no seu tempo.</p></div><BookOpen className="page-heading-icon" size={42}/></div>
    <div className="notice"><ShieldCheck size={24}/><p><strong>FAQ automatizado de demonstração.</strong> Respostas estáticas sobre o uso do sistema. Não oferece diagnóstico, doses ou orientação individual de saúde.</p></div>
    <div className="faq-grid">{offlineFaq.map(([title], i) => <button key={title} className="faq-card" disabled={busy} onClick={() => void ask(title, i)}><span>{String(i + 1).padStart(2, '0')}</span><strong>{title}</strong><ArrowUpRight size={20}/></button>)}</div>
    <section className="card"><h2>Encontre uma resposta</h2><form className="faq-form" onSubmit={e => { e.preventDefault(); void ask(question) }}><label htmlFor="faq-question">Sua pergunta sobre o sistema</label><div className="input-action"><input id="faq-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={1000} placeholder={offline ? 'Escolha uma das perguntas acima' : 'Ex.: como funciona o lembrete?'} disabled={offline || busy} required/><button className="button primary" disabled={offline || busy || !question.trim()}><Send size={18}/>{busy ? 'Consultando…' : 'Perguntar'}</button></div></form>{offline && <p className="muted small-text">Sem API, apenas as perguntas curadas acima estão disponíveis.</p>}{error && <ErrorState message={error}/>}{answer && <div className={`faq-answer ${answer.escalate ? 'escalate' : ''}`} role="status"><span className="eyebrow">{answer.escalate ? 'FALE COM A EQUIPE RESPONSÁVEL' : 'RESPOSTA DA FAQ'}</span><p>{answer.answer}</p><small>{answer.source} · conteúdo demonstrativo</small></div>}</section>
  </>
}
