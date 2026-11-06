import { Navigate, Route, Routes } from 'react-router-dom'
import { AdultLayout } from '../components/layouts/AdultLayout'
import { LandingPage } from '../pages/public/LandingPage'
import { LoginPage, NotFoundPage } from '../pages/public/LoginPage'
import { DoctorDashboard, PatientCreatePage, PatientDetailPage, PatientsPage } from '../pages/doctor'
import { GuardianDashboard, GuardianMedicationsPage, GuardianMessagesPage, GuardianMoodPage, GuardianRoutinePage, HelpPage } from '../pages/guardian'
import { ChildArea } from '../pages/child'
import { DeveloperDashboard } from '../pages/developer/DeveloperDashboard'
import { ProtectedRoute, useAuth } from './AuthProvider'

function DeveloperPage() {
  const { offline } = useAuth()
  return <DeveloperDashboard offline={offline}/>
}

/** Rotas do contrato: /, /login, /medico, /medico/pacientes, /familia, /crianca/:patientId, /dev. */
export function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>

    <Route element={<ProtectedRoute roles={['CLINICIAN', 'CLINICAL_ASSISTANT']}/>}>
      <Route path="/medico" element={<AdultLayout/>}>
        <Route index element={<DoctorDashboard/>}/>
        <Route path="pacientes" element={<PatientsPage/>}/>
        <Route path="pacientes/novo" element={<PatientCreatePage/>}/>
        <Route path="pacientes/:id" element={<PatientDetailPage/>}/>
        <Route path="ajuda" element={<HelpPage/>}/>
        <Route path="*" element={<Navigate to="/medico" replace/>}/>
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={['GUARDIAN']}/>}>
      <Route path="/familia" element={<AdultLayout/>}>
        <Route index element={<GuardianDashboard/>}/>
        <Route path="rotina" element={<GuardianRoutinePage/>}/>
        <Route path="humor" element={<GuardianMoodPage/>}/>
        <Route path="medicamentos" element={<GuardianMedicationsPage/>}/>
        <Route path="mensagens" element={<GuardianMessagesPage/>}/>
        <Route path="ajuda" element={<HelpPage/>}/>
        <Route path="*" element={<Navigate to="/familia" replace/>}/>
      </Route>
      {/* Criança: sem login próprio, somente pela sessão do responsável vinculado. */}
      <Route path="/crianca/:patientId/*" element={<ChildArea/>}/>
    </Route>

    <Route element={<ProtectedRoute roles={['DEVELOPER']}/>}>
      <Route path="/dev" element={<AdultLayout/>}><Route index element={<DeveloperPage/>}/></Route>
    </Route>

    <Route path="*" element={<NotFoundPage/>}/>
  </Routes>
}
