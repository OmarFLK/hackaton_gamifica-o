import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle, Search } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { api, errorText } from '../../lib/api'
import { offlinePatients } from '../../lib/demoOffline'
import type { Conversation } from '../../lib/types'
import { EmptyState, ErrorState, Loading } from '../../components/common/Feedback'
import { MessageCenter } from './MessageCenter'
import { NoticeComposer } from './NoticeComposer'
import { NOTIFICATIONS_REFRESH } from '../notifications/events'

export function ConversationInbox() {
  const { user, offline } = useAuth()
  const { selected: activePatient, select } = usePatients()
  const [params, setParams] = useSearchParams()
  const selectedId = Number(params.get('paciente')) || (user?.role === 'GUARDIAN' ? activePatient?.id : null) || null
  const [items, setItems] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [revision, setRevision] = useState(0)
  const inFlight = useRef(false)
  useEffect(() => {
    const requested = Number(params.get('paciente'))
    if (user?.role === 'GUARDIAN' && requested && items.some(item => item.patient_id === requested) && activePatient?.id !== requested) select(requested)
  }, [params, user?.role, items, activePatient?.id, select])
  useEffect(() => {
    const controller = new AbortController()
    if (offline) { setItems(offlinePatients.map(p => ({ patient_id: p.id, patient_name: p.name, chosen_avatar: p.chosen_avatar, last_message: null, unread_count: 0 }))); setLoading(false); return }
    const fetchItems = async () => {
      if (inFlight.current || document.visibilityState === 'hidden') return
      inFlight.current = true
      try { const data = await api<Conversation[]>('/api/conversations', { signal: controller.signal }); if (!controller.signal.aborted) { setItems(data); setError('') } }
      catch (error) { if (!controller.signal.aborted) setError(errorText(error)) }
      finally { inFlight.current = false; if (!controller.signal.aborted) setLoading(false) }
    }
    void fetchItems()
    const refresh = () => void fetchItems()
    const timer = setInterval(refresh, 5000)
    window.addEventListener(NOTIFICATIONS_REFRESH, refresh)
    return () => { controller.abort(); inFlight.current = false; clearInterval(timer); window.removeEventListener(NOTIFICATIONS_REFRESH, refresh) }
  }, [offline, revision])
  const selected = items.find(item => item.patient_id === selectedId)
  if (!user) return null
  return <><div className="page-heading"><div><span className="eyebrow">FAMÍLIA E EQUIPE CONECTADAS</span><h1>Central de conversas<span className="heading-dot">.</span></h1><p className="muted">Converse com as pessoas vinculadas ao acompanhamento. Para falar com a IA, use Assistente IA.</p></div></div><div className="conversation-workspace"><aside className="conversation-list" aria-label="Conversas por paciente"><label className="conversation-search"><Search size={17}/><span className="sr-only">Buscar conversa</span><input aria-label="Buscar conversa" placeholder="Buscar paciente…" value={search} onChange={e => setSearch(e.target.value)}/></label>{loading && <Loading/>}{error && <ErrorState message={error} retry={() => setRevision(n => n + 1)}/>}{items.filter(item => item.patient_name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(item => <button className={`conversation-item ${selectedId === item.patient_id ? 'selected' : ''}`} key={item.patient_id} onClick={() => setParams({ paciente: String(item.patient_id) })}><span className="conversation-avatar">{item.patient_name.charAt(0)}</span><span className="conversation-item-content"><strong>{item.patient_name}</strong><small>{item.last_message ? `${item.last_message.sender_name}: ${item.last_message.body}` : 'Iniciar conversa com família e equipe'}</small></span>{item.unread_count > 0 && <span className="conversation-unread">{item.unread_count}</span>}</button>)}{!loading && !items.length && !error && <EmptyState>Nenhum paciente vinculado disponível.</EmptyState>}</aside><div className="conversation-detail">{selected ? <><div className="conversation-selected"><MessageCircle size={20}/><strong>{selected.patient_name}</strong><span>Conversa entre pessoas</span></div><MessageCenter key={`${selected.patient_id}:${offline}`} patientId={selected.patient_id} userId={user.id} offline={offline}/><NoticeComposer key={selected.patient_id} patientId={selected.patient_id} offline={offline}/></> : <section className="card conversation-welcome"><MessageCircle size={44}/><h2>Selecione uma conversa</h2><p>{selectedId && !loading ? 'Esse paciente não está na sua lista de vínculos.' : 'Escolha um paciente da lista para trocar mensagens com a família e a equipe.'}</p></section>}</div></div></>
}
