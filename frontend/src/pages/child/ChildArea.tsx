import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../app/AuthProvider'
import { api, errorText } from '../../lib/api'
import { offlinePatients } from '../../lib/demoOffline'
import type { Patient } from '../../lib/types'
import { ChildLayout } from '../../components/layouts/ChildLayout'
import { ErrorState, Loading } from '../../components/ui'
import { AvatarProvider, useAvatar } from './AvatarProvider'
import { AvatarPickerPage } from './AvatarPickerPage'
import { ChildGamePage, ChildTalkPage } from './ChildActivities'
import { ChildHomePage } from './ChildHomePage'
import { EmotionCheckinPage } from './EmotionCheckinPage'

export interface ChildProfile { id: number; firstName: string }

function ThemedWorld({ child, offline, onExit }: { child: ChildProfile; offline: boolean; onExit: () => void }) {
  const { mascot } = useAvatar()
  return <ChildLayout theme={mascot.theme} title={`Mundo de ${child.firstName}`} offline={offline} onExit={onExit}>
    <Routes>
      <Route index element={<ChildHomePage child={child}/>}/>
      <Route path="mascote" element={<AvatarPickerPage child={child}/>}/>
      <Route path="sentimentos" element={<EmotionCheckinPage child={child} offline={offline}/>}/>
      <Route path="conversar" element={<ChildTalkPage child={child} offline={offline}/>}/>
      <Route path="jogos/:game" element={<ChildGamePage child={child} offline={offline}/>}/>
    </Routes>
  </ChildLayout>
}

/**
 * Entrada da área infantil. Só abre dentro da sessão de um RESPONSÁVEL (rota protegida)
 * e só para paciente vinculado: o backend responde 403 caso contrário.
 * A criança vê apenas o primeiro nome e o mascote — nenhum dado clínico é carregado.
 */
export function ChildArea() {
  const { patientId } = useParams()
  const id = Number(patientId)
  const { offline } = useAuth()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    setPatient(null); setError('')
    if (offline) { const found = offlinePatients.find(p => p.id === id); setPatient(found ?? null); setError(found ? '' : 'Perfil indisponível no modo offline.'); return }
    const controller = new AbortController()
    api<Patient>(`/api/patients/${id}`, { signal: controller.signal })
      .then(p => { if (!controller.signal.aborted) setPatient(p) })
      .catch(err => { if (!controller.signal.aborted) setError(errorText(err)) })
    return () => controller.abort()
  }, [id, offline])
  const exit = () => navigate('/familia')
  if (error) return <main className="kid-error"><ErrorState message={error}/><button className="button primary" onClick={exit}>Voltar para o responsável</button></main>
  if (!patient) return <Loading/>
  const child = { id: patient.id, firstName: patient.name.split(' ')[0] }
  return <AvatarProvider key={patient.id} patientId={patient.id} initial={patient.chosen_avatar}>
    <ThemedWorld child={child} offline={offline} onExit={exit}/>
  </AvatarProvider>
}
