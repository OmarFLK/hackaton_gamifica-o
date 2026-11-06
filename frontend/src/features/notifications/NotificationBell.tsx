import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BellRing, CheckCheck, X } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { useNotifications } from './useNotifications'

export function NotificationBell() {
  const { user } = useAuth()
  const { items, unread_count, error, offline, read, readAll, arrival, dismissArrival } = useNotifications()
  const [open, setOpen] = useState(false)
  const [permission, setPermission] = useState('')
  const container = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close); document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape) }
  }, [open])
  useEffect(() => {
    if (arrival && 'Notification' in window && Notification.permission === 'granted' && window.isSecureContext) {
      try { new Notification('Pendi', { body: 'Você tem uma nova mensagem ou aviso. Abra o Pendi para consultar.', icon: '/brand/pendi-symbol.png', tag: `pendi-${arrival.id}` }) } catch { /* O sino e o aviso na tela continuam disponíveis. */ }
    }
  }, [arrival])
  if (!user || !['CLINICIAN', 'GUARDIAN'].includes(user.role)) return null
  const base = user.role === 'CLINICIAN' ? '/medico' : '/familia'
  const enable = async () => {
    if (!('Notification' in window) || !window.isSecureContext) { setPermission('Use os avisos no sino. Notificações do navegador não estão disponíveis aqui.'); return }
    try { const value = await Notification.requestPermission(); setPermission(value === 'granted' ? 'Notificações ativadas com o aplicativo aberto.' : 'Permissão não concedida; os avisos continuam no sino.') }
    catch { setPermission('Use os avisos no sino.') }
  }
  const openItem = async (id: number, url: string) => { try { await read(id); setOpen(false); navigate(url) } catch { /* Erro exibido no painel. */ } }
  return <div className="notifications-control" ref={container}>
    <button className="icon-button notification-bell" aria-label={`Notificações, ${unread_count} não lidas`} aria-expanded={open} onClick={() => setOpen(!open)}><Bell size={21}/>{unread_count > 0 && <span className="notification-counter">{unread_count > 99 ? '99+' : unread_count}</span>}</button>
    {open && <section className="notification-popover" aria-label="Painel de notificações"><header><h2>Notificações</h2><button className="icon-button" aria-label="Fechar notificações" onClick={() => setOpen(false)}><X size={18}/></button></header>{offline ? <p className="empty">Avisos indisponíveis na apresentação offline.</p> : <>{error && <p className="field-error" role="alert">{error}</p>}{!items.length && !error && <p className="empty">Nenhuma notificação por enquanto.</p>}{items.slice(0, 6).map(item => <button key={item.id} className={`notification-item ${item.read_at ? '' : 'unread'}`} onClick={() => void openItem(item.id, item.target_url)}><span className="notification-item-title">{item.title}{!item.read_at && <i/>}</span><span>{item.actor_name} · {item.patient_name}</span><p>{item.body}</p><time>{new Date(item.created_at).toLocaleString('pt-BR')}</time></button>)}</>}
    <div className="notification-footer"><button className="text-button" disabled={offline || !unread_count} onClick={() => void readAll()}><CheckCheck size={15}/>Marcar todas como lidas</button><Link to={`${base}/notificacoes`} onClick={() => setOpen(false)}>Ver todas</Link><button className="text-button" disabled={offline} onClick={() => void enable()}>Ativar aviso do navegador</button></div>{permission && <p className="small-text notification-permission" role="status">{permission}</p>}<p className="small-text notification-permission">Atualiza com a página aberta. Não garante entrega com o app fechado.</p></section>}
    {arrival && <div className="message-arrival-toast" role="status"><BellRing size={22}/><div><strong>Nova mensagem ou aviso no Pendi</strong><button className="text-button" onClick={() => { setOpen(true); dismissArrival() }}>Ver notificação</button></div><button className="icon-button" onClick={dismissArrival} aria-label="Fechar aviso recebido"><X size={18}/></button></div>}
  </div>
}
