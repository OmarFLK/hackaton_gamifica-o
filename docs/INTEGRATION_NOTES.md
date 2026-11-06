# Integração

## Módulos 01–09 (fundação, portais, área infantil e jogos)

Atualizado em 06/11/2026. A fundação substituiu a bancada temporária, conforme a seção "Base temporária" abaixo previa.

**Backend**
- `app/core/config.py`, `database.py`, `security.py`, `dependencies.py`; `app/models/entities.py` e `schemas.py`; `app/seed.py`.
- `app/integration.py` agora reexporta a fundação; os routers 10–13 não foram alterados. `demo_support.py` foi removido; os testes originais só tiveram os imports trocados.
- Novos routers: `auth`, `patients`, `routines`, `mood`, `games` (todos registrados em `main.py`).
- Startup: cria tabelas sempre; o seed só roda com `DEMO_MODE=true` (antes a API se recusava a subir sem a flag).

**Extensões ao contrato (documentadas, sem quebrar campos existentes)**
- `ClinicianDelegate` (médico → assistente). O seed delega `assistente@` para `medico@`. O assistente lista os pacientes delegados, cadastra pacientes (sem campos clínicos) e vincula a família; continua com 403 em medicamentos/mensagens/humor/rotina.
- `reporter_user_id` em `MoodEntry`, `RoutineEntry` e `GameSession`, sempre vindo do token.
- `GET /api/patients/form-options` (médicos representáveis e responsáveis demo) e `PUT /api/patients/{id}/clinical-review` (só médico; campos fictícios).
- `GET /api/patients/{id}/games` para leitura. A resposta do detalhe inclui `clinician_name` e `guardians`; os campos clínicos aparecem só para `CLINICIAN`.
- Escrita de humor, rotina e jogos: somente `GUARDIAN` vinculado (a criança registra pela sessão dele).

**Frontend (`frontend/`, app oficial)**
- Criado a partir do kit: features 10–13, marca, manifest e service worker foram reaproveitados sem reescrita. O shell provisório (`App.tsx`/`SessionProvider`) foi substituído por `app/AuthProvider.tsx` (com `ProtectedRoute` e modo offline), `PatientsProvider.tsx` e `router.tsx`.
- Exports: `LandingPage`, `LoginPage`/`LoginForm` (`pages/public`), `AdultLayout`, `ChildLayout` (`components/layouts`), `DemoBadge` e primitives (`components/ui`), páginas `doctor/*`, `guardian/*`, `child/*` e `CandleGame`, `BirdGame`, `StarGame` (`features/games`).
- `components/ui` reexporta `Loading`/`ErrorState`/`EmptyState` de `components/common/Feedback`, sem duplicá-los.
- `scripts/setup-demo.ps1` e `start-demo.ps1` agora usam `frontend/`. `start-demo.ps1 -ApiPort 8010` permite outra porta, recompilando com `VITE_API_URL`.
- Smoke de navegador: `scripts/smoke_01_09.py` (variável `SMOKE_BASE`).

---

# Integração dos módulos 10–18

Atualizado em 06/11/2026. A interface geral será desenvolvida pelo outro dev e enviada pelo GitHub. Não substituir a interface dele por este kit.

## O que está disponível

- `backend/app/routers/medications.py`: agenda GET/POST, edição PUT e relatos GET/POST; validação de vínculo, perfil, horário e autoria.
- `backend/app/routers/messages.py`: GET/POST por paciente, autor obtido da sessão, sem WebSocket.
- `backend/app/routers/assistant.py`: FAQ determinística com oito tópicos e encaminhamento para perguntas clínicas; nenhuma API paga.
- `backend/app/routers/developer.py`: status sintético exclusivo DEVELOPER.
- `backend/app/main.py`: registro dos quatro routers, health e CORS por origem configurada.
- `integration-kit/frontend/src/features/medications/`: componentes exportados `MedicationCalendar`, `MedicationReminder`, `MedicationConfirmDialog`.
- `integration-kit/frontend/src/lib/`: cliente REST, tipos e fixtures públicas somente de leitura.
- `features/messages/MessageCenter`, `features/assistant/InformationalAssistant`, `features/child-voice/MascotVoice`, `pages/developer/DeveloperDashboard`: componentes conectados e testados no preview isolado.
- `public/manifest.webmanifest`, `public/brand/` e `scripts/build-offline.mjs`: identidade Pendi, PWA e cache restrito a arquivos públicos.

