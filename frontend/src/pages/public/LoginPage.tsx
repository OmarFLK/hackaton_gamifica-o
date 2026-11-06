import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Heart, ShieldCheck, WifiOff } from 'lucide-react'
import { homeFor, useAuth } from '../../app/AuthProvider'
import { DEMO_ENABLED, errorText } from '../../lib/api'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../lib/demo'
import type { Role, User } from '../../lib/types'
import { Brand } from '../../components/common/Brand'
import { ErrorState, Loading } from '../../components/common/Feedback'
import { DemoBadge } from '../../components/ui/Badge'

type Profile = 'profissional' | 'responsavel' | 'dev'
const PROFILES: { id: Profile; label: string; hint: string }[] = [
  { id: 'profissional', label: 'Profissional', hint: 'Médico(a) ou assistente da equipe' },
  { id: 'responsavel', label: 'Responsável', hint: 'Família da criança acompanhada' },
  { id: 'dev', label: 'Desenvolvedor', hint: 'Somente telemetria técnica' },
]
const PROFILE_ROLES: Record<Profile, Role[]> = { profissional: ['CLINICIAN', 'CLINICAL_ASSISTANT'], responsavel: ['GUARDIAN'], dev: ['DEVELOPER'] }
const OFFLINE_ROLE: Record<Profile, Role> = { profissional: 'CLINICIAN', responsavel: 'GUARDIAN', dev: 'DEVELOPER' }

/** Formulário desacoplado: recebe o login por callback (AuthProvider), testável isoladamente. */
export function LoginForm({ profile, onLogin, onOffline }: { profile: Profile; onLogin: (email: string, password: string) => Promise<void>; onOffline?: (role: Role) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) { setError('Informe e-mail e senha.'); return }
    setBusy(true); setError('')
    try { await onLogin(email, password) } catch (err) { setError(errorText(err)) } finally { setBusy(false) }
  }
  const accounts = DEMO_ACCOUNTS.filter(account => account.profile === profile)
  return <>
    <form onSubmit={submit} noValidate>
      <label htmlFor="login-email">E-mail<input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="nome@exemplo.com" required disabled={busy} aria-invalid={!!error || undefined}/></label>
      <label htmlFor="login-password">Senha<div className="password-input"><input id="login-password" type={visible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required disabled={busy}/><button className="text-button" type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? 'Ocultar' : 'Mostrar'}</button></div></label>
      {error && <ErrorState message={error}/>}
      <button className="button primary login-submit" type="submit" disabled={busy}>{busy ? 'Conectando à API…' : 'Entrar'}<ArrowRight size={18}/></button>
    </form>
    {DEMO_ENABLED && <div className="demo-logins">
      <p className="eyebrow">PREENCHER CONTA FICTÍCIA · DEMO</p>
      <div className="demo-role-buttons">{accounts.map(account => <button type="button" className="button ghost small" disabled={busy} key={account.email} onClick={() => { setEmail(account.email); setPassword(DEMO_PASSWORD); setError('') }}>{account.label}</button>)}</div>
      {onOffline && <details><summary>Apresentar sem API</summary><p>Somente leitura, com dados fictícios e sem sincronização.</p><button type="button" className="button ghost" onClick={() => onOffline(OFFLINE_ROLE[profile])}><WifiOff size={17}/>Abrir apresentação offline</button></details>}
    </div>}
  </>
}

export function LoginPage() {
  const { user, checking, expired, login, enterOffline } = useAuth()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const profile = (PROFILES.some(p => p.id === params.get('perfil')) ? params.get('perfil') : 'profissional') as Profile
  const toChild = params.get('destino') === 'crianca'
  if (checking) return <Loading/>
  if (user) return <Navigate to={homeFor(user.role)} replace/>

  const onLogin = async (email: string, password: string) => {
    const logged: User = await login(email, password)
    if (!PROFILE_ROLES[profile].includes(logged.role)) {
      // Não bloqueia: o perfil real vem do servidor. Apenas direciona para a área correta.
      navigate(homeFor(logged.role), { replace: true }); return
    }
    navigate(logged.role === 'GUARDIAN' && toChild ? '/familia?mundo=1' : homeFor(logged.role), { replace: true })
  }

  return <main className="login-page">
    <section className="login-story">
      <Link to="/" className="back-link"><ArrowLeft size={16}/>Início</Link>
      <Brand/>
      <div className="story-content"><span className="eyebrow">CUIDADO QUE APROXIMA</span><h1>Pequenos momentos.<br/>Mais companhia<span>.</span></h1><p>A rotina fica mais acolhedora quando família e equipe caminham juntas.</p><div className="story-panda"><img src="/brand/pendi-symbol.png" alt=""/></div></div>
      <div className="story-footer"><Heart size={16}/>Com espaço para ser criança.</div>
    </section>
    <section className="login-form-panel">
      <DemoBadge/>
      <div className="login-form-inner">
        <span className="eyebrow">BEM-VINDO AO PENDI</span>
        <h2>Como você quer entrar?</h2>
        <div className="profile-tabs" role="radiogroup" aria-label="Perfil de acesso">
          {PROFILES.map(p => <button key={p.id} type="button" role="radio" aria-checked={profile === p.id} className={`profile-tab ${profile === p.id ? 'active' : ''}`} onClick={() => setParams({ perfil: p.id })}><strong>{p.label}</strong><small>{p.hint}</small></button>)}
        </div>
        {toChild && profile === 'responsavel' && <div className="notice"><p><strong>Espaço infantil:</strong> a criança não tem senha. Entre como responsável e abra o mundo dela junto com ela.</p></div>}
        {expired && <div className="notice warning" role="status"><p>Sua sessão expirou. Entre novamente.</p></div>}
        <LoginForm key={profile} profile={profile} onLogin={onLogin} onOffline={enterOffline}/>
        <p className="login-disclaimer"><ShieldCheck size={18}/>Dados inteiramente fictícios.<br/>Não validado para uso clínico.</p>
      </div>
    </section>
  </main>
}

export function NotFoundPage() {
  return <main className="not-found"><h1>Página não encontrada</h1><Link className="button primary" to="/">Voltar ao início</Link></main>
}
