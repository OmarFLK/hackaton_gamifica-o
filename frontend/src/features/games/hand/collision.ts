export type CapturePhase = 'idle' | 'hovering' | 'captured' | 'cooldown'
export interface CaptureState { phase: CapturePhase; hovering: Record<string, number>; capturedAt: number }
export const newCapture = (): CaptureState => ({ phase: 'idle', hovering: {}, capturedAt: 0 })
export const COOLDOWN_MS = 400

/** Dwell por mao: perder a mao ou trocar de mao reinicia sua permanencia. */
export function stepCapture(state: CaptureState, handIds: string[], now: number, dwellMs = 200) {
  if (state.phase === 'captured' || state.phase === 'cooldown') {
    if (now - state.capturedAt >= COOLDOWN_MS) return { state: newCapture(), captured: false, spawn: true, progress: 0 }
    return { state: { ...state, phase: 'cooldown' as const }, captured: false, spawn: false, progress: 0 }
  }
  const hovering = Object.fromEntries([...new Set(handIds)].map(id => [id, state.hovering[id] ?? now]))
  const elapsed = Math.max(-1, ...Object.values(hovering).map(start => now - start))
  if (elapsed >= dwellMs) return { state: { phase: 'captured' as const, hovering: {}, capturedAt: now }, captured: true, spawn: false, progress: 1 }
  return { state: { ...state, phase: handIds.length ? 'hovering' as const : 'idle' as const, hovering }, captured: false, spawn: false,
    progress: dwellMs ? Math.max(0, elapsed / dwellMs) : 0 }
}

/** Clique/toque acessivel compartilha o mesmo bloqueio de captura que o tracking. */
export function tapCapture(state: CaptureState, now: number) {
  if (state.phase === 'captured' || state.phase === 'cooldown') return null
  return { phase: 'captured' as const, hovering: {}, capturedAt: now }
}