## Base temporária, isolada

`backend/app/demo_support.py` serve de bancada enquanto os módulos 02/04/05 não chegam. Usa SQLAlchemy, SQLite local ou PostgreSQL por ambiente, Argon2, JWT e seed idempotente. Só inicializa com `DEMO_MODE=true` e segredo de pelo menos 32 caracteres. Fornece login demo e lista de pacientes de leitura; não implementa os portais, cadastros, rotina, humores ou jogos 00–09.

Quando a fundação chegar, trocar os imports de `backend/app/integration.py` pelos modelos/dependências compartilhados e remover o registro de `demo_support.router` e sua inicialização em `main.py`. Verificar nomes de tabelas e schemas antes de reutilizar o banco; não apontar modelos incompatíveis para o mesmo schema.

Os routers esperam `get_db`, `current_user`, `authorize_patient(db, user, patient_id, roles)`, `User`, `MedicationSchedule`, `MedicationEvent`, `Message`. Os campos seguem `CONTRATO_MVP_4H.md`. Assistente sem delegação explícita tem acesso negado; não vincular todos os pacientes implicitamente.

## Conectar ao frontend do outro dev

1. Comparar os tipos, cliente de API e provider de autenticação existentes. Reutilizar a versão dele; não copiar o scaffold sobre arquivos compartilhados.
2. Copiar apenas as features desejadas do kit. `MedicationCalendar` recebe `{patientId, role, offline?}`. Montar com `key={patientId}` ao trocar paciente para limpar formulário e timers.
3. Chamar `configureApi(() => tokenAtual, logout)` no cliente do kit, ou adaptar os imports das features ao cliente único do projeto. `VITE_API_URL` é a raiz, sem `/api` no fim.
4. Integrar agenda na ficha do médico e área da família. `offline=true` usa fixtures públicas e desabilita gravações. Nenhuma falha HTTP deve ativar sucesso local.
5. Históricos guardam todas as correções; a ocorrência exibe o evento mais recente, por id. `scheduled_for` deve incluir o offset local, mantendo HH:MM da agenda. `reported_at` e autor são do servidor.
6. Conectar `MessageCenter({patientId, userId, offline?})`, `InformationalAssistant({offline?})`, `MascotVoice({onCallAdult?, mascotName?})`, `DeveloperDashboard({offline?})` nas telas apropriadas. Os quatro já estão implementados. Montar chat e agenda com chave por paciente; a área infantil só deve ser aberta por responsável vinculado.
7. Copiar `public/brand/` e manifest; incluir o gerador de service worker no build final, adaptando os caminhos. Nunca cachear respostas da API. Registrar o worker somente no build de produção.

## Extensão de contrato

Além do contrato original, existe `PUT /api/patients/{patient_id}/medications/{schedule_id}` com os mesmos campos do POST, exclusivo do médico vinculado. A demo aceita apenas os rótulos `Medicamento A` e `Medicamento B`.

## Integração ainda pendente

Os módulos complementares funcionam num aplicativo independente em `integration-kit/frontend` (porta 5174), com CSS, login, roteamento e offline. Build/TypeScript, 9 testes de lógica frontend e 18 verificações de navegador passaram. A integração no frontend principal e com os modelos/autorização dos módulos 00–09 aguarda o código do outro dev. Não portar o shell provisório sobre a interface dele.
