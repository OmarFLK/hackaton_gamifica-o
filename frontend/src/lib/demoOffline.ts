import type { MedicationSchedule, Patient, Role, User } from './types'

// Fixtures fixas, públicas, exclusivamente fictícias. Nunca substituem uma escrita da API.
export const offlinePatients: Patient[] = [
  { id: 1, name: 'Nina Aurora', birth_date: '2017-05-17', chosen_avatar: 'pandi', clinician_id: 1 },
  { id: 2, name: 'Theo Nuvem', birth_date: '2015-10-02', chosen_avatar: 'arco', clinician_id: 1 },
  { id: 3, name: 'Lia Sol', birth_date: '2019-07-09', chosen_avatar: 'niva', clinician_id: 1 },
]
export const offlineSchedules: MedicationSchedule[] = [
  { id: 1, patient_id: 1, label: 'Medicamento A', times_json: ['08:00', '20:00'], active: true, clinician_id: 1 },
  { id: 2, patient_id: 2, label: 'Medicamento B', times_json: ['09:00'], active: true, clinician_id: 1 },
]
export function offlineUser(role: Role): User { return { id: -1, name: 'Visitante da apresentação', email: 'offline@superped.demo', role } }
export const offlineFaq = [
  ['Como vejo os horários?', 'Abra Medicamentos e escolha o dia da agenda fictícia. Os horários são definidos pela equipe.'],
  ['O alerta confirma administração?', 'Não. O lembrete depende da página aberta. A administração é um relato separado, com autor e horário.'],
  ['Como usar os jogos?', 'São brincadeiras voluntárias com opção por toque, pausa e ajuda de um adulto. Jogos são entregues pelo módulo 09.'],
  ['Como funciona a privacidade?', 'Esta apresentação usa somente dados fictícios. O modo offline é de leitura e não sincroniza alterações.'],
  ['Como envio mensagens?', 'Com a API conectada, o chat permite mensagens entre família e equipe vinculadas. Não é canal de emergência.'],
  ['Como registro água?', 'O formulário de rotina é parte do módulo 07. Registros voluntários não indicam evolução clínica.'],
  ['Como acessar?', 'Use uma conta de demonstração com a API conectada. A criança entra acompanhada pelo responsável.'],
  ['O que significa administrado?', 'Significa relato do responsável ou profissional, não prova de ingestão.'],
]
