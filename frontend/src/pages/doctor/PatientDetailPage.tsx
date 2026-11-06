import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardPen, Droplets, Gamepad2, LinkIcon, Utensils } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { api, errorText, post, put } from '../../lib/api'
import { offlineDashboard } from '../../lib/demo'
import { ageFrom, formatBirth, formatDateTime, moodByDay, waterByDay } from '../../lib/format'
import type { FormOptions, PatientClinical, PatientDashboard, PatientDetail } from '../../lib/types'
import { Button, Card, CardHeader, EmptyState, ErrorState, Input, Loading, MoodChart, Select, Textarea, WaterChart } from '../../components/ui'
import { MedicationCalendar } from '../../features/medications'
import { MessageCenter } from '../../features/messages'
import { PandiAvatar, mascotById } from '../child/mascots'

type Tab = 'resumo' | 'medicamentos' | 'mensagens' | 'clinico'

function GuardianLinker({ patient, onLinked }: { patient: PatientDetail; onLinked: () => void }) {
  const [options, setOptions] = useState<FormOptions | null>(null)
  const [guardianId, setGuardianId] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => { api<FormOptions>('/api/patients/form-options').then(setOptions).catch(err => setFeedback({ ok: false, text: errorText(err) })) }, [])
  const available = options?.guardians.filter(g => !patient.guardians.some(linked => linked.id === g.id)) ?? []
  const link = async (event: React.FormEvent) => {
    event.preventDefault(); if (!guardianId) return
    setBusy(true); setFeedback(null)
    try { await post(`/api/patients/${patient.id}/guardians`, { guardian_user_id: Number(guardianId) }); setFeedback({ ok: true, text: 'Responsável vinculado no servidor. Nenhum e-mail foi enviado (demo).' }); setGuardianId(''); onLinked() }
    catch (err) { setFeedback({ ok: false, text: errorText(err) }) } finally { setBusy(false) }
  }
  return <form className="inline-form" onSubmit={link}>
    <Select label="Vincular responsável demo existente" value={guardianId} onChange={e => setGuardianId(e.target.value)} disabled={!available.length || busy}>
      <option value="">{available.length ? 'Selecione…' : 'Todos os responsáveis demo já vinculados'}</option>
      {available.map(g => <option key={g.id} value={g.id}>{g.name} · {g.email}</option>)}
    </Select>
    <Button type="submit" variant="ghost" loading={busy} disabled={!guardianId}><LinkIcon size={17}/>Vincular</Button>
    {feedback && <p role="status" className={feedback.ok ? 'success' : 'field-error'}>{feedback.text}</p>}
  </form>
}

function ClinicalReview({ patient, onSaved }: { patient: PatientClinical; onSaved: (p: PatientClinical) => void }) {
  const [form, setForm] = useState({ cancer_type_demo: patient.cancer_type_demo ?? '', clinical_stage_demo: patient.clinical_stage_demo ?? '', clinical_notes: patient.clinical_notes ?? '' })
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setFeedback(null)
    try { onSaved(await put<PatientClinical>(`/api/patients/${patient.id}/clinical-review`, form)); setFeedback({ ok: true, text: 'Revisão salva no servidor.' }) }
    catch (err) { setFeedback({ ok: false, text: errorText(err) }) } finally { setBusy(false) }
  }
  return <Card><CardHeader eyebrow="SOMENTE PROFISSIONAL MÉDICO" title="Revisão clínica fictícia" subtitle="Campos inteiramente fictícios. Nunca alterados por jogos, humor ou IA; não visíveis à família."/>
    <form className="stack-form" onSubmit={save}>
      <div className="form-grid">
        <Input label="Tipo (fictício)" maxLength={120} value={form.cancer_type_demo} onChange={e => setForm({ ...form, cancer_type_demo: e.target.value })}/>
        <Input label="Estágio (fictício)" maxLength={60} value={form.clinical_stage_demo} onChange={e => setForm({ ...form, clinical_stage_demo: e.target.value })}/>
      </div>
      <Textarea label="Notas (fictícias)" maxLength={2000} value={form.clinical_notes} onChange={e => setForm({ ...form, clinical_notes: e.target.value })}/>
      <div className="form-actions"><Button type="submit" loading={busy}><ClipboardPen size={17}/>Salvar revisão</Button></div>
      {feedback && <p role="status" className={feedback.ok ? 'success' : 'field-error'}>{feedback.text}</p>}
    </form>
  </Card>
}

