import { DEMO_ENABLED } from './api'
import { offlinePatients, offlineSchedules } from './demoOffline'
import type { MoodEntry, PatientDashboard, RoutineEntry } from './types'

export const isDemo = DEMO_ENABLED
export const DEMO_LABEL = 'DEMONSTRAÇÃO'
export const DEMO_DISCLAIMER = 'DEMONSTRAÇÃO • Não validado para uso clínico'
export const OFFLINE_SAVE_LABEL = 'Salvo apenas neste dispositivo (demo offline)'
export const ROUTINE_DISCLAIMER = 'Relatado pela família · indicadores de rotina, não evolução clínica.'

export const DEMO_ACCOUNTS = [
  { profile: 'profissional', label: 'Médico(a) demo', email: 'medico@superped.demo' },
  { profile: 'profissional', label: 'Assistente demo', email: 'assistente@superped.demo' },
  { profile: 'responsavel', label: 'Responsável demo', email: 'responsavel@superped.demo' },
  { profile: 'dev', label: 'Dev demo', email: 'dev@superped.demo' },
] as const
export const DEMO_PASSWORD = 'Demo2026!'

function daysAgo(days: number, hour = 12) {
  const date = new Date(); date.setDate(date.getDate() - days); date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

// Fixtures de leitura para o modo offline. Nunca substituem uma escrita da API.
const offlineMoods: MoodEntry[] = [
  { id: -1, patient_id: 1, score: 5, source: 'CHILD', recorded_at: daysAgo(0), note: null, reporter_user_id: null },
  { id: -2, patient_id: 1, score: 3, source: 'CHILD', recorded_at: daysAgo(1), note: null, reporter_user_id: null },
  { id: -3, patient_id: 1, score: 6, source: 'GUARDIAN', recorded_at: daysAgo(3), note: null, reporter_user_id: null },
  { id: -4, patient_id: 2, score: 6, source: 'GUARDIAN', recorded_at: daysAgo(0), note: null, reporter_user_id: null },
]
const offlineRoutines: RoutineEntry[] = [
  { id: -1, patient_id: 1, kind: 'water', quantity: 150, unit: 'ml', description: null, recorded_at: daysAgo(0, 10), source: 'GUARDIAN', reporter_user_id: null },
  { id: -2, patient_id: 1, kind: 'water', quantity: 250, unit: 'ml', description: null, recorded_at: daysAgo(1, 15), source: 'GUARDIAN', reporter_user_id: null },
  { id: -3, patient_id: 1, kind: 'meal', quantity: null, unit: null, description: 'Lanche informado pela família', recorded_at: daysAgo(0, 16), source: 'GUARDIAN', reporter_user_id: null },
]

export function offlineDashboard(patientId: number): PatientDashboard | null {
  const patient = offlinePatients.find(p => p.id === patientId)
  if (!patient) return null
  const routines = offlineRoutines.filter(r => r.patient_id === patientId)
  return {
    patient: { ...patient, clinician_name: 'Dra. Marina Demo', guardians: [{ id: -1, name: 'Rafa Responsável' }] },
    mood_last_7_days: offlineMoods.filter(m => m.patient_id === patientId),
    water_entries: routines.filter(r => r.kind === 'water'),
    meal_entries: routines.filter(r => r.kind === 'meal'),
    game_sessions_count: 0,
    upcoming_medications: offlineSchedules.filter(s => s.patient_id === patientId)
      .flatMap(s => s.times_json.map(time => ({ schedule_id: s.id, label: s.label, time }))).sort((a, b) => a.time.localeCompare(b.time)),
  }
}
export const offlineMoodsFor = (patientId: number) => offlineMoods.filter(m => m.patient_id === patientId)
export const offlineRoutinesFor = (patientId: number) => offlineRoutines.filter(r => r.patient_id === patientId)
