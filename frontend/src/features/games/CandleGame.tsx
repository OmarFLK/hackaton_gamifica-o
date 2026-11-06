import { useEffect, useRef, useState } from 'react'
import { Flame, Wind } from 'lucide-react'
import { GameShell, type GameProps, type PlayContext } from './GameShell'
import { blowCandle, micBlow } from './logic'
import { SENSOR_MESSAGES, useMicrophoneLevel } from './sensors'

function CandlePlay({ mode, paused, reducedMotion, setMode }: PlayContext) {
  const [flame, setFlame] = useState(1)
  const [count, setCount] = useState(0)
  const mic = useMicrophoneLevel(mode === 'microphone' && !paused)
  const flameRef = useRef(1)

  useEffect(() => { flameRef.current = flame }, [flame])
  useEffect(() => {
    if (mode !== 'microphone' || paused || mic.status !== 'on') return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); last = now
      const next = micBlow(flameRef.current, mic.levelRef.current, mic.thresholdRef.current, dt)
      if (next !== flameRef.current) { flameRef.current = next; setFlame(next); if (next === 0) setCount(c => c + 1) }
      if (flameRef.current > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [mode, paused, mic.status, mic.levelRef, mic.thresholdRef, flame === 0])

  const blow = () => { if (paused || flame === 0) return; const next = blowCandle(flame); setFlame(next); if (next === 0) setCount(c => c + 1) }
  const out = flame === 0

  return <div className="candle-stage">
    <div className="candle-row">
    <img src="/mascote/humor-4-neutro.png" alt="Pandi respirando com calma" width={150} height={150} className="mascot-img candle-pandi"/>
    <svg viewBox="0 0 200 260" className="candle-svg" role="img" aria-label={out ? 'Vela apagada' : `Vela acesa, chama em ${Math.round(flame * 100)}%`}>
      <defs><radialGradient id="glow"><stop offset="0%" stopColor="#FFE9A8" stopOpacity=".9"/><stop offset="100%" stopColor="#FFE9A8" stopOpacity="0"/></radialGradient></defs>
      <circle cx="100" cy="88" r={70 * flame} fill="url(#glow)" style={{ transition: reducedMotion ? 'none' : 'r .4s ease' }}/>
      <g style={{ transform: `scale(${Math.max(flame, 0.001)})`, transformOrigin: '100px 118px', transition: reducedMotion ? 'none' : 'transform .45s ease' }} className={reducedMotion ? '' : 'flicker'}>
        <path d="M100 52 C118 78 120 96 112 108 C106 118 94 118 88 108 C80 96 82 78 100 52 Z" fill="#F7A23B"/>
        <path d="M100 76 C109 90 110 100 105 107 C102 112 98 112 95 107 C90 100 91 90 100 76 Z" fill="#FFE07A"/>
      </g>
      {out && !reducedMotion && <g className="smoke"><path d="M100 112 q-8 -14 0 -26 q8 -12 0 -24" stroke="#c4cbd6" strokeWidth="4" fill="none" strokeLinecap="round"/></g>}
      <line x1="100" y1="112" x2="100" y2="124" stroke="#3b3b3b" strokeWidth="3" strokeLinecap="round"/>
      <rect x="72" y="124" width="56" height="104" rx="10" fill="var(--kid-accent, #203774)"/>
      <rect x="80" y="134" width="10" height="70" rx="5" fill="#ffffff" opacity=".25"/>
      <ellipse cx="100" cy="232" rx="58" ry="10" fill="#d9dfeb"/>
    </svg>
    </div>
    <p className="game-message" aria-live="polite">{out ? 'A vela apagou! ✨ Quer acender de novo?' : mode === 'microphone' && mic.status === 'on' ? 'Sopre devagarinho perto do aparelho… ou use o botão.' : 'Toque em “Soprar” para a chama dançar e diminuir.'}</p>
    {mode === 'microphone' && <div className="mic-panel">
      {mic.status === 'on' && <><div className="level-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, mic.level * 400)}%` }}/></div><button className="text-button" onClick={mic.recalibrate}>Recalibrar silêncio</button></>}
      {SENSOR_MESSAGES[mic.status] && <p role="status">{SENSOR_MESSAGES[mic.status]}</p>}
      {(mic.status === 'denied' || mic.status === 'unsupported') && <button className="button ghost" onClick={() => setMode('touch')}>Brincar por toque</button>}
    </div>}
    <div className="game-actions">
      {out ? <button className="kid-big-button" onClick={() => setFlame(1)}><Flame size={26}/>Acender de novo</button>
        : <button className="kid-big-button" onClick={blow} disabled={paused}><Wind size={26}/>Soprar</button>}
    </div>
    <p className="muted small-text">Velas apagadas: {count} · O som do microfone é só um sinal da brincadeira, não uma medida da respiração.</p>
  </div>
}

export function CandleGame(props: GameProps) {
  return <GameShell {...props} game="candle" title="Vela tranquila" modes={['touch', 'microphone']}
    intro="Uma vela calma está acesa. Você pode soprar tocando no botão ou, se quiser, usando o microfone.">
    {context => <CandlePlay {...context}/>}
  </GameShell>
}
