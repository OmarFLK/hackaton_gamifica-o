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
export interface ApiOptions extends RequestInit { timeoutMs?: number }
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = 20000, ...requestOptions } = options
  const token = getToken()
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (options.signal?.aborted) abort()
  options.signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, timeoutMs)
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...requestOptions, signal: controller.signal, headers })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError('API indisponível. Tente novamente; o serviço pode estar iniciando. Nenhuma alteração foi sincronizada.')
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abort)
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (response.status === 401 && path !== '/api/auth/login') onUnauthorized()
    const detail = typeof data.detail === 'string' ? data.detail : 'Revise os campos e tente novamente.'
    throw new ApiError(detail, response.status)
  }
  return response.json() as Promise<T>
}
export const post = <T,>(path: string, body: unknown, options: ApiOptions = {}) => api<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) })
export function errorText(error: unknown) { return error instanceof Error ? error.message : 'Não foi possível concluir a operação.' }
export const put = <T,>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(body) })
