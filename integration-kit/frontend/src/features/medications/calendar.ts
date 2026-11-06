import type { MedicationEvent, MedicationSchedule } from '../../lib/types'
export interface Occurrence { schedule: MedicationSchedule; date: Date; key: string; event?: MedicationEvent }
export function localDay(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
// ISO com offset preserva o horário local contratado; toISOString() perde a hora da agenda.
export function isoWithOffset(date: Date) {
  const minutes = -date.getTimezoneOffset()
  const offset = `${minutes >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, '0')}:${String(Math.abs(minutes) % 60).padStart(2, '0')}`
  return `${localDay(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00${offset}`
}
export function occurrencesForDay(schedules: MedicationSchedule[], events: MedicationEvent[], day: string): Occurrence[] {
  return schedules.filter(s => s.active).flatMap(schedule => schedule.times_json.map(time => {
    const date = new Date(`${day}T${time}:00`)
    const event = events.filter(e => e.schedule_id === schedule.id && new Date(e.scheduled_for).getTime() === date.getTime()).sort((a, b) => b.id - a.id)[0]
    return { schedule, date, event, key: `${schedule.id}:${date.getTime()}` }
  })).sort((a, b) => a.date.getTime() - b.date.getTime())
}
export function nextOccurrence(schedules: MedicationSchedule[], events: MedicationEvent[], now = new Date()) {
  for (let day = 0; day < 8; day++) {
    const date = new Date(now); date.setDate(date.getDate() + day)
    const occurrence = occurrencesForDay(schedules, events, localDay(date)).find(o => o.date >= now && !o.event)
    if (occurrence) return occurrence
  }
}
export const statusText = { given: 'Relatado como administrado', not_given: 'Não administrado', postponed: 'Adiado' }
