import { useEffect, useState } from 'react'
import { Smile } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { api, errorText, post } from '../../lib/api'
import { offlineMoodsFor } from '../../lib/demo'
import { formatDateTime, moodByDay } from '../../lib/format'
import type { MoodEntry } from '../../lib/types'
import { Button, Card, CardHeader, EmptyState, ErrorState, Input, Loading, MoodChart, PageHeading } from '../../components/ui'
import { MOOD_LABELS } from '../../components/ui/Charts'
import { mascotById } from '../child/mascots'
import { MoodPicker } from '../child/MoodPicker'

export function GuardianMoodPage() {
  const { offline } = useAuth()
  const { selected } = usePatients()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!selected) return
    setFeedback(null); setScore(null)
    if (offline) { setEntries(offlineMoodsFor(selected.id)); setLoading(false); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    api<MoodEntry[]>(`/api/patients/${selected.id}/moods`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setEntries(data) })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [selected, offline])

  if (!selected) return <EmptyState>Nenhuma criança vinculada.</EmptyState>
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!score) { setFeedback({ ok: false, text: 'Escolha um dos rostinhos.' }); return }
    if (offline) { setFeedback({ ok: false, text: 'Modo offline de apresentação: nada foi salvo nem sincronizado.' }); return }
    setBusy(true); setFeedback(null)
    try {
      const created = await post<MoodEntry>(`/api/patients/${selected.id}/moods`, { score, source: 'GUARDIAN', ...(note.trim() ? { note: note.trim() } : {}) })
      setEntries(list => [created, ...list]); setScore(null); setNote('')
      setFeedback({ ok: true, text: 'Relato da família salvo no servidor.' })
    } catch (err) { setFeedback({ ok: false, text: `Não salvo: ${errorText(err)}` }) } finally { setBusy(false) }
  }

  return <>
    <PageHeading eyebrow="HUMOR RELATADO" title="Como está hoje" subtitle="Percepção da família ou da criança. Não é avaliação clínica, estadiamento ou previsão."/>
    <Card><CardHeader title={<><Smile size={19}/>Relato da família</>} subtitle={`Como você percebe ${selected.name.split(' ')[0]} hoje? A criança também pode registrar no próprio mundo.`}/>
      <form className="stack-form" onSubmit={save}>
        <MoodPicker mascot={mascotById(selected.chosen_avatar)} value={score} onChange={setScore}/>
        <Input label="Observação (opcional)" value={note} maxLength={500} onChange={e => setNote(e.target.value)} placeholder="Ex.: dormiu bem, brincou à tarde"/>
        <div className="form-actions"><Button type="submit" loading={busy}>Salvar relato</Button></div>
        {feedback && <p role="status" className={feedback.ok ? 'success' : 'field-error'}>{feedback.text}</p>}
      </form>
    </Card>
    <Card><CardHeader eyebrow="ÚLTIMOS 7 DIAS" title="Histórico"/>
      {loading ? <Loading/> : error ? <ErrorState message={error}/> : <>
        <MoodChart points={moodByDay(entries)}/>
        {entries.length ? <ul className="activity-list">{entries.slice(0, 15).map(entry => <li key={entry.id}><Smile size={16}/><div><span>{MOOD_LABELS[entry.score]} ({entry.score}/7){entry.note ? ` — ${entry.note}` : ''}</span><small>{formatDateTime(entry.recorded_at)} · {entry.source === 'CHILD' ? 'registrado pela criança' : 'relatado pela família'}</small></div></li>)}</ul> : null}
      </>}
    </Card>
  </>
}
