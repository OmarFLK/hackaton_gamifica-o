import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, errorText } from '../lib/api'
import { offlinePatients } from '../lib/demoOffline'
import type { Patient } from '../lib/types'
import { useAuth } from './AuthProvider'

/** Pacientes no escopo da sessão (filtrados pelo backend) e o paciente selecionado. */
interface PatientsState {
  patients: Patient[]; selected: Patient | null; loading: boolean; error: string
  select: (id: number) => void; refresh: () => void
}
const PatientsContext = createContext<PatientsState | null>(null)
const SELECTED_KEY = 'superped.selectedPatient'

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const { user, offline } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(() => Number(sessionStorage.getItem(SELECTED_KEY)) || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    // Troca de conta: descarta na hora a lista da sessão anterior, para nunca exibi-la a outro perfil.
    setPatients([])
    if (!user || user.role === 'DEVELOPER') { setLoading(false); sessionStorage.removeItem(SELECTED_KEY); return }
    // Offline: o responsável fictício só tem a própria criança (Nina), como no servidor.
    if (offline) { setPatients(user.role === 'GUARDIAN' ? offlinePatients.slice(0, 1) : offlinePatients); setLoading(false); setError(''); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    api<Patient[]>('/api/patients', { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setPatients(data) })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user, offline, revision])

  const selected = patients.find(p => p.id === selectedId) ?? patients[0] ?? null
  const select = useCallback((id: number) => { setSelectedId(id); sessionStorage.setItem(SELECTED_KEY, String(id)) }, [])
  const refresh = useCallback(() => setRevision(n => n + 1), [])
  const value = useMemo(() => ({ patients, selected, loading, error, select, refresh }), [patients, selected, loading, error, select, refresh])
  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>
}

export function usePatients() {
  const state = useContext(PatientsContext)
  if (!state) throw new Error('PatientsProvider ausente')
  return state
}
