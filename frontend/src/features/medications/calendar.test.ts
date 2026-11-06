import { describe, expect, it } from 'vitest'
import { isoWithOffset, localDay, nextOccurrence, occurrencesForDay } from './calendar'
import type { MedicationEvent, MedicationSchedule } from '../../lib/types'
const schedule: MedicationSchedule = { id: 1, patient_id: 1, clinician_id: 1, label: 'Medicamento A', active: true, times_json: ['08:00', '20:00'] }
function event(id: number, status: MedicationEvent['status']): MedicationEvent { return { id, schedule_id: 1, scheduled_for: new Date('2026-11-06T08:00:00').toISOString(), status, reported_at: new Date().toISOString(), reporter_user_id: 2, note: null } }
describe('Ocorrências e relatos', () => {
  it('preserva dia e horário locais ao serializar com offset', () => {
    const local = new Date(2026, 10, 6, 8, 0)
    expect(localDay(local)).toBe('2026-11-06')
    expect(isoWithOffset(local)).toMatch(/^2026-11-06T08:00:00[+-]\d{2}:\d{2}$/)
    expect(new Date(isoWithOffset(local)).getTime()).toBe(local.getTime())
  })
  it('ordena horários e ignora agendas inativas', () => {
    const result = occurrencesForDay([{ ...schedule, times_json: ['20:00', '08:00'] }, { ...schedule, id: 2, active: false }], [], '2026-11-06')
    expect(result).toHaveLength(2)
    expect(result[0].date.getHours()).toBe(8)
  })
  it('usa a correção mais recente da mesma ocorrência, preservando histórico', () => {
    const history = [event(2, 'postponed'), event(3, 'given'), event(1, 'not_given')]
    expect(occurrencesForDay([schedule], history, '2026-11-06')[0].event?.status).toBe('given')
    expect(history).toHaveLength(3)
  })
  it('não usa relato de outra agenda ou outra data', () => {
    expect(occurrencesForDay([schedule], [{ ...event(1, 'given'), schedule_id: 2 }], '2026-11-06')[0].event).toBeUndefined()
    expect(occurrencesForDay([schedule], [event(1, 'given')], '2026-11-07')[0].event).toBeUndefined()
  })
  it('calcula o próximo dia depois do último horário, incluindo virada do mês', () => {
    const next = nextOccurrence([schedule], [], new Date('2026-11-30T23:59:00'))
    expect(next && localDay(next.date)).toBe('2026-12-01')
    expect(next?.date.getHours()).toBe(8)
  })
  it('não trata um relato como próxima ocorrência pendente', () => {
    const next = nextOccurrence([schedule], [event(1, 'given')], new Date('2026-11-06T07:00:00'))
    expect(next?.date.getHours()).toBe(20)
  })
  it('não inventa ocorrência quando não existe agenda ativa', () => {
    expect(nextOccurrence([], [])).toBeUndefined()
  })
})
