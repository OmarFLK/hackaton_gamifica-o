import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { HandHeart, LogOut, Pause } from 'lucide-react'
import { DemoBadge } from '../ui/Badge'
import { Modal } from '../ui/Modal'

export const CHILD_PAUSE_EVENT = 'superped:child-pause'
export const CHILD_CALL_ADULT_EVENT = 'superped:child-call-adult'

/** Qualquer tela infantil pode abrir o aviso "Chamar adulto" do layout. */
export function requestAdult() { window.dispatchEvent(new Event(CHILD_CALL_ADULT_EVENT)) }

/** Pausa global: interrompe voz sintética e avisa jogos/telas abertas para pausarem. */
export function pauseChildWorld() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  window.dispatchEvent(new Event(CHILD_PAUSE_EVENT))
}

export interface ChildTheme { background: string; accent: string; soft: string; ink: string }

/**
 * Layout infantil: tipografia Nunito, botões grandes, sempre com Pausar, Chamar adulto e Sair.
 * O tema (cores do mascote) chega por variáveis CSS: trocar o mascote não reconstrói o layout.
 */
export function ChildLayout({ theme, title, onExit, offline, children }: { theme: ChildTheme; title?: string; onExit: () => void; offline?: boolean; children: ReactNode }) {
  const [calling, setCalling] = useState(false)
  const style = { '--kid-bg': theme.background, '--kid-accent': theme.accent, '--kid-soft': theme.soft, '--kid-ink': theme.ink } as CSSProperties
  const callAdult = () => { pauseChildWorld(); setCalling(true) }
  useEffect(() => {
    const open = () => { pauseChildWorld(); setCalling(true) }
    window.addEventListener(CHILD_CALL_ADULT_EVENT, open)
    return () => window.removeEventListener(CHILD_CALL_ADULT_EVENT, open)
  }, [])
  return <div className="kid-world" style={style}>
    <a className="skip-link" href="#kid-content">Pular para o conteúdo</a>
    <header className="kid-topbar">
      <span className="kid-title">{title ?? 'Meu mundo'}</span>
      <DemoBadge suffix={offline ? 'OFFLINE' : undefined}/>
      <div className="kid-actions">
        <button className="kid-button" onClick={pauseChildWorld}><Pause size={20}/>Pausar</button>
        <button className="kid-button kid-call" onClick={callAdult}><HandHeart size={20}/>Chamar adulto</button>
        <button className="kid-button" onClick={() => { pauseChildWorld(); onExit() }}><LogOut size={20}/>Sair</button>
      </div>
    </header>
    <main id="kid-content" className="kid-content">{children}</main>
    <footer className="kid-footer">Brincadeiras voluntárias, com um adulto por perto · Demonstração com dados fictícios</footer>
    <Modal open={calling} title="Vamos chamar um adulto" onClose={() => setCalling(false)}>
      <p className="kid-modal-text">Chame um adulto de confiança que está perto de você. Tudo bem pedir ajuda!</p>
      <div className="notice"><p>Este botão não envia mensagens nem aciona serviços externos. Em urgência, o adulto deve procurar o serviço de emergência local.</p></div>
      <div className="form-actions"><button className="button ghost" onClick={() => setCalling(false)}>Continuar aqui</button><button className="button primary" onClick={() => { setCalling(false); onExit() }}>Voltar para o adulto</button></div>
    </Modal>
  </div>
}
