import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { errorText, post } from '../../lib/api'
import { refreshNotifications } from '../notifications/events'
import { ErrorState } from '../../components/common/Feedback'

export function NoticeComposer({ patientId, offline }: { patientId: number; offline: boolean }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const send = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try { const response = await post<{ delivered_to: number }>(`/api/patients/${patientId}/notices`, { title, body }); setTitle(''); setBody(''); setOpen(false); setNotice(`Aviso enviado para ${response.delivered_to} destinatário(s) vinculado(s).`); refreshNotifications() }
    catch (error) { setError(errorText(error)) } finally { setBusy(false) }
  }
  return <section className="notice-composer"><button className="button ghost" disabled={offline} aria-expanded={open} onClick={() => setOpen(!open)}><BellRing size={18}/>Enviar um aviso</button><p className="muted small-text">O aviso aparece nas notificações da outra parte vinculada a esta conversa.</p>{open && <form className="stack-form" onSubmit={send}><label>Título do aviso<input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} required/></label><label>Texto do aviso<textarea value={body} onChange={e => setBody(e.target.value)} maxLength={1000} required/></label>{error && <ErrorState message={error}/>}<button className="button primary" disabled={busy || !title.trim() || !body.trim()}>{busy ? 'Enviando…' : 'Enviar aviso'}</button></form>}{notice && <p className="success" role="status">{notice}</p>}</section>
}
