import { useEffect, useState } from 'react'
import { useAuth } from '../../app/AuthProvider'
import { api, errorText } from '../../lib/api'
import { offlineDashboard } from '../../lib/demo'
import type { PatientDashboard } from '../../lib/types'

/** Dashboard do paciente selecionado. Backend confere o vínculo; offline usa fixtures rotuladas. */
export function useDashboard(patientId: number | undefined) {
  const { offline } = useAuth()
  const [data, setData] = useState<PatientDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!patientId) { setData(null); setLoading(false); return }
    if (offline) { setData(offlineDashboard(patientId)); setLoading(false); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    api<PatientDashboard>(`/api/patients/${patientId}/dashboard`, { signal: controller.signal })
      .then(d => { if (!controller.signal.aborted) setData(d) })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [patientId, offline, revision])
  return { data, loading, error, reload: () => setRevision(n => n + 1) }
}
