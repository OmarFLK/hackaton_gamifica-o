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
6. Conectar futuros `MessageCenter`, `InformationalAssistant`, `MascotVoice`, `DeveloperDashboard` nas telas apropriadas após receber a base visual. Esses componentes ainda não foram implementados.

## Extensão de contrato

Além do contrato original, existe `PUT /api/patients/{patient_id}/medications/{schedule_id}` com os mesmos campos do POST, exclusivo do médico vinculado. A demo aceita apenas os rótulos `Medicamento A` e `Medicamento B`.

## Integração ainda pendente

Interface final, mensagens/FAQ/dev em React, voz/PWA, roteamento dos portais e testes de navegador aguardam a base do outro dev. A checagem TypeScript/build do kit não foi executada; ele é fonte de componentes, não um aplicativo independente.
