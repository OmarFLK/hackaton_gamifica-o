import { AuthProvider } from './AuthProvider'
import { PatientsProvider } from './PatientsProvider'
import { AppRoutes } from './router'
import { ErrorBoundary } from '../pages/public/StatusPages'

export function App() {
  return <ErrorBoundary><AuthProvider><PatientsProvider><AppRoutes/></PatientsProvider></AuthProvider></ErrorBoundary>
}
