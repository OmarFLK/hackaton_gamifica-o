# PROMPT 04 — Autenticação com JWT e permissões

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 30 minutos. Objetivo: garantir que os perfis e os dados permaneçam separados no backend


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
- `backend/app/core/security.py`, `backend/app/core/dependencies.py`, `backend/app/routers/auth.py`, `frontend/src/app/AuthProvider.tsx`.
- Modelos de User são de propriedade do agente 05; se estiver indisponível, usar dependências/injeção sem modificar modelo, e documentar integração.

## Implementação obrigatória, em ordem
1. Implementar `POST /api/auth/login` (email/senha), `GET /api/auth/me`. Senhas seed com Argon2 via `pwdlib[argon2]`, validação segura, JWT HS256 via `pyjwt` com `JWT_SECRET` ambiente, expiração curta.
2. Dependências `get_current_user`, `require_role(...)` e `require_patient_access(patient_id, action)`. Vínculos são conferidos NO BACKEND usando `PatientGuardian` ou `Patient.clinician_id` e autorização delegada. Garantir 401 sem token e 403 sem permissão.
3. Configurar `AuthProvider` consumindo rotas reais, loading/estado de expiração, logout e persistência de sessão com cautela; demo acadêmica pode usar sessionStorage, nunca senha armazenada nem token hardcoded. Separar auth de criança: criança entra pela sessão do responsável.
4. Preparar `ProtectedRoute` exportado para que coordenador conecte; não editar router global.
5. O DEV só tem `/api/developer/status` e nunca acesso a `/api/patients`/mensagens; responsável não chama paciente de outro vínculo nem registra sobre ele.
6. Nunca implementar 'login com qualquer e-mail' em modo online. Contas demo só podem existir com seed fictícia e flag `DEMO_MODE`; bloquear esse seed fora de DEMO_MODE.
7. Testes 401/403/200 contra paciente autorizado e não autorizado.

## Critérios de aceite verificáveis
- Credenciais seed retornam token real e `GET /api/auth/me`.
- Senha não aparece em tabelas/logs.
- Usuário sem permissão não acessa paciente por ID manual.
- Médico não altera paciente fora de vínculo; dev não acessa patient data.
- `DEMO_MODE=false` não gera contas de demonstração.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
