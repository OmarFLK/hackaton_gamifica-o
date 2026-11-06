import { describe, expect, it } from 'vitest'
import { BIRD, blowCandle, collides, flap, micBlow, micThreshold, newBirdState, nextStar, rms, stepBird } from './logic'

const fixed = () => 0.5

describe('vela', () => {
  it('apaga em 4 sopros por toque e nunca fica negativa', () => {
    let flame = 1
    for (let i = 0; i < 4; i++) flame = blowCandle(flame)
    expect(flame).toBe(0)
    expect(blowCandle(0)).toBe(0)
  })
  it('microfone abaixo do limiar não altera a chama', () => {
    expect(micBlow(1, 0.02, micThreshold(0.01), 0.1)).toBe(1)
    expect(micBlow(1, 0.3, micThreshold(0.01), 0.1)).toBeLessThan(1)
  })
  it('rms de silêncio é zero e de sinal constante é o próprio valor', () => {
    expect(rms(new Float32Array(8))).toBe(0)
    expect(rms([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5)
  })
})

describe('pássaro das nuvens', () => {
  it('não cai antes do primeiro toque', () => {
    const state = newBirdState(fixed)
    expect(stepBird(state, 0.5, 100, fixed)).toBe(state)
  })
  it('subir dá impulso e a gravidade puxa de volta', () => {
    let state = flap(newBirdState(fixed))
    const startY = state.y
    state = stepBird(state, 1 / 30, 100, fixed)
    expect(state.y).toBeLessThan(startY)
    for (let i = 0; i < 30; i++) state = stepBird(state, 1 / 30, 0, fixed)
    expect(state.y).toBeGreaterThan(startY)
  })
  it('detecta nuvem fora do vão e ignora dentro do vão', () => {
    const cloud = { x: BIRD.x - 10, gapY: 240, passed: false }
    expect(collides(240, cloud)).toBe(false)
    expect(collides(60, cloud)).toBe(true)
  })
  it('conta nuvem ultrapassada', () => {
    const state = { ...flap(newBirdState(fixed)), clouds: [{ x: BIRD.x - BIRD.radius - BIRD.cloudWidth + 1, gapY: 240, passed: false }], y: 240 }
    expect(stepBird(state, 1 / 30, 100, fixed).score).toBe(1)
  })
})

describe('estrela', () => {
  it('fica dentro da área e se afasta da anterior', () => {
    const values = [0.1, 0.1, 0.9, 0.9]
    let i = 0
    const random = () => values[i++ % values.length]
    const first = nextStar(null, random)
    const second = nextStar(first, random)
    for (const star of [first, second]) { expect(star.x).toBeGreaterThanOrEqual(12); expect(star.x).toBeLessThanOrEqual(88) }
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeGreaterThan(25)
  })
})
