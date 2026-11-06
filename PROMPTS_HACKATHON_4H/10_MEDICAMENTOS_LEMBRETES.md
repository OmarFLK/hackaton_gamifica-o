# PROMPT 10 — Medicamentos, registro e alarmes de demonstração

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 25 minutos. Objetivo: mostrar lembrete T-5 e confirmar administração informada, sem prescrever


## Regras obrigatórias para TODOS os agentes
- Contexto: **SuperPed — Jornada Corajosa**, demo acadêmica hackathon Instituto Mauá de Tecnologia × Centro Universitário São Camilo. **PRAZO TOTAL: 4 HORAS**. Produzir CÓDIGO EXECUTÁVEL, não apenas texto ou pseudocódigo. Trabalhe no repositório atual, inspecione arquivos existentes e não destrua trabalho de outras IAs.
- **100% gratuito/sem cartão**: React + TypeScript + Vite, Tailwind CSS e Lucide React, Recharts; Python + FastAPI + SQLAlchemy; PostgreSQL Neon Free via DATABASE_URL, fallback SQLite local; Vercel Hobby para frontend acadêmico não comercial, Render Free para backend. Sem SMS, ElevenLabs pago, OpenAI API paga, Firebase pago, APIs médicas ou serviços com cobrança automática.
- A aplicação é SOMENTE UMA DEMONSTRAÇÃO acadêmica. Todos os dados são **100% fictícios** com badge DEMONSTRAÇÃO. Não usar dados reais de crianças, fotos, registros médicos ou credenciais reais. NÃO afirmar validação clínica; não oferecer diagnósticos, dose, estágio estimado, tratamento ou aconselhamento médico individual.
- Sempre disponibilizar alternativas a microfone e câmera. Voz infantil apenas sintética e original via `speechSynthesis`; nada de clonagem, vozes de atores ou personagens protegidos. Sete companheiros originais: Arco, Guarda-Lua, Faísca, Pinta, Pipo, Niva (lenço opcional), Pandi (panda neutro).
- Identidade visual canônica: navy #203774, azul-noite #132653, vinho #941C2F, preto #101521, branco #FFFFFF, fundo #F4F6FA, bordas #E3E7EF; Montserrat (título), Open Sans (texto), Nunito (infantil); componentes acessíveis, responsividade mobile-first, botões 48px, foco visível, animação reduzida. Co-branding tipográfico, não falsificar logos oficiais.
- Segurança: autenticação e verificação de permissões no BACKEND, nunca confiar apenas em ocultar botão. Médico vê pacientes vinculados; responsável somente filhos vinculados; assistente faz cadastro administrativo delegado mas NÃO altera diagnóstico/prescrição; desenvolvedor vê apenas ambiente/telemetria sintéticos e NÃO vê dados clínicos. Criança usa acesso assistido pelo responsável, sem credencial nem prontuário.
- **Não edite arquivos de outro agente**. Se precisar, registre no seu `INTEGRATION_NOTES.md` e exporte os componentes/routers para integração pelo coordenador. Evitar refatoração ampla.
- Toda resposta da IA deve incluir: arquivos modificados, comandos utilizados, testes/build, pendências reais e instrução mínima de integração. Sem alegar funcionalidades não executadas.
- Leia antes: `docs/CONTRATO_MVP_4H.md` e `docs/ARQUITETURA_E_OWNERSHIP.md` (incluídos no pacote); se ainda não tiverem sido copiados ao repositório, peça ao coordenador que os copie, ou use o contrato fornecido com este prompt.

## Propriedade de arquivos — não editar fora daqui
- `frontend/src/features/medications/**`, `backend/app/routers/medications.py`; exportar `MedicationCalendar`, `MedicationReminder`, `MedicationConfirmDialog` e o router. Sem editar sidebar ou dashboard alheios.

## Implementação obrigatória, em ordem
1. API: GET e POST da agenda (`/api/patients/{id}/medications`), GET e POST eventos (`/api/patients/{id}/medication-events`). Médico cadastra/edita agenda por autorização; responsável SOMENTE registra que foi administrado, não administrado ou adiado. Verificar vínculo backend.
2. Use medicamento fictício 'Medicamento A' e 'Medicamento B' e horários; não inventar dosagens, contraindicações, efeitos ou conselhos clínicos. Agenda mostra 'Programado', 'Relatado como administrado', 'Não administrado', 'Adiado', 'Sem confirmação'. `scheduled_for` explícito para eventos e `reported_at` servidor.
3. UI familiar: próxima ocorrência, calendário/lista, modal de confirmação com radio 'Administrado', 'Não administrado', 'Adiado', nota opcional, histórico atribuível ao responsável.
4. Lembretes: mostrar aviso **5 min antes** se página aberta, no horário e estado pendente. Usar timers no cliente com cleanup e cálculo de calendário; notificações web apenas com permissão e contexto HTTPS, sem expor nome/dose em lockscreen.
5. Criar botão 'Simular lembrete em 10 segundos' visivelmente identificado como demo para pitch. Mostrar `Lembrete de medicamento programado` e CTA 'Ver agenda'. Não alegar push garantido quando browser fechado, nem disparo em background no Render Free.
6. Não usar cron externo, serviços pagos, SMS, emails transacionais ou Web Push com promessas falsas. Um motor de notificação confiável só depois com worker persistente/validação.
7. Estados no banco devem distinguir prescrição/schedule de relato/evento. Nunca deduzir adesão da notificação.

## Critérios de aceite verificáveis
- Responsável vê próximo medicamento e simula alarme em 10s.
- Após clicar Confirmar, aparece evento `given`, com autor e hora; não altera prescrição.
- O médico consulta registros e pode cadastrar agenda.
- Usuário de outro paciente recebe 403.
- Ao encerrar página, timers e recursos são limpos.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
