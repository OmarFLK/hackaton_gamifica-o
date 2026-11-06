import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, Bell, Bot, BookOpen, ChevronDown, Droplets, HeartHandshake, LayoutDashboard, LogOut, Menu, MessageCircle, Pill, ShieldCheck, Smile, Sparkles, UserPlus, Users, Wifi, WifiOff, X, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import type { Role } from '../../lib/types'
import { Brand } from '../common/Brand'
import { PwaInstall } from '../common/PwaInstall'
import { DemoBadge } from '../ui/Badge'
import { NotificationBell } from '../../features/notifications/NotificationBell'
import { PreferencesControls } from '../common/PreferencesControls'

interface NavItem { path: string; label: string; icon: LucideIcon; end?: boolean }
const ROLE_NAMES: Record<Role, string> = { CLINICIAN: 'Profissional de saúde', CLINICAL_ASSISTANT: 'Assistente', GUARDIAN: 'Responsável', DEVELOPER: 'Desenvolvedor' }

function navigationFor(role: Role): { label: string; items: NavItem[] } {
  if (role === 'GUARDIAN') return { label: 'ESPAÇO DA FAMÍLIA', items: [
    { path: '/familia', label: 'Início', icon: LayoutDashboard, end: true },
    { path: '/familia/rotina', label: 'Água e refeições', icon: Droplets },
    { path: '/familia/humor', label: 'Como está hoje', icon: Smile },
    { path: '/familia/medicamentos', label: 'Medicamentos', icon: Pill },
    { path: '/familia/mensagens', label: 'Mensagens', icon: MessageCircle },
    { path: '/familia/notificacoes', label: 'Notificações', icon: Bell },
    { path: '/familia/ia', label: 'Assistente IA', icon: Bot },
    { path: '/familia/ajuda', label: 'Dúvidas frequentes', icon: BookOpen },
  ] }
  if (role === 'DEVELOPER') return { label: 'AMBIENTE TÉCNICO', items: [{ path: '/dev', label: 'Status do ambiente', icon: ShieldCheck, end: true }] }
  return { label: 'ESPAÇO DA EQUIPE', items: [
    { path: '/medico', label: 'Painel', icon: LayoutDashboard, end: true },
    { path: '/medico/pacientes', label: 'Pacientes', icon: Users, end: true },
    { path: '/medico/pacientes/novo', label: 'Novo paciente', icon: UserPlus },
    ...(role === 'CLINICIAN' ? [{ path: '/medico/responsaveis/novo', label: 'Novo responsável', icon: Users }] : []),
    ...(role === 'CLINICIAN' ? [
      { path: '/medico/mensagens', label: 'Mensagens', icon: MessageCircle },
      { path: '/medico/notificacoes', label: 'Notificações', icon: Bell },
      { path: '/medico/ia', label: 'Assistente IA', icon: Bot },
    ] : []),
    { path: '/medico/ajuda', label: 'Dúvidas frequentes', icon: BookOpen },
  ] }
}

/** Seletor de paciente vinculado (família). A lista vem filtrada pelo backend. */
function PatientSwitcher() {
  const { patients, selected, select, loading } = usePatients()
  return <div className="patient-switcher">
    <span className="patient-initial" aria-hidden="true">{selected?.name.charAt(0) || '·'}</span>
    <label htmlFor="patient-select"><span>ACOMPANHANDO</span><div>
      <select id="patient-select" value={selected?.id ?? ''} disabled={loading || !patients.length} onChange={e => select(Number(e.target.value))}>
        {!patients.length && <option value="">Nenhum paciente vinculado</option>}
        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select><ChevronDown size={17}/></div></label>
    <span className="fiction-label">Perfil fictício</span>
  </div>
}

/** Layout adulto: sidebar azul-noite no desktop, drawer no mobile. Selo DEMONSTRAÇÃO sempre visível. */
export function AdultLayout() {
  const { user, offline, logout } = useAuth()
  const { selected } = usePatients()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  if (!user) return null
  const nav = navigationFor(user.role)

  return <div className="workspace">
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    {open && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Navegação">
      <div className="sidebar-brand"><Brand/><button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setOpen(false)}><X/></button></div>
      <div className="sidebar-label">{nav.label}</div>
      <nav aria-label="Menu principal">{nav.items.map(item => <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><item.icon size={19}/>{item.label}<span className="nav-indicator"/></NavLink>)}</nav>
      {user.role === 'GUARDIAN' && selected && <div className="child-invitation">
        <Sparkles size={24}/><h3>Mundo da criança</h3><p>Abra junto com {selected.name.split(' ')[0]}: mascotes, sentimentos e brincadeiras.</p>
        <Link className="button" to={`/crianca/${selected.id}`}>Entrar no mundo<ArrowRight size={16}/></Link>
      </div>}
      <div className="sidebar-bottom"><PwaInstall/><div className="sidebar-line"/>
        <div className="user-card"><div className="user-avatar" aria-hidden="true">{user.name.charAt(0)}</div><div><strong>{user.name}</strong><small>{ROLE_NAMES[user.role]}</small></div><button className="icon-button" aria-label="Sair da conta" onClick={logout}><LogOut size={18}/></button></div>
      </div>
    </aside>
    <div className="workspace-body">
      <header className="topbar">
        <div className="topbar-start"><button className="icon-button mobile-only" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu/></button><span className="breadcrumb">Pendi <span>/</span> {nav.label.toLowerCase().replace(/^\w/, c => c.toUpperCase())}</span></div>
        <DemoBadge/>
        <PreferencesControls/>
        <NotificationBell/>
        <span className={`connection ${offline ? 'is-offline' : ''}`}>{offline ? <WifiOff size={15}/> : <Wifi size={15}/>}{offline ? 'Offline' : 'API conectada'}</span>
      </header>
      {offline && <div className="offline-banner" role="status"><WifiOff size={18}/><span>Modo offline de apresentação — dados fictícios, somente leitura, nada é sincronizado.</span><button className="text-button" onClick={logout}>Voltar ao login online</button></div>}
      <main id="main-content" className="main-content">
        {user.role === 'GUARDIAN' && !location.pathname.endsWith('/mensagens') && <PatientSwitcher/>}
        <Outlet/>
        <footer className="app-footer"><span><HeartHandshake size={12}/> Pendi · Cuidado que aproxima</span><span>Demonstração acadêmica · Dados fictícios · Não validado para uso clínico</span></footer>
      </main>
    </div>
  </div>
}
