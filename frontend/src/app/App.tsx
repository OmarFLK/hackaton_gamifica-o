import { AuthProvider } from './AuthProvider'
import { PatientsProvider } from './PatientsProvider'
import { AppRoutes } from './router'

export function App() {
  return <AuthProvider><PatientsProvider><AppRoutes/></PatientsProvider></AuthProvider>
}
