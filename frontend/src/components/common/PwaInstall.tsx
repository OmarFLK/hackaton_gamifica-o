import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
export function PwaInstall() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [message, setMessage] = useState('')
  useEffect(() => {
    const ready = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent) }
    const installed = () => { setEvent(null); setMessage('Pendi instalado neste dispositivo.') }
    window.addEventListener('beforeinstallprompt', ready); window.addEventListener('appinstalled', installed)
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', installed) }
  }, [])
  const install = async () => {
    if (!event) { setMessage('No navegador compatível, abra o menu e escolha Instalar aplicativo ou Adicionar à tela inicial. A disponibilidade depende do navegador e de HTTPS.'); return }
    try { await event.prompt(); const choice = await event.userChoice; setMessage(choice.outcome === 'accepted' ? 'Instalação solicitada.' : 'Você pode instalar depois.'); setEvent(null) }
    catch { setMessage('Use o menu do navegador para adicionar à tela inicial, se disponível.') }
  }
  return <div className="install-control"><button className="button ghost small" onClick={() => void install()}><Download size={16}/>Instalar Pendi</button>{message && <p className="small-text" role="status">{message}</p>}</div>
}
