import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, CheckCircle2, Code2, RefreshCw, Server, ShieldCheck } from 'lucide-react'
import { api, API_URL, errorText } from '../../lib/api'
import type { DeveloperStatus } from '../../lib/types'
import { ErrorState, Loading } from '../../components/common/Feedback'

export function DeveloperDashboard({ offline = false }: { offline?: boolean }) {
  const [status, setStatus] = useState<DeveloperStatus | null>(null)
  const [checking, setChecking] = useState(!offline)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState<Date | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (offline) { setStatus(null); setChecking(false); return }
    const controller = new AbortController(); setChecking(true); setError('')
    api<DeveloperStatus>('/api/developer/status', { signal: controller.signal }).then(data => { if (!controller.signal.aborted) { setStatus(data); setUpdated(new Date()) } }).catch(error => { if (!controller.signal.aborted) { setStatus(null); setError(errorText(error)) } }).finally(() => { if (!controller.signal.aborted) setChecking(false) })
    return () => controller.abort()
  }, [offline, revision])
  return <>
    <div className="page-heading"><div><span className="eyebrow">ÁREA DO DESENVOLVEDOR</span><h1>Saúde do ambiente<span className="heading-dot">.</span></h1><p className="muted">Visibilidade técnica do ambiente demonstrativo.</p></div><button className="button primary" onClick={() => setRevision(n => n + 1)} disabled={offline || checking}><RefreshCw size={18}/>Verificar agora</button></div>
    <div className="notice"><ShieldCheck/><p><strong>Somente informações técnicas.</strong> Este perfil não acessa pacientes, relatos, prescrições ou mensagens.</p></div>
    {checking && <Loading/>}{error && <ErrorState message={error} retry={() => setRevision(n => n + 1)}/>}
    <div className="stats-grid"><article className="stat-card"><div className="stat-icon green"><Activity/></div><span>API</span><strong className="status-title">{checking ? 'Verificando' : status?.api === 'ok' ? 'Operacional' : 'Offline'}</strong><small>{offline ? 'Sem consultar o servidor neste modo' : 'Última tentativa de conexão'}</small></article><article className="stat-card"><div className="stat-icon"><Server/></div><span>Ambiente</span><strong className="status-title">Demonstração</strong><small>Dados técnicos, sem registros pessoais</small></article><article className="stat-card"><div className="stat-icon pink"><Code2/></div><span>Versão informada</span><strong>{status?.version || '—'}</strong><small>{updated ? `Checagem: ${updated.toLocaleTimeString('pt-BR')}` : 'Ainda sem checagem online'}</small></article></div>
    <section className="card"><div className="section-heading"><h2>Módulos registrados</h2>{!offline && <a className="button ghost small" href={`${API_URL}/docs`} target="_blank" rel="noreferrer">Documentação da API<ArrowUpRight size={17}/></a>}</div>{status?.modules.map(module => <div className="module-row" key={module}><Code2 size={19}/><strong>{module}</strong><span className="status-badge given"><CheckCircle2 size={14}/>Registrado na API</span></div>)}{!status && <p className="muted">Conecte a API para consultar os módulos. Nenhum resultado foi inventado.</p>}</section>
  </>
}
