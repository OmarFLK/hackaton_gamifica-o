import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, PageHeading } from '../../components/ui'
import { GuardianCreateForm } from './GuardianCreateForm'

export function GuardianCreatePage() {
  return <><PageHeading eyebrow="EQUIPE E FAMÍLIA" title="Cadastrar responsável" subtitle="Crie o acesso da família e depois vincule a conta à criança."/>
    <Card><CardHeader title="Novo responsável"/><GuardianCreateForm/></Card>
    <Link className="button ghost" to="/medico/pacientes/novo">Cadastrar uma criança<ArrowRight size={18}/></Link>
    <Link className="button ghost" to="/medico/pacientes">Vincular a uma criança existente<ArrowRight size={18}/></Link>
  </>
}
