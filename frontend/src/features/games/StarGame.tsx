import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { GameShell, type GameProps, type PlayContext } from './GameShell'
import { nextStar } from './logic'
import { SENSOR_MESSAGES, useCamera } from './sensors'

function StarPlay({ mode, paused, reducedMotion, setMode }: PlayContext) {
  const [star, setStar] = useState(() => nextStar(null))
  const [caught, setCaught] = useState(0)
  const [sparkle, setSparkle] = useState(false)
  const camera = useCamera(mode === 'camera' && !paused)
  const sparkleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (sparkleTimer.current) clearTimeout(sparkleTimer.current) }, [])
  const cameraOn = mode === 'camera' && camera.status === 'on'

  const catchStar = () => {
    if (paused) return
    setCaught(c => c + 1); setStar(previous => nextStar(previous))
    if (!reducedMotion) {
      if (sparkleTimer.current) clearTimeout(sparkleTimer.current)
      setSparkle(true); sparkleTimer.current = setTimeout(() => setSparkle(false), 350)
    }
  }

  return <div className="star-stage">
    <div className={`star-field ${cameraOn ? 'with-camera' : ''}`}>
      {mode === 'camera' && <video ref={camera.videoRef} className="star-camera" muted playsInline aria-hidden="true"/>}
      {!cameraOn && <div className="star-sky" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}/>)}</div>}
      <button className={`star-target ${reducedMotion ? '' : 'twinkle'} ${sparkle ? 'sparkle' : ''}`} style={{ left: `${star.x}%`, top: `${star.y}%` }} onClick={catchStar} disabled={paused} aria-label={`Pegar a estrela. Estrelas pegas: ${caught}`}>
        <Star size={46} fill="#F5D776" stroke="#C99A1E" strokeWidth={1.5}/>
      </button>
    </div>
    <p className="game-message" aria-live="polite">Estrelas pegas: <strong>{caught}</strong> · {cameraOn ? 'A câmera só mostra a imagem. Toque na estrela na tela.' : 'Toque ou clique na estrela.'}</p>
    {mode === 'camera' && <div className="mic-panel">
      {SENSOR_MESSAGES[camera.status] && <p role="status">{SENSOR_MESSAGES[camera.status]}</p>}
      {(camera.status === 'denied' || camera.status === 'unsupported') && <button className="button ghost" onClick={() => setMode('touch')}>Brincar por toque</button>}
      {cameraOn && <p className="muted small-text">Nada é gravado nem enviado. Não há detecção de mão ou objeto nesta demonstração.</p>}
    </div>}
  </div>
}

export function StarGame(props: GameProps) {
  return <GameShell {...props} game="star" title="Estrela ao alcance" modes={['touch', 'camera']}
    intro="Estrelas aparecem em lugares diferentes do céu. Toque nelas para colecionar! Se quiser, dá para ver a câmera ao fundo.">
    {context => <StarPlay {...context}/>}
  </GameShell>
}
