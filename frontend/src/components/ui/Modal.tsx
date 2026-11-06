import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Modal sobre <dialog> nativo: foco preso, Esc fecha, fundo inerte. */
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return <dialog ref={ref} aria-labelledby="modal-title" onClose={onClose} onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Fechar" onClick={onClose}><X/></button></div>
    {children}
  </dialog>
}