export function PatientDetailPage() {
  const { id } = useParams()
  const patientId = Number(id)
  const { user, offline } = useAuth()
  const [patient, setPatient] = useState<PatientDetail | PatientClinical | null>(null)
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('resumo')
  const [revision, setRevision] = useState(0)
  const isClinician = user?.role === 'CLINICIAN'

  useEffect(() => {
    setLoading(true); setError('')
    if (offline) { const d = offlineDashboard(patientId); setPatient(d?.patient ?? null); setDashboard(d); setError(d ? '' : 'Paciente indisponível no modo offline.'); setLoading(false); return }
    const controller = new AbortController()
    const requests: [Promise<PatientDetail>, Promise<PatientDashboard | null>] = [
      api<PatientDetail>(`/api/patients/${patientId}`, { signal: controller.signal }),
      isClinician ? api<PatientDashboard>(`/api/patients/${patientId}/dashboard`, { signal: controller.signal }) : Promise.resolve(null),
    ]
    Promise.all(requests).then(([p, d]) => { if (!controller.signal.aborted) { setPatient(p); setDashboard(d) } })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [patientId, isClinician, offline, revision])

  if (loading) return <Loading/>
  if (error || !patient || !user) return <><Link className="back-link" to="/medico/pacientes"><ArrowLeft size={16}/>Pacientes</Link><ErrorState message={error || 'Paciente não encontrado.'}/></>
  const mascot = mascotById(patient.chosen_avatar)
  const tabs: { id: Tab; label: string }[] = [{ id: 'resumo', label: 'Resumo' }, ...(isClinician ? [{ id: 'medicamentos' as Tab, label: 'Medicamentos' }, { id: 'mensagens' as Tab, label: 'Mensagens' }, { id: 'clinico' as Tab, label: 'Revisão clínica' }] : [])]

  return <>
    <Link className="back-link" to="/medico/pacientes"><ArrowLeft size={16}/>Pacientes</Link>
    <header className="patient-header">
      <PandiAvatar size={72}/>
      <div><span className="eyebrow">FICHA · PERFIL FICTÍCIO</span><h1>{patient.name}<span className="heading-dot">.</span></h1>
        <p className="muted">{ageFrom(patient.birth_date)} anos · nascimento {formatBirth(patient.birth_date)} · companheiro {mascot.name}</p>
        <p className="muted small-text">Médico(a) responsável: {patient.clinician_name ?? '—'} · Família: {patient.guardians.map(g => g.name).join(', ') || 'nenhum vínculo'}</p></div>
    </header>
    <div className="tabs" role="tablist" aria-label="Seções da ficha">{tabs.map(t => <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>

    <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {tab === 'resumo' && <>
        {!offline && <Card><CardHeader eyebrow="VÍNCULO FAMILIAR" title="Responsáveis" subtitle="Somente médico ou assistente delegado podem vincular."/><GuardianLinker patient={patient} onLinked={() => setRevision(n => n + 1)}/></Card>}
        {dashboard ? <>
          <div className="two-columns">
            <Card><CardHeader eyebrow="ÚLTIMOS 7 DIAS" title="Humor relatado" subtitle="Opinião da criança/família, não indicador clínico."/><MoodChart points={moodByDay(dashboard.mood_last_7_days)}/></Card>
            <Card><CardHeader eyebrow="ÚLTIMOS 7 DIAS" title="Água relatada" subtitle="Relatado pela família."/><WaterChart points={waterByDay(dashboard.water_entries)}/></Card>
          </div>
          <div className="two-columns">
            <Card><CardHeader title={<><Utensils size={18}/>Refeições relatadas</>}/>{dashboard.meal_entries.length ? <ul className="activity-list">{dashboard.meal_entries.map(m => <li key={m.id}><Utensils size={16}/><div><span>{m.description}</span><small>{formatDateTime(m.recorded_at)} · relatado pela família</small></div></li>)}</ul> : <EmptyState>Sem informação nos últimos 7 dias.</EmptyState>}</Card>
            <Card><CardHeader title={<><Droplets size={18}/>Rotina e brincadeiras</>}/>
              <ul className="activity-list"><li><Gamepad2 size={16}/><div><span>{dashboard.game_sessions_count} brincadeira(s) registrada(s)</span><small>Uso voluntário, não é terapia nem medição.</small></div></li>
                {dashboard.upcoming_medications.map(m => <li key={`${m.schedule_id}${m.time}`}><ClipboardPen size={16}/><div><span>{m.label} · {m.time}</span><small>Horário fictício programado</small></div></li>)}</ul></Card>
          </div>
          <p className="muted small-text">{dashboard.disclaimer ?? 'Indicadores de rotina relatados, não evolução clínica.'}</p>
        </> : !isClinician && <div className="notice"><p>Perfil assistente: registros de rotina, humor e dados clínicos não são exibidos.</p></div>}
      </>}
      {tab === 'medicamentos' && <MedicationCalendar key={`${patientId}:${offline}`} patientId={patientId} role={user.role} offline={offline}/>}
      {tab === 'mensagens' && <MessageCenter key={`${patientId}:${offline}`} patientId={patientId} userId={user.id} offline={offline}/>}
      {tab === 'clinico' && isClinician && (offline ? <EmptyState>Revisão clínica indisponível no modo offline.</EmptyState> : <ClinicalReview patient={patient as PatientClinical} onSaved={setPatient}/>)}
    </div>
  </>
}
