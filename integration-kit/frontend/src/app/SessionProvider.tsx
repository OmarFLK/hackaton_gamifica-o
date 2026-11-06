import { createContext, useContext, useEffect, useState } from 'react'
import { api, configureApi, DEMO_ENABLED, post } from '../lib/api'
import { offlineUser } from '../lib/demoOffline'
import type { Role, User } from '../lib/types'

interface Session { user: User | null; offline: boolean; checking: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; enterOffline: (role: Role) => void }
const Context = createContext<Session | null>(null)
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [offline, setOffline] = useState(false)
  const [checking, setChecking] = useState(true)
  const logout = () => { sessionStorage.removeItem('superped.token'); setUser(null); setOffline(false) }
  configureApi(() => sessionStorage.getItem('superped.token'), logout)
  useEffect(() => {
    let active = true
    if (!sessionStorage.getItem('superped.token')) { setChecking(false); return }
    api<User>('/api/auth/me').then(u => { if (active) setUser(u) }).catch(() => { sessionStorage.removeItem('superped.token') }).finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])
  const login = async (email: string, password: string) => {
    const data = await post<{ access_token: string; user: User }>('/api/auth/login', { email, password })
    sessionStorage.setItem('superped.token', data.access_token)
    setOffline(false); setUser(data.user)
  }
  const enterOffline = (role: Role) => { if (!DEMO_ENABLED) return; sessionStorage.removeItem('superped.token'); setOffline(true); setUser(offlineUser(role)) }
  return <Context.Provider value={{ user, offline, checking, login, logout, enterOffline }}>{children}</Context.Provider>
}
export function useSession() { const session = useContext(Context); if (!session) throw new Error('SessionProvider ausente'); return session }
