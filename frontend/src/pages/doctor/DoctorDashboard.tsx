import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowRight, ClipboardList, Pill, UserPlus, Users } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { api, errorText } from '../../lib/api'
import { offlineDashboard } from '../../lib/demo'
import { formatDateTime } from '../../lib/format'
import type { PatientDashboard } from '../../lib/types'
import { Card, CardHeader, EmptyState, ErrorState, Loading, PageHeading, StatCard } from '../../components/ui'
import { MOOD_LABELS } from '../../components/ui/Charts'

interface Activity { id: string; patient: string; text: string; at: string }

function activityFrom(dashboards: PatientDashboard[]): Activity[] {
  return dashboards.flatMap(d => [
    ...d.mood_last_7_days.map(m => ({ id: `m${m.id}`, patient: d.patient.name, at: m.recorded_at, text: `Humor relatado: ${MOOD_LABELS[m.score]} (${m.source === 'CHILD' ? 'criança' : 'família'})` })),
    ...d.water_entries.map(w => ({ id: `w${w.id}`, patient: d.patient.name, at: w.recorded_at, text: `Água relatada: ${w.quantity} ml` })),
    ...d.meal_entries.map(r => ({ id: `r${r.id}`, patient: d.patient.name, at: r.recorded_at, text: `Refeição relatada: ${r.description}` })),
  ]).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8)
}

export function DoctorDashboard() {
  const { user, offline } = useAuth()
  const { patients, loading: loadingPatients, error: patientsError, refresh } = usePatients()
  const [dashboards, setDashboards] = useState<PatientDashboard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isClinician = user?.role === 'CLINICIAN'

  useEffect(() => {
    if (!isClinician || !patients.length) { setDashboards([]); return }
    if (offline) { setDashboards(patients.map(p => offlineDashboard(p.id)).filter((d): d is PatientDashboard => !!d)); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    Promise.all(patients.map(p => api<PatientDashboard>(`/api/patients/${p.id}/dashboard`, { signal: controller.signal })))
      .then(data => { if (!controller.signal.aborted) setDashboards(data) })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [patients, isClinician, offline])

  if (loadingPatients) return <Loading/>
  if (patientsError) return <ErrorState message={patientsError} retry={refresh}/>

  const records = dashboards.reduce((sum, d) => sum + d.mood_last_7_days.length + d.water_entries.length + d.meal_entries.length, 0)
  const scheduled = dashboards.reduce((sum, d) => sum + d.upcoming_medications.length, 0)
  const games = dashboards.reduce((sum, d) => sum + d.game_sessions_count, 0)
  const perPatient = dashboards.map(d => ({ id: d.patient.id, name: d.patient.name.split(' ')[0], fullName: d.patient.name, registros: d.mood_last_7_days.length + d.water_entries.length + d.meal_entries.length }))
  const activity = activityFrom(dashboards)

  return <>
    <PageHeading eyebrow={isClinician ? 'PAINEL DA EQUIPE' : 'PAINEL ADMINISTRATIVO'} title={`Olá, ${user?.name.split(' ').slice(0, 2).join(' ')}`}
      subtitle="Indicadores de rotina relatados pela família — não representam evolução clínica."
      action={!offline && <Link className="button primary" to="/medico/pacientes/novo"><UserPlus size={18}/>Cadastrar paciente</Link>}/>
    {!isClinician && <div className="notice"><p><strong>Perfil assistente (delegado).</strong> Você faz cadastro administrativo e vínculo familiar dos médicos que delegaram acesso. Registros de rotina, diagnóstico e prescrição não ficam disponíveis neste perfil.</p></div>}
    <div className="stats-grid">
      <StatCard label="Pacientes vinculados" value={String(patients.length)} hint="Somente no seu escopo" icon={<Users/>}/>
      {isClinician && <StatCard label="Registros nos últimos 7 dias" value={loading ? '…' : String(records)} hint="Humor, água e refeições relatados" icon={<ClipboardList/>} tone="green"/>}
      {isClinician && <StatCard label="Horários de medicação programados" value={loading ? '…' : String(scheduled)} hint={`${games} brincadeira(s) registrada(s) no total`} icon={<Pill/>} tone="pink"/>}
    </div>
    {error && <ErrorState message={error}/>}
    {isClinician && <div className="two-columns">
      <Card><CardHeader eyebrow="ÚLTIMOS 7 DIAS" title="Registros relatados por paciente" subtitle="Quantidade de relatos, não indicador de saúde."/>
        {loading ? <Loading/> : perPatient.length ? <figure className="chart" aria-label="Registros por paciente">
          <ResponsiveContainer width="100%" height={210}><BarChart data={perPatient} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#edf0f5"/><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7a869b' }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7a869b' }} axisLine={false} tickLine={false}/>
            <Tooltip cursor={{ fill: '#f0f3fa' }} formatter={(value) => [`${value} registro(s)`, 'Relatos']}/>
            <Bar dataKey="registros" fill="#3F5FAE" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}/>
          </BarChart></ResponsiveContainer>
          <details className="chart-table"><summary>Ver como tabela</summary><table><thead><tr><th>Paciente</th><th>Registros</th></tr></thead><tbody>{perPatient.map(p => <tr key={p.id}><td>{p.fullName}</td><td>{p.registros}</td></tr>)}</tbody></table></details>
        </figure> : <EmptyState>Sem pacientes vinculados.</EmptyState>}
      </Card>
      <Card><CardHeader eyebrow="ATIVIDADE RECENTE" title="Últimos relatos"/>
        {loading ? <Loading/> : activity.length ? <ul className="activity-list">{activity.map(item => <li key={item.id}><Activity size={16}/><div><strong>{item.patient}</strong><span>{item.text}</span><small>{formatDateTime(item.at)}</small></div></li>)}</ul> : <EmptyState>Sem informação nos últimos 7 dias.</EmptyState>}
      </Card>
    </div>}
    <Card><CardHeader title="Pacientes" action={<Link className="button ghost small" to="/medico/pacientes">Ver todos<ArrowRight size={16}/></Link>}/>
      {patients.length ? <ul className="patient-mini-list">{patients.slice(0, 5).map(p => <li key={p.id}><Link to={`/medico/pacientes/${p.id}`}><span className="patient-initial">{p.name.charAt(0)}</span>{p.name}<ArrowRight size={16}/></Link></li>)}</ul> : <EmptyState>{isClinician ? 'Nenhum paciente vinculado.' : 'Nenhuma delegação ativa para este perfil.'}</EmptyState>}
    </Card>
  </>
}
