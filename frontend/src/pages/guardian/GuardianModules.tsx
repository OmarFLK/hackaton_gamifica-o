import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { EmptyState, Loading } from '../../components/ui'
import { InformationalAssistant } from '../../features/assistant'
import { MedicationCalendar } from '../../features/medications'
import { MessageCenter } from '../../features/messages'

// Apenas conecta os módulos 10–11 (já existentes) ao paciente selecionado. Sem reimplementar.
function useSelection() {
  const { user, offline } = useAuth()
  const { selected, loading } = usePatients()
  return { user, offline, selected, loading }
}

export function GuardianMedicationsPage() {
  const { user, offline, selected, loading } = useSelection()
  if (loading) return <Loading/>
  if (!selected || !user) return <EmptyState>Nenhuma criança vinculada.</EmptyState>
  return <MedicationCalendar key={`${selected.id}:${offline}`} patientId={selected.id} role={user.role} offline={offline}/>
}

export function GuardianMessagesPage() {
  const { user, offline, selected, loading } = useSelection()
  if (loading) return <Loading/>
  if (!selected || !user) return <EmptyState>Nenhuma criança vinculada.</EmptyState>
  return <MessageCenter key={`${selected.id}:${offline}`} patientId={selected.id} userId={user.id} offline={offline}/>
}

export function HelpPage() {
  const { offline } = useAuth()
  return <InformationalAssistant offline={offline}/>
}
