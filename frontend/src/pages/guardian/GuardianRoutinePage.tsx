import { useEffect, useState } from 'react'
import { Droplets, Utensils } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { api, errorText, post } from '../../lib/api'
import { offlineRoutinesFor, ROUTINE_DISCLAIMER } from '../../lib/demo'
import { formatDateTime } from '../../lib/format'
import type { RoutineEntry } from '../../lib/types'
import { Button, Card, CardHeader, EmptyState, ErrorState, Input, Loading, PageHeading } from '../../components/ui'

const QUICK_ML = [100, 150, 200, 250]
type Feedback = { ok: boolean; text: string } | null

export function GuardianRoutinePage() {
  const { user, offline } = useAuth()
  const { selected } = usePatients()
  const [entries, setEntries] = useState<RoutineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ml, setMl] = useState('150')
  const [meal, setMeal] = useState('')
  const [busy, setBusy] = useState<'water' | 'meal' | null>(null)
  const [feedback, setFeedback] = useState<{ water: Feedback; meal: Feedback }>({ water: null, meal: null })

  useEffect(() => {
    if (!selected) return
    setFeedback({ water: null, meal: null })
    if (offline) { setEntries(offlineRoutinesFor(selected.id)); setLoading(false); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    api<RoutineEntry[]>(`/api/patients/${selected.id}/routines`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setEntries(data) })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [selected, offline])

  if (!selected) return <EmptyState>Nenhuma criança vinculada.</EmptyState>

  const save = async (kind: 'water' | 'meal') => {
    if (offline) { setFeedback(f => ({ ...f, [kind]: { ok: false, text: 'Modo offline de apresentação: nada foi salvo nem sincronizado.' } })); return }
    const body = kind === 'water' ? { kind, quantity: Number(ml), unit: 'ml' } : { kind, description: meal.trim() }
    if (kind === 'water' && (!Number.isFinite(Number(ml)) || Number(ml) < 0 || Number(ml) > 5000 || ml === '')) { setFeedback(f => ({ ...f, water: { ok: false, text: 'Informe de 0 a 5000 ml.' } })); return }
    if (kind === 'meal' && !meal.trim()) { setFeedback(f => ({ ...f, meal: { ok: false, text: 'Descreva a refeição.' } })); return }
    setBusy(kind); setFeedback(f => ({ ...f, [kind]: null }))
    try {
      const created = await post<RoutineEntry>(`/api/patients/${selected.id}/routines`, body)
      setEntries(list => [created, ...list])
      if (kind === 'meal') setMeal('')
      setFeedback(f => ({ ...f, [kind]: { ok: true, text: `Salvo no servidor às ${new Date(created.recorded_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.` } }))
    } catch (err) { setFeedback(f => ({ ...f, [kind]: { ok: false, text: `Não salvo: ${errorText(err)}` } })) } finally { setBusy(null) }
  }
  const status = (item: Feedback) => item && <p role="status" className={item.ok ? 'success' : 'field-error'}>{item.text}</p>

  return <>
    <PageHeading eyebrow="ROTINA RELATADA" title="Água e refeições" subtitle={`Registros de ${selected.name.split(' ')[0]}. ${ROUTINE_DISCLAIMER}`}/>
    <div className="two-columns">
      <Card><CardHeader title={<><Droplets size={19}/>Água</>} subtitle="Quantidade informada pela família."/>
        <form className="stack-form" onSubmit={e => { e.preventDefault(); void save('water') }}>
          <div className="chip-row" role="group" aria-label="Quantidades rápidas">{QUICK_ML.map(value => <button type="button" key={value} className={`chip ${ml === String(value) ? 'active' : ''}`} aria-pressed={ml === String(value)} onClick={() => setMl(String(value))}>{value} ml</button>)}</div>
          <Input label="Quantidade (ml)" type="number" inputMode="numeric" min={0} max={5000} step={10} value={ml} onChange={e => setMl(e.target.value)}/>
          <Button type="submit" loading={busy === 'water'}>Registrar água</Button>{status(feedback.water)}
        </form>
      </Card>
      <Card><CardHeader title={<><Utensils size={19}/>Refeição</>} subtitle="Descrição livre e breve."/>
        <form className="stack-form" onSubmit={e => { e.preventDefault(); void save('meal') }}>
          <Input label="O que comeu?" value={meal} maxLength={300} placeholder="Ex.: almoço — arroz e legumes" onChange={e => setMeal(e.target.value)} hint={`${meal.length}/300`}/>
          <Button type="submit" loading={busy === 'meal'}>Registrar refeição</Button>{status(feedback.meal)}
        </form>
      </Card>
    </div>
    <Card><CardHeader eyebrow="HISTÓRICO" title="Registros recentes" subtitle="Com data, hora e autor da sessão."/>
      {loading ? <Loading/> : error ? <ErrorState message={error}/> : entries.length ? <ul className="activity-list">{entries.slice(0, 30).map(entry => <li key={entry.id}>
        {entry.kind === 'water' ? <Droplets size={16}/> : <Utensils size={16}/>}
        <div><span>{entry.kind === 'water' ? `${entry.quantity} ml de água` : entry.description}</span><small>{formatDateTime(entry.recorded_at)} · {entry.reporter_user_id === user?.id ? 'por você' : 'relatado pela família'}{entry.id < 0 ? ' · fixture offline' : ''}</small></div>
      </li>)}</ul> : <EmptyState>Sem informação registrada ainda.</EmptyState>}
    </Card>
  </>
}
