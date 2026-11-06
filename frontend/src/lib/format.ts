import type { MoodEntry, RoutineEntry } from './types'

export function ageFrom(birthDate: string, today = new Date()): number {
  const [year, month, day] = birthDate.split('-').map(Number)
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1
  return age
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
export const formatDateTime = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
export const formatBirth = (date: string) => date.split('-').reverse().join('/')

/** Chave local AAAA-MM-DD (fuso do navegador). */
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function lastDays(count = 7, today = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today); date.setDate(today.getDate() - (count - 1 - index))
    return { key: dayKey(date), label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '') }
  })
}

export interface DayPoint { key: string; label: string; value: number | null; count: number }

/** Média diária de humor (1–7). Dia sem registro = null ("Sem informação"), nunca zero. */
export function moodByDay(entries: MoodEntry[], today = new Date()): DayPoint[] {
  return lastDays(7, today).map(day => {
    const items = entries.filter(entry => dayKey(new Date(entry.recorded_at)) === day.key)
    const value = items.length ? Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length * 10) / 10 : null
    return { ...day, value, count: items.length }
  })
}

/** Total diário de água relatada em ml. Dia sem registro = null. */
export function waterByDay(entries: RoutineEntry[], today = new Date()): DayPoint[] {
  return lastDays(7, today).map(day => {
    const items = entries.filter(entry => entry.kind === 'water' && dayKey(new Date(entry.recorded_at)) === day.key)
    return { ...day, value: items.length ? items.reduce((sum, item) => sum + (item.quantity ?? 0), 0) : null, count: items.length }
  })
}

/** Próximo horário de hoje a partir de "HH:MM"; null se todos já passaram. */
export function nextTime<T extends { time: string }>(items: T[], now = new Date()): T | null {
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return [...items].sort((a, b) => a.time.localeCompare(b.time)).find(item => item.time >= current) ?? null
}
