// Tipos do CONTRATO_MVP_4H. Datas em ISO 8601. Não inventar campos fora do contrato
// (extensões documentadas: reporter_user_id, guardians/clinician_name, form-options).
export type Role = 'CLINICIAN' | 'GUARDIAN' | 'CLINICAL_ASSISTANT' | 'DEVELOPER'
export interface User { id: number; name: string; email: string; role: Role }
export interface LoginResponse { access_token: string; token_type: 'bearer'; user: User }

export type AvatarId = 'arco' | 'guarda-lua' | 'faisca' | 'pinta' | 'pipo' | 'niva' | 'pandi'
export interface Patient { id: number; name: string; birth_date: string; chosen_avatar: string; clinician_id: number }
export interface LinkedGuardian { id: number; name: string }
export interface PatientDetail extends Patient { clinician_name: string | null; guardians: LinkedGuardian[] }
export interface PatientClinical extends PatientDetail { clinical_notes: string | null; cancer_type_demo: string | null; clinical_stage_demo: string | null }
export interface PatientCreateInput {
  name: string; birth_date: string; chosen_avatar: AvatarId; clinician_id?: number; guardian_user_id?: number
  clinical_notes?: string; cancer_type_demo?: string; clinical_stage_demo?: string
}
export interface PersonOption { id: number; name: string; email: string }
export interface FormOptions { clinicians: PersonOption[]; guardians: PersonOption[] }

export type MoodSource = 'CHILD' | 'GUARDIAN'
export interface MoodEntry { id: number; patient_id: number; score: number; source: MoodSource; recorded_at: string; note: string | null; reporter_user_id: number | null }
export type RoutineKind = 'water' | 'meal'
export interface RoutineEntry { id: number; patient_id: number; kind: RoutineKind; quantity: number | null; unit: string | null; description: string | null; recorded_at: string; source: string; reporter_user_id: number | null }

export interface MedicationSchedule { id: number; patient_id: number; label: string; times_json: string[]; active: boolean; clinician_id: number }
export type EventStatus = 'given' | 'not_given' | 'postponed'
export interface MedicationEvent { id: number; schedule_id: number; scheduled_for: string; status: EventStatus; reported_at: string; reporter_user_id: number; note: string | null }
export interface Message { id: number; patient_id: number; sender_user_id: number; body: string; created_at: string }

export type GameId = 'candle' | 'bird' | 'star'
export type GameMode = 'touch' | 'microphone' | 'camera'
export interface GameSession { id: number; patient_id: number; game: GameId; mode: GameMode; duration_seconds: number; created_at: string }

export interface UpcomingMedication { schedule_id: number; label: string; time: string }
export interface PatientDashboard {
  patient: PatientDetail; mood_last_7_days: MoodEntry[]; water_entries: RoutineEntry[]; meal_entries: RoutineEntry[]
  game_sessions_count: number; upcoming_medications: UpcomingMedication[]; disclaimer?: string
}

export interface Answer { answer: string; source: string; escalate: boolean; is_demo: boolean }
export interface DeveloperStatus { api: string; demo: boolean; modules: string[]; version?: string }
export interface Health { status: 'ok'; demo: boolean }
