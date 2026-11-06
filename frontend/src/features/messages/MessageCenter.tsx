import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, RefreshCw, Send } from 'lucide-react'
import { api, errorText, post } from '../../lib/api'
import type { Message } from '../../lib/types'
import { EmptyState, ErrorState, Loading } from '../../components/common/Feedback'
import { refreshNotifications } from '../notifications/events'

export function MessageCenter({ patientId, userId, offline = false }: { patientId: number; userId: number; offline?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(!offline)
  const [error, setError] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [updated, setUpdated] = useState<Date | null>(null)
  const mounted = useRef(true)
  const pending = useRef<AbortController | null>(null)
  const refresh = useCallback(async () => {
    if (offline) return
    pending.current?.abort()
    const controller = new AbortController(); pending.current = controller
    try {
      const data = await api<Message[]>(`/api/patients/${patientId}/messages`, { signal: controller.signal })
      if (!controller.signal.aborted && mounted.current) {
        setMessages(data); setUpdated(new Date()); setError('')
        if (data.length && document.visibilityState === 'visible') {
          const response = await post<{ marked_read: number }>(`/api/patients/${patientId}/messages/read`, { through_message_id: data[data.length - 1].id })
          if (response.marked_read) refreshNotifications()
        }
      }
    } catch (error) { if (!controller.signal.aborted && mounted.current) setError(errorText(error)) }
    finally { if (!controller.signal.aborted && mounted.current) setLoading(false) }
  }, [patientId, offline])
  useEffect(() => {
    mounted.current = true; setMessages([]); setLoading(!offline)
    void refresh()
    const visibleRefresh = () => { if (document.visibilityState === 'visible') void refresh() }
    const timer = setInterval(visibleRefresh, 5000)
    document.addEventListener('visibilitychange', visibleRefresh)
    return () => { mounted.current = false; pending.current?.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', visibleRefresh) }
  }, [refresh, offline])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!body.trim() || offline || busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const message = await post<Message>(`/api/patients/${patientId}/messages`, { body: body.trim() })
      if (mounted.current) { setMessages(old => [...old.filter(m => m.id !== message.id), message].sort((a, b) => a.id - b.id)); setBody(''); setNotice('Mensagem enviada e salva na API.'); refreshNotifications() }
    } catch (error) { if (mounted.current) setError(errorText(error)) }
    finally { if (mounted.current) setBusy(false) }
  }
  return <>
    <div className="page-heading"><div><span className="eyebrow">CONVERSA COM QUEM ACOMPANHA</span><h1>Mensagens<span className="heading-dot">.</span></h1><p className="muted">Um espaço compartilhado entre a família e a equipe vinculada.</p></div><button className="button ghost" onClick={() => void refresh()} disabled={offline || loading}><RefreshCw size={18}/>Atualizar</button></div>
    <div className="notice warning"><MessageCircle size={22}/><p><strong>Este chat não é canal de emergência.</strong> Não há garantia de tempo de resposta. Em uma urgência, procure o serviço de emergência local.</p></div>
    <section className="card message-card"><div className="section-heading"><h2>Família & equipe</h2><span className="muted small-text">{offline ? 'Apresentação somente de leitura' : updated ? `Atualizado às ${updated.toLocaleTimeString('pt-BR')}` : 'Conectando…'}</span></div>
      {loading && <Loading/>}{error && <ErrorState message={error} retry={() => void refresh()}/>}
      <div className="messages" role="log" aria-label="Histórico de mensagens" aria-live="polite">{!loading && !messages.length && <EmptyState>{offline ? 'O histórico não é carregado sem a API. Volte ao modo conectado para conversar.' : 'A conversa começa aqui. Envie uma mensagem fictícia para a equipe.'}</EmptyState>}{messages.map(message => <article className={`message-bubble ${message.sender_user_id === userId ? 'mine' : ''}`} key={message.id}><span className="message-author">{message.sender_user_id === userId ? 'Você' : message.sender_name || `Participante #${message.sender_user_id}`} {message.sender_role === 'CLINICIAN' ? '· Médico(a)' : message.sender_role === 'GUARDIAN' ? '· Responsável' : ''}</span><p>{message.body}</p><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time></article>)}</div>
      <form className="message-compose" onSubmit={submit}><label htmlFor="message-body">Nova mensagem · use apenas informações fictícias</label><textarea id="message-body" value={body} onChange={e => setBody(e.target.value)} maxLength={2000} disabled={offline || busy} placeholder={offline ? 'Envio indisponível no modo offline' : 'Escreva sua mensagem…'} required/><div className="compose-footer"><span className="muted small-text">{body.length}/2000 · atualização a cada 5s com a tela ativa</span><button className="button primary" disabled={offline || busy || !body.trim()}><Send size={17}/>{busy ? 'Enviando…' : 'Enviar mensagem'}</button></div></form>{notice && <p className="success" role="status">{notice}</p>}
    </section>
  </>
}
