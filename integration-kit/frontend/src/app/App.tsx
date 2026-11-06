import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Heart, LogOut, Menu, MessageCircle, Pill, ShieldCheck, Sparkles, Wifi, WifiOff, X } from 'lucide-react'
import { api, DEMO_ENABLED, errorText } from '../lib/api'
import { offlinePatients } from '../lib/demoOffline'
import type { Patient, Role } from '../lib/types'
import { useSession } from './SessionProvider'
import { Brand } from '../components/common/Brand'
import { EmptyState, ErrorState, Loading } from '../components/common/Feedback'
import { PwaInstall } from '../components/common/PwaInstall'
import { MedicationCalendar } from '../features/medications'
import { MessageCenter } from '../features/messages'
import { InformationalAssistant } from '../features/assistant'
import { MascotVoice } from '../features/child-voice'
import { DeveloperDashboard } from '../pages/developer/DeveloperDashboard'

const roleNames: Record<Role, string> = { CLINICIAN: 'Profissional de saúde', GUARDIAN: 'Responsável', DEVELOPER: 'Desenvolvedor', CLINICAL_ASSISTANT: 'Assistente' }
function home(role: Role) { return role === 'DEVELOPER' ? '/dev' : role === 'GUARDIAN' ? '/familia/medicamentos' : '/medico/medicamentos' }

function LoginPage() {
  const { user, checking, login, enterOffline } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [offlineRole, setOfflineRole] = useState<Role>('GUARDIAN')
  if (checking) return <Loading/>
  if (user) return <Navigate to={home(user.role)} replace/>
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await login(email, password) } catch (error) { setError(errorText(error)) } finally { setBusy(false) } }
  return <main className="login-page"><section className="login-story"><Brand/><div className="story-content"><span className="eyebrow">CUIDADO QUE APROXIMA</span><h1>Pequenos momentos.<br/>Mais companhia<span>.</span></h1><p>A rotina fica mais acolhedora quando família e equipe caminham juntas.</p><div className="story-panda"><img src="/brand/pendi-symbol.png" alt="Panda da marca Pendi"/></div></div><div className="story-footer"><Heart size={16}/>Com espaço para ser criança.</div></section><section className="login-form-panel"><span className="demo-badge">DEMONSTRAÇÃO</span><div className="login-form-inner"><span className="eyebrow">BEM-VINDO AO PENDI</span><h2>Vamos continuar?</h2><p className="muted">Entre para acompanhar uma jornada compartilhada.</p><form onSubmit={submit}><label htmlFor="login-email">E-mail<input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="seu@email.com" required disabled={busy}/></label><label htmlFor="login-password">Senha<div className="password-input"><input id="login-password" type={visible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required disabled={busy}/><button className="text-button" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? 'Ocultar' : 'Mostrar'}</button></div></label>{error && <ErrorState message={error}/>}<button className="button primary login-submit" disabled={busy}>{busy ? 'Conectando à API…' : 'Entrar'}<ArrowRight size={18}/></button></form>
      {DEMO_ENABLED && <div className="demo-logins"><p className="eyebrow">PREENCHER CONTA FICTÍCIA</p><div className="demo-role-buttons">{([['Médico', 'medico'], ['Família', 'responsavel'], ['Assistente', 'assistente'], ['Dev', 'dev']] as const).map(([label, account]) => <button className="button ghost small" disabled={busy} key={account} onClick={() => { setEmail(`${account}@superped.demo`); setPassword('Demo2026!') }}>{label}</button>)}</div><details><summary>Apresentar sem API</summary><p>Somente leitura, com dados fictícios e sem sincronização.</p><label>Perfil da apresentação<select value={offlineRole} onChange={e => setOfflineRole(e.target.value as Role)}><option value="GUARDIAN">Família</option><option value="CLINICIAN">Médico</option><option value="DEVELOPER">Dev</option></select></label><button className="button ghost" onClick={() => enterOffline(offlineRole)}><WifiOff size={17}/>Abrir apresentação offline</button></details></div>}
      <p className="login-disclaimer"><ShieldCheck size={18}/>Dados inteiramente fictícios.<br/>Não validado para uso clínico.</p></div></section></main>
}

