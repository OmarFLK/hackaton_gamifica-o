import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Pill, Plus, CheckCircle2 } from 'lucide-react'
import { api, errorText, post } from '../../lib/api'
import { offlineSchedules } from '../../lib/demoOffline'
import type { MedicationEvent, MedicationSchedule, Role } from '../../lib/types'
import { EmptyState, ErrorState, Loading } from '../../components/common/Feedback'
import { localDay, nextOccurrence, occurrencesForDay, statusText, type Occurrence } from './calendar'
import { MedicationConfirmDialog } from './MedicationConfirmDialog'
import { MedicationReminder } from './MedicationReminder'

export function MedicationCalendar({ patientId, role, offline = false }: { patientId: number; role: Role; offline?: boolean }) {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([])
  const [events, setEvents] = useState<MedicationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [day, setDay] = useState(localDay(new Date()))
  const [selected, setSelected] = useState<Occurrence | null>(null)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)
  const [, setMinute] = useState(0)
  useEffect(() => { const timer = setInterval(() => setMinute(n => n + 1), 30000); return () => clearInterval(timer) }, [])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setSchedules([]); setEvents([])
    if (offline) { setSchedules(offlineSchedules.filter(s => s.patient_id === patientId)); setLoading(false); return }
    Promise.all([api<MedicationSchedule[]>(`/api/patients/${patientId}/medications`, { signal: controller.signal }), api<MedicationEvent[]>(`/api/patients/${patientId}/medication-events`, { signal: controller.signal })])
      .then(([s, e]) => { if (!controller.signal.aborted) { setSchedules(s); setEvents(e) } })
      .catch(error => { if (!controller.signal.aborted) setError(errorText(error)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [patientId, offline, revision])
  const next = nextOccurrence(schedules, events)
  const occurrences = occurrencesForDay(schedules, events, day)
  const days = Array.from({ length: 7 }, (_, i) => { const date = new Date(`${day}T12:00:00`); date.setDate(date.getDate() - 3 + i); return date })
  const shift = (delta: number) => { const date = new Date(`${day}T12:00:00`); date.setDate(date.getDate() + delta); setDay(localDay(date)) }
  const canWrite = !offline && (role === 'GUARDIAN' || role === 'CLINICIAN')
  return <>
    <div className="page-heading"><div><span className="eyebrow">ROTINA COM MAIS TRANQUILIDADE</span><h1>Agenda de medicamentos<span className="heading-dot">.</span></h1><p className="muted">Um lugar para acompanhar horários e compartilhar seus relatos.</p></div>{role === 'CLINICIAN' && <button className="button primary" disabled={offline} onClick={() => setAdding(!adding)}><Plus size={18}/>Nova programação</button>}</div>
    {loading ? <Loading/> : error ? <ErrorState message={error} retry={() => setRevision(n => n + 1)}/> : <>
      <div className="stats-grid"><article className="stat-card next"><div className="stat-icon"><Clock3/></div><span>Próxima ocorrência</span><strong>{next ? next.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sem programação'}</strong><small>{next ? `${next.schedule.label} · ${next.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : 'Nenhuma ocorrência pendente nos próximos dias'}</small></article><article className="stat-card"><div className="stat-icon green"><CheckCircle2/></div><span>Relatos neste dia</span><strong>{occurrences.filter(o => o.event).length}<em> / {occurrences.length}</em></strong><small>Informados pela família ou equipe</small></article><article className="stat-card"><div className="stat-icon pink"><Pill/></div><span>Programações ativas</span><strong>{schedules.filter(s => s.active).length.toString().padStart(2, '0')}</strong><small>Agenda fictícia definida pelo médico</small></article></div>
      {adding && <ScheduleForm patientId={patientId} schedules={schedules} onSaved={() => { setAdding(false); setRevision(n => n + 1); setNotice('Programação fictícia salva na API.') }}/ >}
      <section className="card" id="agenda"><div className="section-heading"><div><h2><CalendarDays size={21}/> Seus horários</h2><p className="muted small-text">{new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p></div><div className="calendar-controls"><button className="button ghost small" onClick={() => setDay(localDay(new Date()))}>Hoje</button><label className="sr-only" htmlFor="calendar-date">Escolher data</label><input id="calendar-date" type="date" value={day} onChange={e => { if (e.target.value) setDay(e.target.value) }}/></div></div>
        <div className="week-strip"><button className="icon-button" aria-label="Dia anterior" onClick={() => shift(-1)}><ChevronLeft/></button>{days.map(date => <button key={localDay(date)} aria-pressed={localDay(date) === day} className={`day-button ${localDay(date) === day ? 'selected' : ''}`} onClick={() => setDay(localDay(date))}><span>{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><strong>{date.getDate().toString().padStart(2, '0')}</strong><i/></button>)}<button className="icon-button" aria-label="Próximo dia" onClick={() => shift(1)}><ChevronRight/></button></div>
        <div className="schedule-list">{!occurrences.length && <EmptyState>Nenhum medicamento programado para este dia.</EmptyState>}{occurrences.map(o => <article className="schedule-row" key={o.key}><div className="schedule-time">{o.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<span>HORÁRIO LOCAL</span></div><div className="pill-icon"><Pill size={22}/></div><div className="schedule-label"><h3>{o.schedule.label}</h3><span>Programação fictícia · sem informação de dose</span></div><span className={`status-badge ${o.event?.status || ''}`}>{o.event ? statusText[o.event.status] : o.date < new Date() ? 'Sem confirmação' : 'Programado'}</span><button className="button ghost small" disabled={!canWrite} onClick={() => setSelected(o)}>{o.event ? 'Atualizar relato' : 'Registrar relato'}</button></article>)}</div>
        <MedicationReminder schedules={schedules} events={events}/>
      </section>
      <div className="notice"><span className="notice-symbol">i</span><p><strong>Cada registro é um relato.</strong> A confirmação é informada pela família ou equipe e não comprova ingestão. Lembretes dependem da página aberta.</p></div>
      <section className="card"><div className="section-heading"><div><span className="eyebrow">ACOMPANHAMENTO COMPARTILHADO</span><h2>Histórico de relatos</h2></div><span className="count-badge">{events.length} registros</span></div>{!events.length ? <EmptyState>Os relatos aparecerão aqui com autor, ocorrência e data do registro.</EmptyState> : <div className="history-list">{events.map(event => <article className="history-row" key={event.id}><CheckCircle2 size={19}/><div><strong>{statusText[event.status]} · {schedules.find(s => s.id === event.schedule_id)?.label || 'Agenda fictícia'}</strong><p>Ocorrência: {new Date(event.scheduled_for).toLocaleString('pt-BR')} · Autor #{event.reporter_user_id}</p>{event.note && <p>{event.note}</p>}<small>Relatado em {new Date(event.reported_at).toLocaleString('pt-BR')}</small></div></article>)}</div>}</section>
      {notice && <p className="success" role="status">{notice}</p>}
    </>}
    {selected && <MedicationConfirmDialog patientId={patientId} occurrence={selected} onClose={() => setSelected(null)} onSaved={event => { setEvents(previous => [event, ...previous]); setNotice('Relato registrado na API com autor e horário.') }}/ >}
  </>
}

function ScheduleForm({ patientId, schedules, onSaved }: { patientId: number; schedules: MedicationSchedule[]; onSaved: () => void }) {
  const [editing, setEditing] = useState('')
  const [label, setLabel] = useState('Medicamento A')
  const [times, setTimes] = useState('08:00, 20:00')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    const body = { label, times_json: times.split(',').map(s => s.trim()) }
    try {
      if (editing) await api(`/api/patients/${patientId}/medications/${editing}`, { method: 'PUT', body: JSON.stringify(body) })
      else await post(`/api/patients/${patientId}/medications`, body)
      onSaved()
    } catch (e) { setError(errorText(e)) } finally { setBusy(false) }
  }
  return <section className="card"><h2>Programação fictícia</h2><form onSubmit={submit} className="schedule-form"><label>Programação<select value={editing} onChange={e => { setEditing(e.target.value); const s = schedules.find(s => s.id === Number(e.target.value)); if (s) { setLabel(s.label); setTimes(s.times_json.join(', ')) } }}><option value="">Criar nova</option>{schedules.map(s => <option value={s.id} key={s.id}>Editar {s.label} · #{s.id}</option>)}</select></label><label>Identificação<select value={label} onChange={e => setLabel(e.target.value)}><option>Medicamento A</option><option>Medicamento B</option></select></label><label>Horários separados por vírgula<input value={times} onChange={e => setTimes(e.target.value)} required placeholder="08:00, 20:00"/></label><button className="button primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar programação'}</button>{error && <ErrorState message={error}/>}</form></section>
}
