export type Role = 'CLINICIAN' | 'GUARDIAN' | 'CLINICAL_ASSISTANT' | 'DEVELOPER'
export interface User { id: number; name: string; email: string; role: Role }
export interface Patient { id: number; name: string; birth_date: string; chosen_avatar: string; clinician_id: number }
export interface MedicationSchedule { id: number; patient_id: number; label: string; times_json: string[]; active: boolean; clinician_id: number }
export type EventStatus = 'given' | 'not_given' | 'postponed'
export interface MedicationEvent { id: number; schedule_id: number; scheduled_for: string; status: EventStatus; reported_at: string; reporter_user_id: number; note: string | null }
export interface Message { id: number; patient_id: number; sender_user_id: number; body: string; created_at: string }
export interface Answer { answer: string; source: string; escalate: boolean; is_demo: boolean }
export interface DeveloperStatus { api: string; demo: boolean; modules: string[]; version?: string }
