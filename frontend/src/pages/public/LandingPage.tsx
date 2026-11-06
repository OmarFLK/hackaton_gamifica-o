import { Link } from 'react-router-dom'
import { ArrowRight, Code2, HeartHandshake, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import { useAuth, homeFor } from '../../app/AuthProvider'
import { Brand } from '../../components/common/Brand'
import { DemoBadge } from '../../components/ui/Badge'

const ENTRIES = [
  { to: '/login?perfil=profissional', icon: Stethoscope, title: 'Sou profissional', text: 'Pacientes vinculados, cadastro, agenda e mensagens com a família.' },
  { to: '/login?perfil=responsavel', icon: HeartHandshake, title: 'Sou responsável', text: 'Rotina, humor, medicamentos relatados e conversa com a equipe.' },
  { to: '/login?perfil=responsavel&destino=crianca', icon: Sparkles, title: 'Espaço infantil', text: 'Mascotes, sentimentos e brincadeiras. Aberto pelo responsável, sem senha para a criança.' },
  { to: '/login?perfil=dev', icon: Code2, title: 'Desenvolvedor', text: 'Saúde do ambiente e módulos, sem acesso a dados de pacientes.' },
]

export function LandingPage() {
  const { user } = useAuth()
  return <div className="landing">
    <header className="landing-header"><Brand/><DemoBadge/>{user ? <Link className="button ghost small" to={homeFor(user.role)}>Continuar como {user.name.split(' ')[0]}<ArrowRight size={16}/></Link> : <Link className="button ghost small" to="/login">Entrar</Link>}</header>
    <main className="landing-main" id="main-content">
      <section className="landing-hero">
        <span className="eyebrow">SUPERPED · JORNADA CORAJOSA</span>
        <h1>Cuidado que aproxima<span className="heading-dot">.</span></h1>
        <p>Família e equipe acompanham a rotina de crianças em tratamento num só lugar — e a criança ganha um espaço só dela para brincar e contar como está.</p>
        <div className="landing-notice" role="note"><ShieldCheck size={20}/><p><strong>Demonstração acadêmica.</strong> Todos os dados são fictícios. Não oferece diagnóstico, dose ou aconselhamento médico e não foi validado para uso clínico.</p></div>
      </section>
      <section className="entry-grid" aria-label="Escolha como entrar">
        {ENTRIES.map(entry => <Link key={entry.title} to={entry.to} className="entry-card">
          <span className="entry-icon"><entry.icon size={24}/></span>
          <h2>{entry.title}</h2><p>{entry.text}</p><span className="entry-go">Entrar<ArrowRight size={16}/></span>
        </Link>)}
      </section>
    </main>
    <footer className="landing-footer"><span>Hackathon Instituto Mauá de Tecnologia × Centro Universitário São Camilo</span><span>Pendi (SuperPed) · Demonstração · Dados 100% fictícios</span></footer>
  </div>
}
