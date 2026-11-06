import { describe, expect, it } from 'vitest'
import { handCursor, mapHandPoint, overlaps, reachableStar, smoothPoint } from './coordinates'
import { COOLDOWN_MS, newCapture, stepCapture, tapCapture } from './collision'

describe('coordenadas da mao em pixels CSS', () => {
  it('espelha uma unica vez e alinha os quatro cantos sem recorte', () => {
    const size = { width: 640, height: 480 }
    expect(mapHandPoint({ x: 0, y: 0 }, size, size)).toEqual({ x: 640, y: 0 })
    expect(mapHandPoint({ x: 1, y: 0 }, size, size)).toEqual({ x: 0, y: 0 })
    expect(mapHandPoint({ x: 0, y: 1 }, size, size)).toEqual({ x: 640, y: 480 })
    expect(mapHandPoint({ x: 1, y: 1 }, size, size)).toEqual({ x: 0, y: 480 })
  })
  it('compensa corte horizontal em object-fit cover', () => {
    const p = mapHandPoint({ x: .25, y: .5 }, { width: 640, height: 480 }, { width: 300, height: 600 })!
    expect(p).toEqual({ x: 350, y: 300 }) // fora do viewport: nunca prender a mao artificialmente na borda
    expect(mapHandPoint({ x: .5, y: .5 }, { width: 640, height: 480 }, { width: 300, height: 600 })).toEqual({ x: 150, y: 300 })
  })
  it('compensa corte vertical e resize sem depender do devicePixelRatio', () => {
    expect(mapHandPoint({ x: .5, y: .25 }, { width: 640, height: 480 }, { width: 960, height: 300 })).toEqual({ x: 480, y: -30 })
    expect(mapHandPoint({ x: .5, y: .5 }, { width: 480, height: 640 }, { width: 375, height: 400 })).toEqual({ x: 187.5, y: 200 })
  })
  it('recusa dimensoes vazias/NaN e aceita exibicao nao espelhada', () => {
    expect(mapHandPoint({ x: 0, y: 0 }, { width: 0, height: 480 }, { width: 300, height: 300 })).toBeNull()
    expect(mapHandPoint({ x: NaN, y: 0 }, { width: 640, height: 480 }, { width: 300, height: 300 })).toBeNull()
    expect(mapHandPoint({ x: .25, y: .5 }, { width: 640, height: 480 }, { width: 640, height: 480 }, false)).toEqual({ x: 160, y: 240 })
  })
  it('usa indicador ou media da palma sem exigir gesto e aplica EMA', () => {
    const points = Array.from({ length: 21 }, (_, i) => ({ x: i / 20, y: i / 20 }))
    expect(handCursor(points, false)).toEqual(points[8])
    expect(handCursor(points, true)!.x).toBeCloseTo(.44)
    expect(handCursor([], false)).toBeNull()
    expect(smoothPoint({ x: 0, y: 0 }, { x: 100, y: 200 })).toEqual({ x: 35, y: 70 })
  })
  it('detecta tolerancia circular nos quatro lados, sem transformar pixels duas vezes', () => {
    for (const p of [{ x: 174, y: 100 }, { x: 26, y: 100 }, { x: 100, y: 174 }, { x: 100, y: 26 }]) expect(overlaps(p, { x: 100, y: 100 }, 42, 20, 12)).toBe(true)
    expect(overlaps({ x: 175, y: 100 }, { x: 100, y: 100 }, 42, 20, 12)).toBe(false)
  })
  it('gera alvos inteiros longe do HUD, controles e bordas, sem exigir amplitude minima da mao', () => {
    for (let i = 0; i < 100; i++) {
      const p = reachableStar(null)
      expect(p.x).toBeGreaterThanOrEqual(22); expect(p.x).toBeLessThanOrEqual(78)
      expect(p.y).toBeGreaterThanOrEqual(34); expect(p.y).toBeLessThanOrEqual(68)
    }
    expect(reachableStar({ x: 50, y: 50 }, () => .5)).toEqual({ x: 73, y: 50 })
  })
})

describe('captura idempotente e ciclo da estrela', () => {
  it('captura apenas apos 200 ms e duas maos dao exatamente um ponto', () => {
    let s = stepCapture(newCapture(), ['Left', 'Right'], 100).state
    expect(stepCapture(s, ['Left', 'Right'], 299).captured).toBe(false)
    const captured = stepCapture(s, ['Left', 'Right'], 300)
    expect(captured.captured).toBe(true)
    s = captured.state
    expect(stepCapture(s, ['Left', 'Right'], 301).captured).toBe(false)
    expect(tapCapture(s, 302)).toBeNull()
    expect(stepCapture(s, ['Left'], 300 + COOLDOWN_MS).spawn).toBe(true)
  })
  it('perder a mao ou alternar maos reinicia a permanencia', () => {
    const s = stepCapture(newCapture(), ['Left'], 0).state
    expect(stepCapture(s, ['Right'], 210).captured).toBe(false)
    const lost = stepCapture(s, [], 150).state
    expect(lost.phase).toBe('idle')
    expect(stepCapture(lost, ['Left'], 300).captured).toBe(false)
  })
  it('suporta captura instantanea e maior tempo sem penalizar movimentos lentos', () => {
    expect(stepCapture(newCapture(), [], 0, 0).captured).toBe(false)
    expect(stepCapture(newCapture(), ['Left'], 0, 0).captured).toBe(true)
    const s = stepCapture(newCapture(), ['Left'], 0, 500).state
    expect(stepCapture(s, ['Left'], 499, 500).captured).toBe(false)
    expect(stepCapture(s, ['Left'], 500, 500).captured).toBe(true)
  })
  it('permite cinco estrelas consecutivas, um ponto por alvo e cooldown tambem no toque', () => {
    let s = newCapture(), points = 0
    for (let i = 0; i < 5; i++) {
      const now = i * 1000
      s = stepCapture(s, ['Left'], now).state
      const captured = stepCapture(s, ['Left', 'Right'], now + 200)
      points += Number(captured.captured); s = captured.state
      expect(tapCapture(s, now + 250)).toBeNull()
      s = stepCapture(s, [], now + 600).state
    }
    expect(points).toBe(5)
    const tapped = tapCapture(newCapture(), 0)!
    expect(tapCapture(tapped, 1)).toBeNull()
  })
})
