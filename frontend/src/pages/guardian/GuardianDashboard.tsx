import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Droplets, Pill, Smile, Sparkles, Utensils } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { ROUTINE_DISCLAIMER } from '../../lib/demo'
import { dayKey, formatDateTime, moodByDay, nextTime, waterByDay } from '../../lib/format'
import { Card, CardHeader, EmptyState, ErrorState, Loading, MoodChart, PageHeading, StatCard, WaterChart } from '../../components/ui'
import { MOOD_LABELS } from '../../components/ui/Charts'
import { PandiPoseImage, mascotById } from '../child/mascots'
import { useDashboard } from './useGuardianData'

export function GuardianDashboard() {
  const { user } = useAuth()
  const { patients, selected, loading: loadingPatients, error: patientsError, refresh } = usePatients()
  const { data, loading, error, reload } = useDashboard(selected?.id)
  const [params] = useSearchParams()
  if (loadingPatients) return <Loading/>
  if (patientsError) return <ErrorState message={patientsError} retry={refresh}/>
  if (!selected) return <EmptyState>Nenhuma criança vinculada à sua conta. O vínculo é feito pela equipe de saúde.</EmptyState>

  const today = dayKey(new Date())
  const todayMoods = data?.mood_last_7_days.filter(m => dayKey(new Date(m.recorded_at)) === today) ?? []
  const lastMood = todayMoods.at(-1)
  const todayWater = data?.water_entries.filter(w => dayKey(new Date(w.recorded_at)) === today) ?? []
  const todayMeals = data?.meal_entries.filter(m => dayKey(new Date(m.recorded_at)) === today) ?? []
  const next = data ? nextTime(data.upcoming_medications) : null
  const mascot = mascotById(selected.chosen_avatar)
  const firstName = selected.name.split(' ')[0]

  return <>
    <PageHeading eyebrow="ESPAÇO DA FAMÍLIA" title={`Olá, ${user?.name.split(' ')[0]}`} subtitle={`Acompanhando ${firstName}. ${patients.length > 1 ? 'Troque a criança no seletor acima.' : ''}`}/>
    <section className={`child-world-cta ${params.get('mundo') ? 'highlight' : ''}`}>
      <PandiPoseImage pose="principal" size={110} title={mascot.name}/>
      <div><h2>Mundo de {firstName}</h2><p>Abra junto com a criança: escolher companheiro, contar como está e brincar. Ela não precisa de senha.</p></div>
      <Link className="button primary" to={`/crianca/${selected.id}`}><Sparkles size={18}/>Entrar no mundo da criança<ArrowRight size={18}/></Link>
    </section>
    {loading ? <Loading/> : error ? <ErrorState message={error} retry={reload}/> : data && <>
      <div className="stats-grid four">
        <StatCard label="Como está hoje?" value={lastMood ? MOOD_LABELS[lastMood.score] : 'Sem informação'} hint={lastMood ? `${lastMood.source === 'CHILD' ? 'Pela criança' : 'Pela família'} · ${formatDateTime(lastMood.recorded_at)}` : <Link to="/familia/humor">Registrar agora</Link>} icon={<Smile/>}/>
        <StatCard label="Próximo registro de medicamento" value={next ? next.time : 'Sem informação'} hint={next ? `${next.label} · horário fictício` : data.upcoming_medications.length ? 'Nenhum horário restante hoje' : 'Sem agenda definida pela equipe'} icon={<Pill/>} tone="pink"/>
        <StatCard label="Água relatada hoje" value={todayWater.length ? `${todayWater.reduce((s, w) => s + (w.quantity ?? 0), 0)} ml` : 'Sem informação'} hint={`${todayWater.length} registro(s)`} icon={<Droplets/>} tone="green"/>
        <StatCard label="Alimentação registrada hoje" value={todayMeals.length ? String(todayMeals.length) : 'Sem informação'} hint={todayMeals.at(-1)?.description ?? <Link to="/familia/rotina">Registrar refeição</Link>} icon={<Utensils/>}/>
      </div>
      <div className="two-columns">
        <Card><CardHeader eyebrow="ÚLTIMOS 7 DIAS" title="Humor relatado" subtitle="Relatado pela criança e pela família."/><MoodChart points={moodByDay(data.mood_last_7_days)}/></Card>
        <Card><CardHeader eyebrow="ÚLTIMOS 7 DIAS" title="Água relatada" subtitle="Total informado por dia."/><WaterChart points={waterByDay(data.water_entries)}/></Card>
      </div>
      <Card><CardHeader title="Refeições registradas" action={<Link className="button ghost small" to="/familia/rotina">Registrar<ArrowRight size={16}/></Link>}/>
        {data.meal_entries.length ? <ul className="activity-list">{data.meal_entries.slice(0, 6).map(m => <li key={m.id}><Utensils size={16}/><div><span>{m.description}</span><small>{formatDateTime(m.recorded_at)}</small></div></li>)}</ul> : <EmptyState>Sem informação nos últimos 7 dias.</EmptyState>}
      </Card>
      <p className="muted small-text">{ROUTINE_DISCLAIMER} Para dúvidas sobre saúde, fale com a equipe responsável.</p>
    </>}
  </>
}
