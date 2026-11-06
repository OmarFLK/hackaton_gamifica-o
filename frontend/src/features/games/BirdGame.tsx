import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCcw } from 'lucide-react'
import { GameShell, type GameProps, type PlayContext } from './GameShell'
import { BIRD, flap, newBirdState, stepBird, type BirdState } from './logic'
import { SENSOR_MESSAGES, useMicrophoneLevel } from './sensors'

const FRAME_MS = 1000 / 60 // limite de FPS

function draw(ctx: CanvasRenderingContext2D, state: BirdState, accent: string, time: number, still: boolean) {
  const { width, height } = BIRD
  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, '#cfe0fb'); sky.addColorStop(1, '#f4f8ff')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height)
  // Nuvens-obstáculo: colunas fofas acima e abaixo do vão.
  for (const cloud of state.clouds) {
    const top = cloud.gapY - BIRD.gap / 2
    const bottom = cloud.gapY + BIRD.gap / 2
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#b9c8e4'; ctx.lineWidth = 2
    for (const [y0, y1] of [[-20, top], [bottom, height + 20]]) {
      ctx.beginPath(); ctx.roundRect(cloud.x, y0, BIRD.cloudWidth, y1 - y0, 26); ctx.fill(); ctx.stroke()
    }
    for (const y of [top, bottom]) for (const dx of [10, 32, 54]) { ctx.beginPath(); ctx.arc(cloud.x + dx, y, 13, 0, Math.PI * 2); ctx.fill() }
  }
  // Pássaro original: corpo redondo, asa, olho e bico.
  const y = state.y
  const wing = still ? 0 : Math.sin(time / 90) * 5
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(BIRD.x, y, BIRD.radius, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.ellipse(BIRD.x - 4, y + 2 + wing, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(BIRD.x + 6, y - 5, 4.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#101521'; ctx.beginPath(); ctx.arc(BIRD.x + 7, y - 5, 2.2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#F5B544'; ctx.beginPath(); ctx.moveTo(BIRD.x + 13, y - 1); ctx.lineTo(BIRD.x + 23, y + 2); ctx.lineTo(BIRD.x + 13, y + 6); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#132653'; ctx.font = '700 22px Nunito, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(String(state.score), width / 2, 40)
}

function BirdPlay({ mode, paused, reducedMotion, setMode }: PlayContext) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<BirdState>(newBirdState())
  const lastFlap = useRef(0)
  const [snapshot, setSnapshot] = useState({ crashed: false, started: false, score: 0 })
  const mic = useMicrophoneLevel(mode === 'microphone' && !paused)
  const speed = reducedMotion ? 75 : 105

  const up = useCallback(() => {
    if (paused) return
    stateRef.current = flap(stateRef.current)
    lastFlap.current = performance.now()
  }, [paused])
  const restart = () => { stateRef.current = newBirdState(); setSnapshot({ crashed: false, started: false, score: 0 }) }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = BIRD.width * ratio; canvas.height = BIRD.height * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const accent = getComputedStyle(canvas).getPropertyValue('--kid-accent').trim() || '#203774'
    let frame = 0
    let last = performance.now()
    let lastDraw = 0
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (now - lastDraw < FRAME_MS - 1) return
      const dt = (now - last) / 1000; last = now; lastDraw = now
      if (!paused) {
        // Microfone: som acima do limiar = mesma ação de subir (com intervalo mínimo).
        if (mode === 'microphone' && mic.status === 'on' && mic.levelRef.current > mic.thresholdRef.current && now - lastFlap.current > 280) {
          stateRef.current = flap(stateRef.current); lastFlap.current = now
        }
        stateRef.current = stepBird(stateRef.current, dt, speed)
      }
      const s = stateRef.current
      draw(ctx, s, accent, now, paused || reducedMotion)
      setSnapshot(prev => prev.crashed === s.crashed && prev.started === s.started && prev.score === s.score ? prev : { crashed: s.crashed, started: s.started, score: s.score })
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [paused, mode, mic.status, mic.levelRef, mic.thresholdRef, speed, reducedMotion])

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.code === 'Space' || event.code === 'ArrowUp') { event.preventDefault(); up() } }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [up])

  return <div className="bird-stage">
    <div className="canvas-wrap">
      <canvas ref={canvasRef} className="bird-canvas" onPointerDown={event => { event.preventDefault(); up() }} role="img" aria-label={`Pássaro das nuvens. Nuvens atravessadas: ${snapshot.score}`}/>
      {!snapshot.started && !snapshot.crashed && <p className="canvas-hint">Toque na tela, no botão ou aperte espaço para voar</p>}
      {snapshot.crashed && <div className="canvas-overlay" role="status"><p>Ops! Uma nuvem estava no caminho.<br/>Você atravessou {snapshot.score} nuvem(ns). Quer tentar de novo?</p><button className="button primary" onClick={restart}><RotateCcw size={18}/>Recomeçar</button></div>}
    </div>
    {mode === 'microphone' && <div className="mic-panel">
      {mic.status === 'on' && <><p>Faça um som (como “uuuh”) para o pássaro subir.</p><div className="level-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, mic.level * 400)}%` }}/></div><button className="text-button" onClick={mic.recalibrate}>Recalibrar silêncio</button></>}
      {SENSOR_MESSAGES[mic.status] && <p role="status">{SENSOR_MESSAGES[mic.status]}</p>}
      {(mic.status === 'denied' || mic.status === 'unsupported') && <button className="button ghost" onClick={() => setMode('touch')}>Brincar por toque</button>}
    </div>}
    <div className="game-actions"><button className="kid-big-button" onClick={up} disabled={paused || snapshot.crashed}><ArrowUp size={26}/>Subir</button></div>
  </div>
}

export function BirdGame(props: GameProps) {
  return <GameShell {...props} game="bird" title="Pássaro das nuvens" modes={['touch', 'microphone']}
    intro="Ajude o passarinho a passar pelos vãos entre as nuvens. Toque para ele subir. Sem pressa: dá para recomeçar quantas vezes quiser.">
    {context => <BirdPlay {...context}/>}
  </GameShell>
}