function Protected({ roles }: { roles?: Role[] }) {
  const { user, checking } = useSession()
  if (checking) return <Loading/>
  if (!user) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to={home(user.role)} replace/>
  return <Outlet/>
}

function Workspace() {
  const { user, offline, logout, enterOffline } = useSession()
  const [menu, setMenu] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!user || user.role === 'DEVELOPER') return
    const controller = new AbortController(); setLoading(true); setError('')
    if (offline) { setPatients(offlinePatients); setPatientId(1); setLoading(false); return }
    api<Patient[]>('/api/patients', { signal: controller.signal }).then(data => { if (!controller.signal.aborted) { setPatients(data); setPatientId(previous => data.some(p => p.id === previous) ? previous : data[0]?.id ?? null) } }).catch(error => { if (!controller.signal.aborted) setError(errorText(error)) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user, offline, revision])
  if (!user) return null
  const base = user.role === 'GUARDIAN' ? '/familia' : '/medico'
  const navigation = user.role === 'DEVELOPER' ? [{ path: '/dev', label: 'Status do ambiente', icon: ShieldCheck }] : [{ path: `${base}/medicamentos`, label: 'Medicamentos', icon: Pill }, { path: `${base}/mensagens`, label: 'Mensagens', icon: MessageCircle }, { path: `${base}/ajuda`, label: 'Dúvidas frequentes', icon: BookOpen }]
  const activePatient = patients.find(p => p.id === patientId)
  return <div className="workspace"><a className="skip-link" href="#main-content">Pular para o conteúdo</a>{menu && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setMenu(false)}/>}
    <aside className={`sidebar ${menu ? 'open' : ''}`}><div className="sidebar-brand"><Brand/><button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setMenu(false)}><X/></button></div><div className="sidebar-label">{user.role === 'GUARDIAN' ? 'ESPAÇO DA FAMÍLIA' : user.role === 'DEVELOPER' ? 'AMBIENTE TÉCNICO' : 'ESPAÇO DA EQUIPE'}</div><nav aria-label="Menu principal">{navigation.map(item => <NavLink to={item.path} key={item.path} onClick={() => setMenu(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><item.icon size={19}/>{item.label}<span className="nav-indicator"/></NavLink>)}</nav>
    {user.role === 'GUARDIAN' && activePatient && <div className="child-invitation"><Sparkles size={24}/><h3>Um momento de companhia</h3><p>Abra o espaço de voz junto com a criança.</p><Link className="button" to={`/crianca/${activePatient.id}`}>Conhecer o Pandi<ArrowRight size={16}/></Link></div>}
    <div className="sidebar-bottom"><PwaInstall/><div className="sidebar-line"/><div className="user-card"><div className="user-avatar">{user.name.charAt(0)}</div><div><strong>{user.name}</strong><small>{roleNames[user.role]}</small></div><button className="icon-button" aria-label="Sair da conta" onClick={logout}><LogOut size={18}/></button></div></div></aside>
    <div className="workspace-body"><header className="topbar"><div className="topbar-start"><button className="icon-button mobile-only" aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(true)}><Menu/></button><span className="breadcrumb">Seu cuidado <span>/</span> {user.role === 'GUARDIAN' ? 'Rotina compartilhada' : user.role === 'DEVELOPER' ? 'Ambiente' : 'Acompanhamento'}</span></div><span className="demo-badge">DEMONSTRAÇÃO</span><span className={`connection ${offline ? 'is-offline' : ''}`}>{offline ? <WifiOff size={15}/> : <Wifi size={15}/>}{offline ? 'Offline' : 'API configurada'}</span></header>
    {offline && <div className="offline-banner" role="status"><WifiOff size={18}/><span>Modo offline de apresentação — mudanças não sincronizadas. Somente leitura.</span><button className="text-button" onClick={logout}>Voltar ao login online</button></div>}
    <main id="main-content" className="main-content">{user.role !== 'DEVELOPER' && <div className="patient-switcher"><span className="patient-initial">{activePatient?.name.charAt(0) || '·'}</span><label htmlFor="patient-select"><span>ACOMPANHANDO</span><div><select id="patient-select" value={patientId ?? ''} disabled={loading || !patients.length} onChange={e => setPatientId(Number(e.target.value))}>{!patients.length && <option value="">Nenhum paciente disponível</option>}{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><ChevronDown size={17}/></div></label><span className="fiction-label">Perfil fictício</span></div>}
      {loading ? <Loading/> : error ? <><ErrorState message={error} retry={() => setRevision(n => n + 1)}/>{DEMO_ENABLED && <button className="button ghost" onClick={() => enterOffline(user.role)}>Abrir apresentação offline de leitura</button>}</> : user.role === 'DEVELOPER' ? <DeveloperDashboard offline={offline}/> : patientId ? <Routes><Route path="medicamentos" element={<MedicationCalendar key={`${patientId}:${offline}`} patientId={patientId} role={user.role} offline={offline}/>}/><Route path="mensagens" element={<MessageCenter key={`${patientId}:${offline}`} patientId={patientId} userId={user.id} offline={offline}/>}/><Route path="ajuda" element={<InformationalAssistant offline={offline}/>}/><Route path="*" element={<Navigate to="medicamentos" replace/>}/></Routes> : <EmptyState>{user.role === 'CLINICAL_ASSISTANT' ? 'Nenhuma delegação disponível nesta base de demonstração. O perfil não recebe acesso clínico implicitamente.' : 'Nenhum paciente vinculado disponível.'}</EmptyState>}
    <footer className="app-footer"><span>Pendi · Cuidado que aproxima</span><span>Demonstração acadêmica · Não validado para uso clínico</span></footer></main></div>
  </div>
}

function ChildVoicePage() {
  const { patientId } = useParams()
  const { user, offline } = useSession()
  const navigate = useNavigate()
  const [valid, setValid] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    if (offline) { setValid(offlinePatients.some(p => p.id === Number(patientId))); return }
    api<Patient[]>('/api/patients', { signal: controller.signal }).then(patients => { if (!controller.signal.aborted) { const linked = patients.some(p => p.id === Number(patientId)); setValid(linked); if (!linked) setError('Este perfil não está vinculado à sua sessão.') } }).catch(error => { if (!controller.signal.aborted) setError(errorText(error)) })
    return () => controller.abort()
  }, [patientId, offline])
  return <main className="child-page"><header><Brand/><button className="button ghost" onClick={() => navigate(user ? home(user.role) : '/login')}><ArrowLeft size={18}/>Voltar ao responsável</button></header><span className="demo-badge">DEMONSTRAÇÃO{offline ? ' · OFFLINE' : ''}</span>{error ? <ErrorState message={error}/> : valid ? <MascotVoice/> : <Loading/>}</main>
}

export function App() {
  const { user } = useSession()
  return <Routes><Route path="/login" element={<LoginPage/>}/><Route path="/" element={<Navigate to={user ? home(user.role) : '/login'} replace/>}/><Route element={<Protected roles={['CLINICIAN', 'CLINICAL_ASSISTANT']}/>}><Route path="/medico/*" element={<Workspace/>}/></Route><Route element={<Protected roles={['GUARDIAN']}/>}><Route path="/familia/*" element={<Workspace/>}/><Route path="/crianca/:patientId" element={<ChildVoicePage/>}/></Route><Route element={<Protected roles={['DEVELOPER']}/>}><Route path="/dev" element={<Workspace/>}/></Route><Route path="*" element={<div className="not-found"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></div>}/></Routes>
}
