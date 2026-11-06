import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { errorText, post } from '../../lib/api'
import type { EventStatus, MedicationEvent } from '../../lib/types'
import { ErrorState } from '../../components/common/Feedback'
import { isoWithOffset, statusText, type Occurrence } from './calendar'

export function MedicationConfirmDialog({ patientId, occurrence, onClose, onSaved }: { patientId: number; occurrence: Occurrence; onClose: () => void; onSaved: (event: MedicationEvent) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<EventStatus>('given')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close() }, [])
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const event = await post<MedicationEvent>(`/api/patients/${patientId}/medication-events`, { schedule_id: occurrence.schedule.id, scheduled_for: isoWithOffset(occurrence.date), status, note: note.trim() || null })
      onSaved(event); onClose()
    } catch (error) { setError(errorText(error)) } finally { setBusy(false) }
  }
  return <dialog ref={dialog} onCancel={e => { if (busy) e.preventDefault(); else onClose() }} aria-labelledby="confirm-title"><div className="modal-heading"><h2 id="confirm-title">Registrar relato</h2><button className="icon-button" disabled={busy} onClick={onClose} aria-label="Fechar"><X/></button></div><p>{occurrence.schedule.label} · {occurrence.date.toLocaleString('pt-BR')}</p><p className="notice">Este registro é um relato, não uma comprovação de ingestão.</p><form onSubmit={save}><fieldset><legend>O que você deseja informar?</legend>{(Object.entries(statusText) as [EventStatus, string][]).map(([key, text]) => <label className="radio-option" key={key}><input type="radio" name="status" value={key} checked={status === key} onChange={() => setStatus(key)}/>{text}</label>)}</fieldset><label>Observação opcional<textarea maxLength={1000} value={note} onChange={e => setNote(e.target.value)} placeholder="Use somente informações fictícias nesta demo"/></label>{error && <ErrorState message={error}/>}<div className="form-actions"><button type="button" className="button ghost" onClick={onClose} disabled={busy}>Cancelar</button><button className="button primary" disabled={busy}>{busy ? 'Registrando…' : 'Registrar relato'}</button></div></form></dialog>
}
