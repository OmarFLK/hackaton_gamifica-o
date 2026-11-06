import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Camera, CheckCircle2, CloudOff, Hand, LogOut, Mic, Pause, Play, RotateCcw } from 'lucide-react'
import { errorText, post } from '../../lib/api'
import type { GameId, GameMode, GameSession } from '../../lib/types'
import { CHILD_PAUSE_EVENT } from '../../components/layouts/ChildLayout'
import { usePrefersReducedMotion } from './sensors'

export interface GameProps { patientId: number; offline?: boolean; onExit: () => void }
export interface PlayContext { mode: GameMode; paused: boolean; reducedMotion: boolean; setMode: (mode: GameMode) => void }

const MODE_INFO: Record<GameMode, { label: string; icon: ReactNode; note: string }> = {
  touch: { label: 'Tocar na tela', icon: <Hand size={22}/>, note: 'Funciona sempre, sem pedir permissão.' },
  microphone: { label: 'Usar microfone', icon: <Mic size={22}/>, note: 'Opcional. O som vira um sinal da brincadeira; nada é gravado ou enviado.' },
  camera: { label: 'Usar câmera', icon: <Camera size={22}/>, note: 'Opcional. A imagem aparece só na tela; nada detecta sua mão.' },
}

type SaveState = { status: 'saving' } | { status: 'saved'; session: GameSession } | { status: 'unsynced'; reason: string }

/**
 * Casca comum: explicação de que é voluntário, escolha de modo (toque sempre disponível),
 * pausa (também pelo botão global da área infantil), sair, e registro da sessão ao terminar.
 * Sem API: o resumo fica só em memória com a etiqueta "Não sincronizado".
 */
export function GameShell({ game, title, intro, modes, patientId, offline, onExit, children }: GameProps & {
  game: GameId; title: string; intro: string; modes: GameMode[]; children: (context: PlayContext) => ReactNode
}) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'summary'>('intro')
  const [mode, setMode] = useState<GameMode>('touch')
  const [paused, setPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [save, setSave] = useState<SaveState | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const active = useRef(0)
  const titleRef = useRef<HTMLHeadingElement>(null)
  // O botão clicado some ao trocar de fase: o foco vai para o título, não se perde.
  useEffect(() => { if (phase !== 'intro') titleRef.current?.focus({ preventScroll: true }) }, [phase])

  useEffect(() => {
    if (phase !== 'playing' || paused) return
    const timer = setInterval(() => { active.current += 1; setSeconds(active.current) }, 1000)
    return () => clearInterval(timer)
  }, [phase, paused])
  useEffect(() => {
    const pause = () => setPaused(true)
    const hidden = () => { if (document.visibilityState === 'hidden') setPaused(true) }
    window.addEventListener(CHILD_PAUSE_EVENT, pause)
    document.addEventListener('visibilitychange', hidden)
    return () => { window.removeEventListener(CHILD_PAUSE_EVENT, pause); document.removeEventListener('visibilitychange', hidden) }
  }, [])

  const start = (chosen: GameMode) => { setMode(chosen); active.current = 0; setSeconds(0); setPaused(false); setSave(null); setPhase('playing') }
  const finish = useCallback(async () => {
    setPhase('summary'); setPaused(false)
    const duration = active.current
    if (offline) { setSave({ status: 'unsynced', reason: 'Modo offline de apresentação.' }); return }
    setSave({ status: 'saving' })
    try { setSave({ status: 'saved', session: await post<GameSession>(`/api/patients/${patientId}/games`, { game, mode, duration_seconds: duration }) }) }
    catch (err) { setSave({ status: 'unsynced', reason: errorText(err) }) }
  }, [offline, patientId, game, mode])

  return <section className="game" aria-labelledby="game-title">
    <header className="game-header">
      <h1 id="game-title" ref={titleRef} tabIndex={-1} className="game-title">{title}</h1>
      <div className="game-controls">
        {phase === 'playing' && <>
          <span className="game-timer" aria-live="off">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
          <button className="kid-button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <Play size={20}/> : <Pause size={20}/>}{paused ? 'Continuar' : 'Pausar'}</button>
          <button className="kid-button" onClick={finish}><CheckCircle2 size={20}/>Terminar</button>
        </>}
        <button className="kid-button" onClick={onExit}><LogOut size={20}/>Sair</button>
      </div>
    </header>

    {phase === 'intro' && <div className="game-intro">
      <div className="game-intro-hero"><img src="/mascote/pandi-frontal.png" alt="" width={120} height={140} className="mascot-img"/><p className="game-intro-text">{intro}</p></div>
      <p className="game-voluntary">É só uma brincadeira: você brinca se quiser, pode pausar ou parar quando preferir e chamar um adulto a qualquer momento. Não é exercício, teste nem tratamento.</p>
      <div className="mode-grid">{modes.map(option => <button key={option} className={`mode-card ${option === 'touch' ? 'primary' : ''}`} onClick={() => start(option)}>
        {MODE_INFO[option].icon}<strong>{MODE_INFO[option].label}</strong><small>{MODE_INFO[option].note}</small>
      </button>)}</div>
    </div>}

    {phase === 'playing' && <div className="game-stage">
      {children({ mode, paused, reducedMotion, setMode })}
      {paused && <div className="game-paused" role="status"><p>Pausado. Descanse o quanto quiser.</p><button className="button primary" onClick={() => setPaused(false)}><Play size={18}/>Continuar</button></div>}
    </div>}

    {phase === 'summary' && <div className="game-summary" role="status">
      <img src="/mascote/pandi-comemorando.png" alt="Pandi comemorando" width={190} height={152} className="mascot-img"/>
      <h2>Que bom brincar com você!</h2>
      <p>Tempo de brincadeira: {Math.floor(seconds / 60)} min {seconds % 60} s · modo {MODE_INFO[mode].label.toLowerCase()}</p>
      {save?.status === 'saving' && <p className="muted">Salvando…</p>}
      {save?.status === 'saved' && <p className="success"><CheckCircle2 size={16}/> Sessão registrada no servidor.</p>}
      {save?.status === 'unsynced' && <p className="unsynced"><CloudOff size={16}/> Não sincronizado — resumo guardado só nesta tela. ({save.reason})</p>}
      <div className="form-actions"><button className="button ghost" onClick={() => setPhase('intro')}><RotateCcw size={18}/>Brincar de novo</button><button className="button primary" onClick={onExit}>Voltar às aventuras</button></div>
    </div>}
  </section>
}
