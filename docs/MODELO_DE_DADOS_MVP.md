# Modelo resumido para as IAs

```mermaid
erDiagram
 USER ||--o{ PATIENT_GUARDIAN : vincula
 USER ||--o{ PATIENT : acompanha_como_clinico
 PATIENT ||--o{ PATIENT_GUARDIAN : possui
 PATIENT ||--o{ MOOD_ENTRY : registra
 PATIENT ||--o{ ROUTINE_ENTRY : relata
 PATIENT ||--o{ MEDICATION_SCHEDULE : agenda
 MEDICATION_SCHEDULE ||--o{ MEDICATION_EVENT : reporta
 PATIENT ||--o{ MESSAGE : conversa
 PATIENT ||--o{ GAME_SESSION : joga
```

As tabelas e campos oficiais estão no `CONTRATO_MVP_4H.md`. `source` e `reporter_user_id` nunca vêm sem validação da sessão. Notificação local nunca vira evidência de administração. `MedicationSchedule` representa prescrição fictícia inserida pelo médico; `MedicationEvent` representa relato.
