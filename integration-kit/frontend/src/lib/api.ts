export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
export const DEMO_ENABLED = import.meta.env.VITE_DEMO_MODE === 'true'
let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}
export function configureApi(tokenGetter: () => string | null, unauthorized: () => void) {
  getToken = tokenGetter
  onUnauthorized = unauthorized
}
export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message) }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, signal: options.signal ?? AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('API indisponível. Tente novamente; o serviço pode estar iniciando. Nenhuma alteração foi sincronizada.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (response.status === 401 && path !== '/api/auth/login') onUnauthorized()
    const detail = typeof data.detail === 'string' ? data.detail : 'Revise os campos e tente novamente.'
    throw new ApiError(detail, response.status)
  }
  return response.json() as Promise<T>
}
export const post = <T,>(path: string, body: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(body) })
export function errorText(error: unknown) { return error instanceof Error ? error.message : 'Não foi possível concluir a operação.' }
