import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, UserPlus } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { ageFrom, formatBirth } from '../../lib/format'
import { EmptyState, ErrorState, Loading, PageHeading } from '../../components/ui'
import { PandiAvatar, mascotById } from '../child/mascots'

const normalize = (text: string) => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '')

export function PatientsPage() {
  const { offline } = useAuth()
  const { patients, loading, error, refresh } = usePatients()
  const [query, setQuery] = useState('')
  const filtered = patients.filter(p => normalize(p.name).includes(normalize(query.trim())))
  return <>
    <PageHeading eyebrow="PACIENTES VINCULADOS" title="Pacientes" subtitle="A lista mostra apenas pacientes do seu escopo, conferido pelo servidor."
      action={!offline && <Link className="button primary" to="/medico/pacientes/novo"><UserPlus size={18}/>Cadastrar paciente</Link>}/>
    <div className="search-box"><Search size={18} aria-hidden="true"/><label className="sr-only" htmlFor="patient-search">Buscar paciente</label><input id="patient-search" type="search" placeholder="Buscar por nome fictício" value={query} onChange={e => setQuery(e.target.value)}/></div>
    {loading ? <Loading/> : error ? <ErrorState message={error} retry={refresh}/> : !filtered.length ? <EmptyState>{patients.length ? 'Nenhum paciente com esse nome.' : 'Nenhum paciente vinculado ao seu perfil.'}</EmptyState> :
      <ul className="patient-grid">{filtered.map(p => {
        const mascot = mascotById(p.chosen_avatar)
        return <li key={p.id} className="patient-card">
          <PandiAvatar size={56}/>
          <div className="patient-card-body"><h2>{p.name}</h2><p>{ageFrom(p.birth_date)} anos · nasc. {formatBirth(p.birth_date)}</p><small>Companheiro: {mascot.name}</small></div>
          <Link className="button ghost small" to={`/medico/pacientes/${p.id}`} aria-label={`Abrir ficha de ${p.name}`}>Abrir ficha<ArrowRight size={16}/></Link>
        </li>
      })}</ul>}
  </>
}
