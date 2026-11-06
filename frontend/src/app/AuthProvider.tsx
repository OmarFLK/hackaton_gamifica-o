import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api, configureApi, DEMO_ENABLED, post } from '../lib/api'
import { offlineUser } from '../lib/demoOffline'
import type { LoginResponse, Role, User } from '../lib/types'
import { Loading } from '../components/common/Feedback'

/**
 * Sessão do adulto. Token apenas em sessionStorage (some ao fechar a aba); senha nunca é guardada.
 * A criança NÃO tem login: usa a sessão do responsável vinculado.
 * `offline` = apresentação somente leitura com fixtures, sem token e sem escrita.
 */
interface AuthState {
  user: User | null; offline: boolean; checking: boolean; expired: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void; enterOffline: (role: Role) => void
}
const TOKEN_KEY = 'superped.token'
const AuthContext = createContext<AuthState | null>(null)

export function homeFor(role: Role) {
  return role === 'DEVELOPER' ? '/dev' : role === 'GUARDIAN' ? '/familia' : '/medico'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [offline, setOffline] = useState(false)
  const [checking, setChecking] = useState(true)
  const [expired, setExpired] = useState(false)

  const logout = useCallback(() => { sessionStorage.removeItem(TOKEN_KEY); setUser(null); setOffline(false) }, [])
  const expire = useCallback(() => { if (sessionStorage.getItem(TOKEN_KEY)) setExpired(true); logout() }, [logout])
  configureApi(() => sessionStorage.getItem(TOKEN_KEY), expire)

  useEffect(() => {
    let active = true
    if (!sessionStorage.getItem(TOKEN_KEY)) { setChecking(false); return }
    api<User>('/api/auth/me').then(me => { if (active) setUser(me) })
      .catch(() => sessionStorage.removeItem(TOKEN_KEY))
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await post<LoginResponse>('/api/auth/login', { email: email.trim().toLowerCase(), password })
    sessionStorage.setItem(TOKEN_KEY, data.access_token)
    setOffline(false); setExpired(false); setUser(data.user)
    return data.user
  }, [])
  const enterOffline = useCallback((role: Role) => {
    if (!DEMO_ENABLED) return
    sessionStorage.removeItem(TOKEN_KEY); setOffline(true); setUser(offlineUser(role))
  }, [])

  const value = useMemo(() => ({ user, offline, checking, expired, login, logout, enterOffline }), [user, offline, checking, expired, login, logout, enterOffline])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('AuthProvider ausente')
  return auth
}

/** Checagem de perfil só para UX. O backend valida perfil e vínculo em cada endpoint. */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, checking } = useAuth()
  const location = useLocation()
  if (checking) return <Loading/>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }}/>
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace/>
  return <Outlet/>
}
