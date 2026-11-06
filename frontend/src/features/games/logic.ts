// Lógica pura dos jogos (sem DOM), coberta por logic.test.ts.

/** RMS simplificado de um buffer de áudio no domínio do tempo. Sinal interativo, não medida respiratória. */
export function rms(samples: ArrayLike<number>): number {
  if (!samples.length) return 0
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
  return Math.sqrt(sum / samples.length)
}

/** Limiar do microfone a partir do ruído ambiente medido na calibragem. */
export const micThreshold = (baseline: number) => Math.max(baseline * 2.5, 0.035)

// ---------- Vela ----------
export const TOUCH_BLOW = 0.25
export function blowCandle(flame: number, strength = TOUCH_BLOW): number {
  return Math.max(0, Math.round((flame - strength) * 1000) / 1000)
}
/** Sopro pelo microfone: apaga proporcionalmente ao excesso sobre o limiar, por segundo. */
export function micBlow(flame: number, level: number, threshold: number, dt: number): number {
  if (level <= threshold) return flame
  return Math.max(0, flame - Math.min(1, (level - threshold) * 6) * 0.9 * dt)
}

// ---------- Pássaro das nuvens ----------
export const BIRD = { width: 360, height: 480, x: 90, radius: 15, gravity: 820, flap: -290, gap: 175, cloudWidth: 64, spacing: 230 }
export interface Cloud { x: number; gapY: number; passed: boolean }
export interface BirdState { y: number; vy: number; clouds: Cloud[]; score: number; crashed: boolean; started: boolean }

export function newBirdState(random = Math.random): BirdState {
  return { y: BIRD.height / 2, vy: 0, score: 0, crashed: false, started: false,
    clouds: [0, 1, 2].map(i => ({ x: BIRD.width + 60 + i * BIRD.spacing, gapY: gapFor(random), passed: false })) }
}
export const gapFor = (random = Math.random) => 110 + random() * (BIRD.height - 220)

export function flap(state: BirdState): BirdState {
  if (state.crashed) return state
  return { ...state, started: true, vy: BIRD.flap }
}

export function collides(y: number, cloud: Cloud): boolean {
  const withinX = BIRD.x + BIRD.radius > cloud.x && BIRD.x - BIRD.radius < cloud.x + BIRD.cloudWidth
  const withinGap = y - BIRD.radius > cloud.gapY - BIRD.gap / 2 && y + BIRD.radius < cloud.gapY + BIRD.gap / 2
  return withinX && !withinGap
}

export function stepBird(state: BirdState, dt: number, speed: number, random = Math.random): BirdState {
  if (!state.started || state.crashed) return state
  const step = Math.min(dt, 1 / 30) // evita saltos após troca de aba
  const vy = state.vy + BIRD.gravity * step
  const y = state.y + vy * step
  let score = state.score
  const clouds = state.clouds.map(cloud => {
    const x = cloud.x - speed * step
    const passed = cloud.passed || x + BIRD.cloudWidth < BIRD.x - BIRD.radius
    if (passed && !cloud.passed) score += 1
    return { ...cloud, x, passed }
  }).map(cloud => cloud.x + BIRD.cloudWidth < 0
    ? { x: Math.max(...state.clouds.map(c => c.x)) + BIRD.spacing - speed * step, gapY: gapFor(random), passed: false }
    : cloud)
  const crashed = y - BIRD.radius < 0 || y + BIRD.radius > BIRD.height || clouds.some(cloud => collides(y, cloud))
  return { ...state, y: Math.max(BIRD.radius, Math.min(BIRD.height - BIRD.radius, y)), vy, clouds, score, crashed }
}

// ---------- Estrela ----------
/** Nova posição em % dentro da área, longe das bordas e da posição anterior. */
export function nextStar(previous: { x: number; y: number } | null, random = Math.random) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = { x: 12 + random() * 76, y: 14 + random() * 70 }
    if (!previous || Math.hypot(candidate.x - previous.x, candidate.y - previous.y) > 25) return candidate
  }
  return { x: previous && previous.x > 50 ? 25 : 75, y: 50 }
}
