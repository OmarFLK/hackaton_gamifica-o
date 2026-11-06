import { useCallback, useEffect, useRef, useState } from 'react'
import { api, errorText, post } from '../../lib/api'
import { useAuth } from '../../app/AuthProvider'
import type { NotificationList, UserNotification } from '../../lib/types'
import { NOTIFICATIONS_REFRESH, refreshNotifications } from './events'

export function useNotifications() {
  const { user, offline } = useAuth()
  const [data, setData] = useState<NotificationList>({ items: [], unread_count: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [arrival, setArrival] = useState<UserNotification | null>(null)
  const lastId = useRef<number | null>(null)
  const pending = useRef<AbortController | null>(null)
  const allowed = !offline && (user?.role === 'CLINICIAN' || user?.role === 'GUARDIAN')
  const refresh = useCallback(async () => {
    if (!allowed || pending.current || document.visibilityState === 'hidden') return
    const controller = new AbortController(); pending.current = controller; setLoading(true)
    try {
      const response = await api<NotificationList>('/api/notifications', { signal: controller.signal })
      if (controller.signal.aborted) return
      const latest = response.items[0]?.id ?? 0
      if (lastId.current !== null && latest > lastId.current) {
        const item = response.items.find(item => !item.read_at && item.id > (lastId.current ?? 0))
        if (item) setArrival(item)
      }
      lastId.current = latest; setData(response); setError('')
    } catch (error) { if (!controller.signal.aborted) setError(errorText(error)) }
    finally { if (pending.current === controller) pending.current = null; if (!controller.signal.aborted) setLoading(false) }
  }, [allowed, user?.id])
  useEffect(() => {
    lastId.current = null; setData({ items: [], unread_count: 0 }); setArrival(null)
    void refresh()
    const tick = () => void refresh()
    const timer = setInterval(tick, 5000)
    window.addEventListener(NOTIFICATIONS_REFRESH, tick)
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(timer); pending.current?.abort(); pending.current = null; window.removeEventListener(NOTIFICATIONS_REFRESH, tick); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick) }
  }, [refresh])
  const read = async (id: number) => {
    try { await post(`/api/notifications/${id}/read`, {}); setData(previous => ({ items: previous.items.map(item => item.id === id ? { ...item, read_at: new Date().toISOString() } : item), unread_count: Math.max(0, previous.unread_count - (previous.items.some(item => item.id === id && !item.read_at) ? 1 : 0)) })); refreshNotifications() }
    catch (error) { setError(errorText(error)); throw error }
  }
  const readAll = async () => { try { await post('/api/notifications/read-all', {}); setData(previous => ({ items: previous.items.map(item => ({ ...item, read_at: item.read_at || new Date().toISOString() })), unread_count: 0 })); refreshNotifications() } catch (error) { setError(errorText(error)) } }
  return { ...data, error, loading, offline, refresh, read, readAll, arrival, dismissArrival: () => setArrival(null) }
}
