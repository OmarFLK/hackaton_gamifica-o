# SUPERPED — CONTRATO FIXO MVP HACKATHON 4H

**Este documento vence qualquer requisito P1/P2 do plano mestre.** Todas as IAs obedecem estes nomes de rotas, campos e estados. Datas ISO 8601, respostas JSON, erros com `{ "detail": "mensagem" }`. Frontend `VITE_API_URL` aponta para raiz da API, que utiliza `/api`.

## Papéis
- `CLINICIAN`: médico, responsável por cadastro e prescrições; acessa pacientes vinculados.
- `CLINICAL_ASSISTANT`: somente cadastro administrativo autorizado e listagem delegada; SEM ajuste clínico ou prescrição.
- `GUARDIAN`: responsável, somente criança(s) vinculada(s); registra rotina/administração relatada.
- `DEVELOPER`: dados sintéticos técnicos agregados, nunca registros clínicos.
- `CHILD`: **não é login de senha no MVP**. Área de jogo aberta somente por sessão do `GUARDIAN` com paciente vinculado (ou demo-kiosk exclusivamente `DEMO_MODE=true`, identificado como simulação).

## Login e usuários fictícios
`POST /api/auth/login {"email":"medico@superped.demo","password":"Demo2026!"}` -> `{"access_token":"<jwt>","token_type":"bearer","user":{"id":1,"name":"Dra. Marina Demo","role":"CLINICIAN"}}`.
`GET /api/auth/me` -> `{"id":1,"name":"Dra. Marina Demo","email":"...","role":"CLINICIAN"}`. Front envia `Authorization: Bearer <token>`. Senha armazenada como hash, `JWT_SECRET` por env. Não hardcode token. Em demo público, dados exclusivamente falsos.

## Entidades base (id inteiros para simplificar)
- `User`: id, name, email (único), password_hash, role, active.
- `Patient`: id, name, birth_date, clinical_notes (somente clínico), cancer_type_demo, clinical_stage_demo (somente médico; marcado fictício), chosen_avatar (`pandi`, ...), clinician_id.
- `PatientGuardian`: id, patient_id, guardian_user_id.
- `MoodEntry`: id, patient_id, score (1–7), source (`CHILD`|`GUARDIAN`), recorded_at, note (opcional).
- `RoutineEntry`: id, patient_id, kind (`water`|`meal`), quantity (opcional), unit (opcional), description (opcional), recorded_at, source (`GUARDIAN`).
- `MedicationSchedule`: id, patient_id, label (`Medicamento A`), times_json (`["08:00","20:00"]`), active, clinician_id. Evitar doses e substâncias reais na demo.
- `MedicationEvent`: id, schedule_id, scheduled_for (ISO), status (`given`|`not_given`|`postponed`), reported_at, reporter_user_id, note. `given` = **relato do responsável**, não prova de ingestão.
- `Message`: id, patient_id, sender_user_id, body, created_at.
- `GameSession`: id, patient_id, game (`candle`|`bird`|`star`), mode (`touch`|`microphone`|`camera`), duration_seconds, created_at.

## API: endpoints obrigatórios
- `GET /api/health` -> `{ "status": "ok", "demo": true }` público.
- `POST /api/auth/login`, `GET /api/auth/me`.
- `GET /api/patients` -> `[PatientSummary]` somente clínico/assistente delegado/família (escopo).
- `POST /api/patients` -> `PatientSummary` médico/assistente delegado para dados administrativos; campo clínico somente médico.
- `GET /api/patients/{patient_id}` -> `PatientDetail` filtrado por perfil: nunca expor `clinical_notes` ao `GUARDIAN` nem à criança por padrão.
- `POST /api/patients/{patient_id}/guardians` -> `{"guardian_user_id":2}` só médico/assistente delegado.
- `GET /api/patients/{patient_id}/dashboard` -> `{ "patient":{...}, "mood_last_7_days":[...], "water_entries":[...], "meal_entries":[...], "game_sessions_count": number, "upcoming_medications":[...] }`.
- `GET /api/patients/{patient_id}/moods` -> `MoodEntry[]`; `POST /api/patients/{patient_id}/moods {"score":4,"source":"CHILD"}` -> MoodEntry; criança via sessão autorizada do responsável.
- `GET /api/patients/{patient_id}/routines` -> RoutineEntry[]; `POST .../routines {"kind":"water","quantity":150,"unit":"ml"}` ou `{ "kind":"meal", "description":"Almoço relatado" }` -> RoutineEntry.
- `GET /api/patients/{patient_id}/medications` -> MedicationSchedule[].
- `POST /api/patients/{patient_id}/medications {"label":"Medicamento A","times_json":["08:00","20:00"]}` -> MedicationSchedule SOMENTE médico.
- `GET /api/patients/{patient_id}/medication-events` -> MedicationEvent[]. `POST /api/patients/{patient_id}/medication-events {"schedule_id":1,"scheduled_for":"2026-11-06T14:30:00-03:00","status":"given","note":"Administrado segundo responsável"}` -> MedicationEvent (responsável ou médico), impedir falsificar autoria.
- `GET /api/patients/{patient_id}/messages` -> Message[]; `POST .../messages {"body":"Olá, equipe"}` -> Message (somente responsáveis e equipe vinculada).
- `POST /api/assistant/ask {"question":"Como vejo os horários?"}` -> `{ "answer":"...", "source":"FAQ SuperPed — demonstração", "escalate":false, "is_demo":true }`; para questão clínica pessoal, `escalate:true` e resposta de encaminhamento, sem doses.
- `POST /api/patients/{patient_id}/games {"game":"bird","mode":"touch","duration_seconds":25}` -> GameSession.
- `GET /api/developer/status` -> `{ "api":"ok", "demo":true, "modules":["patients","games","medications"] }` role DEVELOPER; sem PII.

## Contrato de frontend
- `/` landing de perfis e aviso demo; `/login` profissional/responsável/dev; `/medico` e `/medico/pacientes`; `/familia`; `/crianca/:patientId`; `/dev`.
- `AuthProvider` controla token/role; `ProtectedRoute` checa role client para UX, MAS backend checa role e vínculo obrigatoriamente.
- Se API disponível, dados de backend são fonte; se não, fixtures visivelmente sinalizadas. Nenhum botão 'Salvar' deve alegar sucesso quando somente houve mudança em memória: mostrar 'Salvo apenas neste dispositivo (demo offline)'.
- Design tokens `#203774`, `#132653`, `#941C2F`, `#101521`, `#FFFFFF`, `#F4F6FA`, `#E3E7EF`.

## Regras de segurança e UX
- `score` de humor = opinião da criança, NUNCA estadiamento, previsão de doença ou diagnóstico.
- Nunca expor nomes de medicamentos em notificação visível no lockscreen por padrão.
- 'T-5 minutos' pode ser SIMULADO localmente com botão 'Simular alerta em 10 segundos'; relógios reais apenas enquanto navegador aberto; não prometer push garantido.
- Jogos não são prescrições nem monitoramento pulmonar/motor; pausa/sair/fallback toque em todos.
- Todos os exemplos são ficcionais com aviso `DEMONSTRAÇÃO • Não validado para uso clínico`.
