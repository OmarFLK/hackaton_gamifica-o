import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Camera, CameraOff, Hand, RotateCcw, Star } from 'lucide-react'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { GameShell, type GameProps, type PlayContext } from './GameShell'
import { useHandTracking, type FrameTiming } from './hand/useHandTracking'
import { handCursor, mapHandPoint, overlaps, reachableStar, smoothPoint, type Point } from './hand/coordinates'
import { newCapture, stepCapture, tapCapture, type CaptureState } from './hand/collision'

interface Cursor extends Point { id: string; seen: number }
const CURSOR_RADIUS = 12
const CONNECTIONS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]]

function StarPlay({ mode, paused, reducedMotion, setMode, onExit }: PlayContext & { onExit: () => void }) {
  const [star, setStar] = useState(() => reachableStar(null))
  const [caught, setCaught] = useState(0)
  const [phase, setPhase] = useState<CaptureState['phase']>('idle')
  const [handCount, setHandCount] = useState(0)
  const [palm, setPalm] = useState(false)
  const [dwellMs, setDwellMs] = useState(200)
  const [tolerance, setTolerance] = useState(20)
  const [waiting, setWaiting] = useState(false)
  const [diagnostic, setDiagnostic] = useState('')
  const debug = new URLSearchParams(location.search).get('handDebug') === '1'
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetRef = useRef<HTMLButtonElement>(null)
  const machine = useRef(newCapture())
  const starRef = useRef(star)
  const cursors = useRef(new Map<string, Cursor>())
  const landmarksRef = useRef<Point[][]>([])
  const countRef = useRef(0)
  const lastDebug = useRef(0)
  const blockedUntil = useRef(0)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const publish = (next: CaptureState) => {
    machine.current = next
    setPhase(previous => previous === next.phase ? previous : next.phase)
  }
  const recordCapture = () => setCaught(value => value + 1)
  const targetGeometry = () => {
    const stage = stageRef.current?.getBoundingClientRect(), target = targetRef.current?.getBoundingClientRect()
    return stage && target ? { stage, center: { x: target.left + target.width / 2 - stage.left, y: target.top + target.height / 2 - stage.top }, radius: target.width / 2 } : null
  }
  const applyFrame = (result: HandLandmarkerResult, now: number, timing: FrameTiming) => {
    if (pausedRef.current || mode !== 'camera') return
    const geometry = targetGeometry(), video = videoRef.current
    if (!geometry || !video) return
    const size = { width: geometry.stage.width, height: geometry.stage.height }
    const videoSize = { width: video.videoWidth, height: video.videoHeight }
    const next = new Map<string, Cursor>()
    const mappedLandmarks: Point[][] = []
    result.landmarks.forEach((hand, index) => {
      const cursor = handCursor(hand, palm)
      if (!cursor) return
      const category = result.handedness[index]?.[0]?.categoryName || String(index)
      const repeated = result.handedness.filter(h => h[0]?.categoryName === category).length > 1
      const id = repeated ? `${category}-${index}` : category
      const mapped = mapHandPoint(cursor, videoSize, size)
      if (!mapped) return
      const previous = cursors.current.get(id)
      const filtered = smoothPoint(previous && now - previous.seen < 180 ? previous : undefined, mapped)
      next.set(id, { ...filtered, id, seen: now })
      if (debug) mappedLandmarks.push(hand.map(point => mapHandPoint(point, videoSize, size)!).filter(Boolean))
    })
    cursors.current = next
    landmarksRef.current = mappedLandmarks
    if (countRef.current !== next.size) { countRef.current = next.size; setHandCount(next.size) }
    const touching = now < blockedUntil.current ? [] : [...next.values()].filter(cursor => cursor.x >= 0 && cursor.x <= size.width && cursor.y >= 0 && cursor.y <= size.height && overlaps(cursor, geometry.center, geometry.radius, tolerance, CURSOR_RADIUS)).map(cursor => cursor.id)
    const step = stepCapture(machine.current, touching, now, dwellMs)
    publish(step.state)
    targetRef.current?.style.setProperty('--capture-progress', String(step.progress))
    if (step.captured) recordCapture()
    // A troca de alvo fica no loop visual, compartilhado pelos modos camera e toque.
    if (step.spawn) spawnStar()
    if (debug && now - lastDebug.current > 250) {
      lastDebug.current = now
      setDiagnostic(`Vídeo ${video.videoWidth}×${video.videoHeight} · área CSS ${Math.round(size.width)}×${Math.round(size.height)} · DPR ${devicePixelRatio}\nMãos ${next.size} · ${[...next.values()].map(c => `${c.id}: ${c.x.toFixed(0)},${c.y.toFixed(0)}`).join(' | ')}\nEstrela ${geometry.center.x.toFixed(0)},${geometry.center.y.toFixed(0)} · raio ${geometry.radius.toFixed(0)} + margem ${tolerance}\nSobreposição ${touching.length > 0} · estado ${step.state.phase} · FPS ${timing.fps.toFixed(1)} · inferência ${timing.inferenceMs.toFixed(0)} ms`)
    }
  }
  const tracking = useHandTracking(mode === 'camera' && !paused, videoRef, applyFrame)
  const spawnStar = () => {
    blockedUntil.current = performance.now() + 80 // Aguarda o novo alvo chegar ao DOM, inclusive com dwell instantaneo.
    const next = reachableStar(starRef.current)
    starRef.current = next; setStar(next); publish(newCapture())
    targetRef.current?.style.setProperty('--capture-progress', '0')
  }
  const captureByTouch = () => {
    if (pausedRef.current || performance.now() < blockedUntil.current) return
    const next = tapCapture(machine.current, performance.now())
    if (!next) return
    publish(next); recordCapture()
  }

  useEffect(() => {
    cursors.current.clear(); landmarksRef.current = []; countRef.current = 0; setHandCount(0)
    if (machine.current.phase === 'hovering') publish(newCapture())
    targetRef.current?.style.setProperty('--capture-progress', '0')
  }, [mode, paused, palm, dwellMs, tolerance, tracking.status.model])

  useEffect(() => {
    setWaiting(false)
    if (tracking.status.model !== 'ready' || handCount > 0) return
    const timer = setTimeout(() => setWaiting(true), 7000)
    return () => clearTimeout(timer)
  }, [tracking.status.model, handCount])

  useEffect(() => {
    const stage = stageRef.current, canvas = canvasRef.current
    if (!stage || !canvas) return
    const resize = () => {
      const box = stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 3)
      canvas.width = Math.round(box.width * dpr); canvas.height = Math.round(box.height * dpr)
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
      cursors.current.clear(); landmarksRef.current = []
      if (machine.current.phase === 'hovering') publish(newCapture())
    }
    resize()
    const observer = new ResizeObserver(resize); observer.observe(stage)
    let frame = 0
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (pausedRef.current || document.visibilityState === 'hidden') return
      if (machine.current.phase === 'captured' || machine.current.phase === 'cooldown') {
        const step = stepCapture(machine.current, [], now, 200)
        publish(step.state)
        if (step.spawn) spawnStar()
      }
      if (mode !== 'camera') return
      if (debug) {
        ctx.strokeStyle = '#a6fff0'; ctx.fillStyle = '#a6fff0'; ctx.lineWidth = 1.5
        for (const points of landmarksRef.current) {
          for (const [a,b] of CONNECTIONS) if (points[a] && points[b]) { ctx.beginPath(); ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); ctx.stroke() }
          for (const point of points) { ctx.beginPath(); ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2); ctx.fill() }
        }
        const geometry = targetGeometry()
        if (geometry) { ctx.setLineDash([6,5]); ctx.beginPath(); ctx.arc(geometry.center.x, geometry.center.y, geometry.radius + tolerance, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]) }
      }
      for (const cursor of cursors.current.values()) {
        if (now - cursor.seen > 180) continue
        ctx.save(); ctx.shadowColor = '#78e7cd'; ctx.shadowBlur = reducedMotion ? 0 : 15
        ctx.fillStyle = '#78e7cd'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(cursor.x, cursor.y, CURSOR_RADIUS, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.restore()
      }
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); ctxClear(canvas) }
  }, [mode, paused, debug, tolerance, reducedMotion])

  const capturing = phase === 'captured' || phase === 'cooldown'
  const ready = tracking.status.model === 'ready'
  const error = tracking.status.camera === 'error' || tracking.status.model === 'error'
  const statusText = mode === 'touch' ? 'Jogar com toque' : error ? tracking.status.message : !ready ? tracking.status.message || 'Preparando a câmera e procurando sua mão...' : handCount ? 'Mão encontrada!' : 'Mostre sua mão para a câmera'
  return <div className="star-stage hand-star-game" data-hand-count={handCount} data-capture-phase={phase} data-model-status={tracking.status.model} data-delegate={tracking.status.delegate || ''}>
    <div className={`star-field ${mode === 'camera' ? 'with-camera' : ''}`} ref={stageRef} onPointerDown={event => {
      if (mode !== 'touch') return
      const g = targetGeometry()
      if (g && overlaps({ x: event.clientX - g.stage.left, y: event.clientY - g.stage.top }, g.center, g.radius, tolerance, 0)) captureByTouch()
    }}>
      {mode === 'camera' && <video ref={videoRef} className="star-camera" muted playsInline autoPlay aria-label="Sua câmera espelhada, processada somente neste aparelho"/>}
      {(mode !== 'camera' || tracking.status.camera !== 'ready') && <div className="star-sky" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}/>)}</div>}
      <div className="star-hud"><span className={`hand-indicator ${handCount ? 'found' : ''}`} role="status"><i/>{statusText}</span><span className="star-points">Pontos: <strong>{caught}</strong></span></div>
      <button ref={targetRef} className={`star-target ${phase === 'hovering' ? 'is-hovering' : ''} ${capturing ? 'is-captured' : ''}`} style={{ left: `${star.x}%`, top: `${star.y}%`, '--hit-margin': `${tolerance}px` } as CSSProperties}
        onClick={captureByTouch} disabled={paused || capturing} aria-label={`Pegar a estrela. Estrelas pegas: ${caught}`}>
        <span className="star-collision-halo" aria-hidden="true"/><Star size={64} fill="#F5D776" stroke="#fff3c8" strokeWidth={1.5}/>
        <svg className="capture-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47"/></svg>
      </button>
      <canvas ref={canvasRef} className="hand-overlay" aria-hidden="true"/>
      <p className="star-instruction" role="status">{paused ? 'Quer descansar um pouquinho?' : capturing ? 'Muito bem! Você conseguiu! +1' : mode === 'camera' ? 'Mova a mão até a estrela' : 'Toque na estrela!'}</p>
    </div>
    <p className="game-message">Estrelas pegas: <strong>{caught}</strong></p>
    <div className="hand-game-actions">
      <button className="kid-button" onClick={() => setMode(mode === 'camera' ? 'touch' : 'camera')}>{mode === 'camera' ? <Hand size={20}/> : <Camera size={20}/>}{mode === 'camera' ? 'Jogar com toque' : 'Ativar câmera'}</button>
      {mode === 'camera' && <><button className="kid-button" onClick={() => setMode('touch')}><CameraOff size={20}/>Desligar câmera</button><button className="kid-button" onClick={tracking.retry}><RotateCcw size={20}/>Tentar novamente</button></>}
      <button className="kid-button" onClick={onExit}>Voltar</button>
    </div>
    {waiting && mode === 'camera' && <p className="hand-help" role="status">Mostre uma mão com luz por perto. Se preferir, podemos jogar com toque, sem câmera.</p>}
    <details className="hand-options"><summary>Ajustes para brincar no seu ritmo</summary><div>
      <label>Como alcançar<select value={palm ? 'palm' : 'finger'} onChange={e => setPalm(e.target.value === 'palm')}><option value="finger">Ponta do indicador</option><option value="palm">Mão aberta · centro da palma</option></select></label>
      <label>Tempo para pegar<select value={dwellMs} onChange={e => setDwellMs(Number(e.target.value))}><option value={0}>Na hora</option><option value={200}>Um instante</option><option value={500}>Com calma</option></select></label>
      <label>Área para alcançar<select value={tolerance} onChange={e => setTolerance(Number(e.target.value))}><option value={15}>Padrão</option><option value={20}>Ampla</option><option value={30}>Mais ampla</option></select></label>
    </div></details>
    {mode === 'camera' && <p className="muted small-text hand-privacy">A câmera reconhece a mão só neste aparelho. Nenhuma imagem, vídeo ou ponto da mão é gravado ou enviado. É uma brincadeira opcional; você pode descansar quando quiser.</p>}
    {debug && <details open className="hand-debug"><summary>Diagnóstico local da mão</summary><pre>Câmera: {tracking.status.camera} · modelo: {tracking.status.model} · {tracking.status.delegate || '—'}{'\n'}{diagnostic}{error ? '\n' + tracking.status.message : ''}</pre></details>}
  </div>
}

function ctxClear(canvas: HTMLCanvasElement) { canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height) }

export function StarGame(props: GameProps) {
  return <GameShell {...props} game="star" title="Alcance as Estrelas" modes={['camera', 'touch']}
    modeLabels={{ camera: 'Ativar câmera', touch: 'Jogar com toque' }}
    intro="Mova sua mão para tocar as estrelas! Se preferir, você também pode jogar com toque, sem câmera.">
    {context => <StarPlay {...context} onExit={props.onExit}/>}
  </GameShell>
}
