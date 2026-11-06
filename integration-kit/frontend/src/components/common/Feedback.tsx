import { AlertCircle, LoaderCircle } from 'lucide-react'
export function Loading() { return <div className="feedback" role="status"><LoaderCircle className="spin" size={20}/> Carregando…</div> }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="feedback error" role="alert"><AlertCircle size={20}/><span>{message}</span>{retry && <button className="button small" onClick={retry}>Tentar novamente</button>}</div>
}
export function EmptyState({ children }: { children: React.ReactNode }) { return <div className="empty">{children}</div> }
