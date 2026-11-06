# SuperPed — TODOS OS PROMPTS (4 HORAS)

Este arquivo reúne integralmente os prompts 00–18. Para usar com agentes separados, prefira os `.md` individuais e leia os contratos da pasta `docs/`.



---

<!-- INÍCIO: 00_COMECE_AQUI.md -->

# SUPERPED — KIT DE PROMPTS PARA HACKATHON DE 4 HORAS

**Objetivo:** entregar um MVP navegável com front React/Vite/Tailwind, FastAPI, Postgres Neon (SQLite local em contingência), hospedagem gratuita Vercel/Render, interface médico/responsável/criança/dev, login demo, dados falsos e jogos.

## Como operar (essencial)
1. No repositório Git, copie `docs/CONTRATO_MVP_4H.md` e `docs/ARQUITETURA_E_OWNERSHIP.md` da pasta `docs/` deste kit, mais `seed/` e `.env.example`. A IA central recebe `01_ORQUESTRADOR_4H.md`.
2. Primeiros 20–30 minutos: **01 orquestrador + 02 scaffold e contratos**. Congelar estrutura de pastas e o contrato antes de dividir trabalho.
3. Depois execute módulos em paralelo, em branches/worktrees separados ou em diretórios de responsabilidade distintos. **Não use vários agentes alterando a mesma working tree** sem isolamento. Preferência por 4 linhas de trabalho: backend/banco, UI/shell, portal adulto, infantil/jogos. A integração é responsabilidade do coordenador.
4. Copie os prompts individualmente para cada agente de código. Cada um deverá ler também o contrato. Se houver UMA IA apenas, use a **sequência ultrarrápida**: 01 → 02 → 04 → 05 → 03 → 06 → 07 → 08 → 09 → 14 → 16 → 17. Os demais são aperfeiçoamentos.
5. Com 40 minutos restantes: proibir novos recursos. Integrar, testar os quatro acessos, ensaiar demo e preparar fallback local.

## Sequência priorizada por camadas

| Prioridade | Prompt | Tempo-base | Entrega |
|---|---|---:|---|
| P0 | 01 | 5 min | Orquestração da equipe e plano executável |
| P0 | 02 | 20 min | Monorepo, contratos e run local |
| P0 | 03 | 20 min | Design system, landing e login |
| P0 | 04 | 30 min | Autenticação + permissões reais |
| P0 | 05 | 25 min | Banco e seed reproduzível |
| P0 | 06 | 35 min | Portal clínico + pacientes |
| P0 | 07 | 35 min | Portal familiar + dashboards |
| P0 | 08 | 30 min | Portal infantil, mascotes e emoções |
| P0 | 09 | 35 min | 3 minijogos (fallback toque) |
| P0 | 10 | 25 min | Agenda de medicamentos + demonstração de lembrete |
| P1 | 11 | 20 min | Mensagens e FAQ seguro, sem LLM paga |
| P1 | 12 | 20 min | Voz original + PWA responsiva |
| P1 | 13 | 15 min | Dashboard dev sintético |
| P0 | 14 | 30 min | Contrato front ↔ back e fechamento da integração |
| P0 | 15 | 20 min | Testes smoke e permissões |
| P0 | 16 | 25 min | Deploy Vercel + Render + Neon, contingência |
| P0 | 17 | 15 min | Pitch e roteiro da demonstração |
| AUX | 18 | 10 min | Plano B sem serviços remotos |

> Tempos são **orçamentos por tarefa**, não uma soma sequencial. Execução em paralelo ou cortes de escopo são obrigatórios para caber em 4 horas.

## Quais telas têm de existir na demo
1. Landing com três caminhos, login médico e responsável, acesso infantil assistido e login desenvolvedor.
2. Médico: dashboard, lista de pacientes, ficha, cadastro de paciente/responsável, medicações e chat.
3. Família: dashboard, humores, água/refeições informados, medicações com confirmação, mensagens, FAQ.
4. Criança: escolher entre 7 companheiros, informar emoção por rostinhos, vela, pássaro, estrela, voz com respostas seguras.
5. Dev: saúde do serviço e contadores sintéticos, sem prontuário.

## O que NÃO cabe no hackathon
- IA realmente treinada em dados hospitalares; voz de personagens famosos; reconhecimento de pose clínico; alertas garantidos com app fechado; push real confiável em todas plataformas; ML e RAG; integração com hospital; prontuário real; emissão de convites por e-mail; pagamentos; app na App Store/Play Store; permissões hospitalares reais ou conformidade clínica completa.
- Apenas apresentar fluxo demonstrativo transparente. Mostrar dados falsos e `DEMONSTRAÇÃO` sempre.

## Materiais de referência já criados
- `../PLANO_MESTRE_SUPERPED.md` é visão de longo prazo, **não transformar tudo em requisito P0**.
- `../IDENTIDADE_VISUAL_E_UX_UI.md` e `../design-tokens.json` definem visual.
- Canva: manual `https://www.canva.com/d/qhEadXuVjCz0PNh`, portal clínico `https://www.canva.com/d/GdXiNy07riAWWpx`, família `https://www.canva.com/d/aEv5mPlyVjdZTbD`, infantil `https://www.canva.com/d/fJzcpra68rWeEit`.

## Credenciais exclusivamente DEMO (seed fictícia)
- `medico@superped.demo` / `Demo2026!`
- `responsavel@superped.demo` / `Demo2026!`
- `assistente@superped.demo` / `Demo2026!`
- `dev@superped.demo` / `Demo2026!`
**Proibido colocar essas credenciais em banco ou sistema com dados reais.** Em deploy público de demonstração, só contas e dados inteiramente fictícios, sem coleta de dados reais, com aviso ostensivo.

## Fontes dos limites gratuitos (consultadas 06/11/2026)
- [Render free](https://render.com/docs/free) — hiberna após 15 min, sem filesystem persistente, não apto à produção.
- [Neon free](https://neon.com/blog/neon-free-plan-1-gb-per-project) — 1 GB por projeto anunciado em out/2026.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby) — gratuito para uso pessoal/não comercial.


<!-- FIM: 00_COMECE_AQUI.md -->


---

<!-- INÍCIO: 01_ORQUESTRADOR_4H.md -->

# PROMPT 01 — Orquestrador e chefe de integração

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 5 minutos. Objetivo: conduzir vários agentes de IA, garantir arquitetura funcional e preservar tempo de testes


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
- Você é o **coordenador**. É dono de `README.md`, `docs/STATUS_4H.md`, `frontend/src/app/router.tsx`, `backend/app/main.py` para integração (depois do scaffold).
- Não implemente por conta própria grandes funcionalidades que os demais agentes estão construindo.

## Implementação obrigatória, em ordem
1. Ler `docs/CONTRATO_MVP_4H.md`, `docs/ARQUITETURA_E_OWNERSHIP.md` e identidade visual antes de delegar.
2. Fixar stack: React+TS+Vite+Tailwind, FastAPI, SQLAlchemy, PostgreSQL Neon e SQLite local fallback; PWA sem app nativo no hackathon.
3. Criar quadro de execução com tarefas P0 e dono: scaffold(02), visual/login(03), auth(04), DB(05), médico(06), família(07), infantil(08), games(09), medicamentos(10), chat(11), PWA/voz(12), dev(13), integração(14), testes(15), deploy(16), pitch(17).
4. Executar scaffold primeiro; distribuir prompts após congelar arquivos compartilhados. Se IAs trabalham em paralelo, usar git worktrees/branches independentes ou agentes com arquivos exclusivos; não sobrescrever trabalho alheio.
5. A cada 30 minutos verificar: `npm run build`, `/api/health`, login, navegação. Cortar escopo não essencial imediatamente se bloquear P0.
6. **Marcos**: até minuto 30 front + backend iniciam e login abre; até 120 min portais + jogos com dados; até 180 min chamadas reais CRUD; até 210 min deploy ou fallback; últimos 30 min exclusivamente smoke/pitch.
7. Quando faltarem 40 min, declarar FEATURE FREEZE. Não iniciar novos módulos; resolver só erros críticos.
8. Manter painel de status: funcional, demo local, fora do escopo, pendente, link e comando. Não inventar que está implementado.

## Critérios de aceite verificáveis
- Existe `docs/STATUS_4H.md` com P0 e responsáveis.
- Há um comando de inicialização local para front e back e um contrato único.
- Roteamento, menus e imports finais funcionam sem conflitos entre agentes.
- Pelo menos um fluxo end-to-end funcional por perfil.
- Cada tarefa tem fallback claro se 20 min atrasada.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 01_ORQUESTRADOR_4H.md -->


---

<!-- INÍCIO: 02_SCAFFOLD_CONTRATOS.md -->

# PROMPT 02 — Scaffold do monorepo e contratos

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: criar fundação executável rapidamente antes de abrir trabalho em paralelo


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
- Crie `frontend/` inteiro a partir de Vite+React+TS, `backend/` pacote mínimo, configs raiz, `frontend/src/lib/{api.ts,types.ts,demo.ts}`, `frontend/src/app/{App.tsx,router.tsx}`, `backend/app/main.py` inicial, `.env.example`, `.gitignore`, README de comandos.
- Só altere `backend/app/core/config.py` se necessário. Não implementar telas finais; serão responsabilidade dos agentes.

## Implementação obrigatória, em ordem
1. Detectar versões instaladas (`node -v`, `python -V`), usar Node LTS e Python local; criar `frontend` com `npm create vite@latest ... -- --template react-ts` ou equivalente estável.
2. Instalar mínimo: `react-router-dom`, `lucide-react`, `recharts`, `tailwindcss` e plugin Vite Tailwind compatível com versão, sem excesso de dependências.
3. Criar `backend/requirements.txt`: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `psycopg[binary]`, `pyjwt`, `pwdlib[argon2]`, `python-dotenv`, `pydantic`, `pytest`, `httpx` (ver compatibilidades). `backend/app/main.py`: FastAPI com `GET /api/health`, CORS com env, espaço para `include_router` dos agentes. API doc em `/docs`.
4. Configurar `frontend/src/lib/api.ts` com cliente fetch que lê `VITE_API_URL`, injeta token via getter e transforma erros, sem base mock silencioso. Tipos de todos os objetos segundo contrato.
5. Criar `frontend/src/lib/demo.ts` com `isDemo`, rótulo `DEMONSTRAÇÃO` e fixtures de estrutura (poderão ser estendidas pelo agente do portal).
6. Criar páginas placeholder compiláveis e roteador básico; será substituído pelo agente 14. Fazer build e API health antes de delegar.
7. Enviar aos agentes lista explícita de exports/nomes. Não introduzir Docker, Turbo, Nx, next.js, Storybook ou testes e2e pesados.

## Critérios de aceite verificáveis
- `cd frontend && npm install && npm run dev` abre tela sem crash.
- `cd frontend && npm run build` conclui.
- `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload` entrega `/api/health` 200.
- `frontend/src/lib/types.ts` implementa os tipos e rotas do contrato sem inventar campos.
- `.env` privado ignorado pelo Git.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 02_SCAFFOLD_CONTRATOS.md -->


---

<!-- INÍCIO: 03_UI_ESTILO_LOGIN.md -->

# PROMPT 03 — Identidade visual, landing e telas de login

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: transformar os protótipos Canva numa interface funcional e responsiva


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
- `frontend/src/styles/**`, `frontend/src/components/ui/**`, `frontend/src/components/layouts/**`, `frontend/src/pages/public/**`.
- Exportar `LandingPage`, `LoginPage`, `AdultLayout`, `ChildLayout`, `DemoBadge`; não alterar `router.tsx` nem cliente API.

## Implementação obrigatória, em ordem
1. Aplicar tokens exatos em CSS/Tailwind: azul #203774, azul noite #132653, vinho #941C2F, branco, preto, cinza-gelo. Fontes Montserrat/Open Sans/Nunito com fallback sem depender de CDN se indisponível.
2. Reproduzir direção de interface do Canva: [manual](https://www.canva.com/d/qhEadXuVjCz0PNh), [portal médico](https://www.canva.com/d/GdXiNy07riAWWpx), [família](https://www.canva.com/d/aEv5mPlyVjdZTbD), [infantil](https://www.canva.com/d/fJzcpra68rWeEit). Não tentar conectar à API do Canva nem copiar logotipos não fornecidos.
3. Landing com SuperPed, texto curto de proposta e cards de entrada: Sou profissional, Sou responsável, Espaço infantil, Desenvolvedor. Aviso acadêmico DEMONSTRAÇÃO sempre visível.
4. `LoginPage`: escolha perfil (profissional, responsável, dev), form e-mail/senha, mostrar/ocultar senha, erros reais, loading, acessibilidade. Botões de preenchimento rápido com contas fictícias somente em `VITE_DEMO_MODE=true` e sempre identificados como demo.
5. Layout médico: sidebar azul-noite desktop e drawer mobile; layout família cards menos densos; layout infantil com tipografia Nunito, botão pausar e chamar adulto.
6. Criar UI primitives Button, Input, Card, Modal, EmptyState, Loading, ErrorState, Badge; não usar dependências de UI complexas que atrasem.
7. Testar em 375px e 1440px, tab e contraste mínimo; não ocultar funcionalidades por overflow.

## Critérios de aceite verificáveis
- Quatro cartões de entrada e formulário funcional conectado via props/callbacks ao AuthProvider.
- Sidebar e mobile menu sem sobreposição/scroll horizontal.
- Tokens e fontes visíveis e acessíveis; `npm run build` passa.
- Componente de aviso DEMONSTRAÇÃO está em todas as áreas autenticadas.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 03_UI_ESTILO_LOGIN.md -->


---

<!-- INÍCIO: 04_AUTH_RBAC.md -->

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


<!-- FIM: 04_AUTH_RBAC.md -->


---

<!-- INÍCIO: 05_BANCO_NEON_SQLITE_SEED.md -->

# PROMPT 05 — Modelo de dados, Neon e seed local

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 25 minutos. Objetivo: tornar o CRUD reprodutível sem serviços pagos ou dependência de nuvem


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
- `backend/app/models/**`, `backend/app/core/database.py`, `backend/app/seed.py`, `backend/tests/test_seed.py`.
- Não editar `app/main.py` nem routers de colegas. Modelos devem refletir contrato exatamente.

## Implementação obrigatória, em ordem
1. Usar SQLAlchemy 2.0 com models tipados e engine obtido de `DATABASE_URL`. Se não definido, usar `sqlite:///./superped_demo.db` (connect_args check_same_thread=False somente SQLite). Neon com `postgresql+psycopg://...?...` e TLS, segredo via env; não abrir connection pool enorme.
2. Criar entidades `User`, `Patient`, `PatientGuardian`, `MoodEntry`, `RoutineEntry`, `MedicationSchedule`, `MedicationEvent`, `Message`, `GameSession`; índices para patient_id, guardian_id e created_at. `times_json` mapeado para JSON compatível PostgreSQL/SQLite.
3. Criar Pydantic schemas de leitura/escrita consistentes; não serializar password_hash, notas clínicas para responsáveis nem histórico completo para developer.
4. Implementar seed idempotente (`python -m app.seed`), lê `seed/usuarios_demo.json` ou estrutura equivalente; apenas se `DEMO_MODE=true`; quatro contas fictícias com hash de senha, 3 pacientes, vínculos, registros de humor, água/refeição e medicações fictícias. Gerar datas relativas ao dia atual se quiser, mas os horários são locais de demonstração.
5. Inicializar tabelas com `Base.metadata.create_all` somente no MVP. Deixar observação: usar Alembic antes de qualquer piloto real. NÃO inserir dados do usuário ou arquivos médicos reais.
6. Verificar tanto SQLite local quanto Neon se DATABASE_URL disponível; seed não duplica ao rodar 2x. Incluir script simples reset_db apenas local sob flag.
7. Documentar variável DATABASE_URL para Render, sem colocar secrets em commit.

## Critérios de aceite verificáveis
- Seed local cria 4 perfis e 3 pacientes, sem duplicação.
- `python -m app.seed` executa sem erro no SQLite.
- `SELECT` e relacionamentos funcionam via sessão DB.
- Se Neon configurado, usa Neon sem mudar código.
- Nenhuma senha em plaintext persistida, apenas hash.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 05_BANCO_NEON_SQLITE_SEED.md -->


---

<!-- INÍCIO: 06_PORTAL_MEDICO.md -->

# PROMPT 06 — Portal médico e cadastros

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 35 minutos. Objetivo: implementar acompanhamento profissional com ações reais e dados demonstrativos


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
- `frontend/src/pages/doctor/**` e `backend/app/routers/patients.py`; exportar `DoctorDashboard`, `PatientsPage`, `PatientDetailPage`, `PatientCreatePage` e `router` FastAPI.
- Não mexer em modelos, classes do layout compartilhado nem router global.

## Implementação obrigatória, em ordem
1. Dashboard: cards pacientes vinculados, registros recentes, medicações programadas e atividade recente, todos com nota 'indicadores de rotina, não evolução clínica'; usar Recharts com dados reais de API ou seed. Loading e vazio.
2. Lista de pacientes: pesquisa, cartões responsivos ou tabela, ação 'Abrir ficha', botão cadastrar e fluxo de autorização.
3. Ficha: nome, avatar, DOB/idade, vínculo família, registros de humor, água/refeições e medicações; ocultar detalhes clínicos à família na API.
4. Novo paciente: formulário em etapas rápido com dados fictícios, escolha de tema, médico responsável, convite de familiar selecionando responsável demo existente; etapa de vínculo por `/api/patients/{id}/guardians`. Em demo não enviar e-mail real. Só médico/assistente delegada cria paciente; assistente sem campos clínicos.
5. API conforme contrato: `GET /api/patients`, `POST`, `GET /{id}`, `POST /{id}/guardians`, `GET /{id}/dashboard`. Filtrar queries por médico vinculado/família vinculada; nunca retornar pacientes de todos indiscriminadamente.
6. Criar painel de revisão clínica se houver tempo: campos `cancer_type_demo`, `clinical_stage_demo` só para médico (rotulados fictícios). Sem inferência ou alteração automática por jogo/IA.
7. Não construir toda a funcionalidade de prontuário nem sincronização hospitalar. Exportar o router sem alterá-lo no arquivo principal.

## Critérios de aceite verificáveis
- Login médico lista pelo menos 3 pacientes fictícios e abre ficha.
- Cadastro de paciente novo persiste na API/SQLite/Neon.
- Assistente não altera prescrição/diagnóstico.
- Família/DEV recebem 403 ao cadastrar paciente.
- Dashboard funciona em desktop e mobile.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 06_PORTAL_MEDICO.md -->


---

<!-- INÍCIO: 07_PORTAL_PAIS_DASHBOARDS.md -->

# PROMPT 07 — Portal família, registros e dashboards

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 35 minutos. Objetivo: dar aos responsáveis acompanhamento de rotina sem alegar monitoramento médico


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
- `frontend/src/pages/guardian/**`, `backend/app/routers/routines.py`, `backend/app/routers/mood.py`. Exportar páginas `GuardianDashboard`, `GuardianRoutinePage`, `GuardianMoodPage` e os dois routers FastAPI.

## Implementação obrigatória, em ordem
1. Página inicial: saudação e seletor apenas de pacientes vinculados, cards 'Como está hoje?', 'Próximo registro de medicamento', 'Água relatada', 'Alimentação registrada', botão 'Entrar no mundo da criança'.
2. Dashboard com Recharts de humores 7 dias (discretização informada), volume de água TOTAL relatado por dia e lista de refeições; dizer `Relatado pela família` e não `melhora do câncer`. Se não houver registro, mostrar 'Sem informação' e não zero inventado.
3. Formulários rápidos para água em ml e refeição por descrição, com carimbo data e autor. Possibilidade de edição futura não exigida.
4. Registros de humor podem ser informados na área da criança sob responsável autorizado; família pode criar relato também, cada um com `source` explícito.
5. APIs `/api/patients/{id}/routines` GET/POST e `/api/patients/{id}/moods` GET/POST. Validar score 1..7, quantity >=0, texto com limite, paciente vinculado e author do token (não confiar no ID do formulário).
6. Renderizar estados loading/vazio/erro e possível modo offline rotulado. Botões retornam feedback honesto de sucesso ou falha.
7. Linkar (sem reimplementar) componentes de medicamentos, chat, FAQ e jogos criados por outros agentes; fornecer placeholders de import para integração pelo orquestrador.

## Critérios de aceite verificáveis
- Responsável vê somente pacientes vinculados e muda entre eles.
- Cria água, refeição e humor e enxerga imediatamente o novo registro.
- Gráficos não confundem registros voluntários com progressão clínica.
- Não existe botão de alterar doses, estágio clínico ou cadastrar paciente.
- Mobile 375px funciona sem scroll horizontal.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 07_PORTAL_PAIS_DASHBOARDS.md -->


---

<!-- INÍCIO: 08_AREA_CRIANCA_MASCOTES_EMOCOES.md -->

# PROMPT 08 — Área infantil, sete mascotes e emoção

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 30 minutos. Objetivo: criar experiência acolhedora sem uso de marcas famosas ou acesso a dados clínicos


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
- `frontend/src/pages/child/**`; exportar `ChildHomePage`, `AvatarPickerPage`, `EmotionCheckinPage` e tema/AvatarProvider se necessário. Não mexer nos jogos em `features/games/`.

## Implementação obrigatória, em ordem
1. Tela inicial da criança (acesso derivado da sessão do responsável ou kiosk demo explícito) com nome fictício, mascote ativo, `Como estou hoje?`, `Minhas aventuras`, `Conversar` e botão fixo 'Chamar adulto' e 'Sair'. Sem qualquer diagnóstico, estágio, medicamento ou dado de prontuário.
2. Seletor visual dos 7 mascotes originais: Arco (céu/constelações), Guarda-Lua (luz), Faísca (energia), Pinta (jardim), Pipo (animal), Niva (neve, opção lenço), Pandi (panda neutro). Criar ilustrações simples originais com SVG/CSS ou emojis apropriados, não depender de imagens pagas; não usar Homem-Aranha/Batman/Elsa/Sonic/Ladybug/Mickey nem suas vozes.
3. Cada mascote define tokens infantis secundários (gradiente/cenário, iconografia, tom de fala) sem alterar tokens institucionais. Se seleção só persiste no navegador, rotular 'preferência guardada neste dispositivo'; backend persist opcional em interface contratada.
4. Check-in de sete estados ilustrados com a FACE do mascote escolhida: 7 radiante, 6 muito feliz, 5 feliz, 4 neutro, 3 não tão bem, 2 muito mal, 1 muito triste; textos neutros, sem 'errado', botão pular e 'quero chamar um adulto'. Salvar por `POST /api/patients/{id}/moods` com `source=CHILD` sob sessão adulta.
5. Acessibilidade: texto com apoio sonoro opcional, targets grandes, microinterações discretas, prefers-reduced-motion, sem contagem regressiva ou punições.
6. Na home, exibir cards que abrem jogos exportados pelo outro agente. Se jogo não estiver pronto, placeholder honesto 'Em preparação' e nunca botão inerte.

## Critérios de aceite verificáveis
- Área infantil não exibe dados de câncer, medicamentos ou prontuário.
- Todos os 7 mascotes têm representação e rosto emocional coerente.
- É possível entrar no mundo, selecionar mascote, registrar sentimento e voltar ao adulto.
- Tema pode ser alterado sem reconstruir layout.
- Teclado e toque funcionam.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 08_AREA_CRIANCA_MASCOTES_EMOCOES.md -->


---

<!-- INÍCIO: 09_TRES_MINIJOGOS.md -->

# PROMPT 09 — Minijogos vela, pássaro e estrela

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 35 minutos. Objetivo: três jogos simples controlados por toque e, quando possível, microfone/câmera


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
- `frontend/src/features/games/**`, `backend/app/routers/games.py`; exportar `CandleGame`, `BirdGame`, `StarGame` e router API.
- Não mexer em páginas infantis de outro agente; elas vão importar seus exports.

## Implementação obrigatória, em ordem
1. **Vela tranquila**: SVG/Canvas com vela animada. Botão 'Soprar' por toque faz chama diminuir suavemente até apagar; botão 'Usar microfone' opcional com `getUserMedia({audio:true})` e amplitude RMS simplificada da Web Audio API; a amplitude é só sinal interativo, não mensuração respiratória. Botão 'Pausar'/'Sair'.
2. **Pássaro das nuvens**: minijogo de desviar de obstáculos inspirado em mecânica genérica, arte original sem Flappy Bird; controle por toque/space para subir; microfone opcional controla a mesma ação por volume, calibragem simples, reiniciar. Limitar FPS e espaço de falha sem 'perdeu por doença'.
3. **Estrela ao alcance**: cenário SVG/Canvas com estrela que aparece em pontos da tela; toque/click captura. Modo câmera opcional: solicitar permissão e mostrar câmera com overlay, usuário toca na estrela; NÃO afirmar que IA detecta mão/objeto — detecção de pose/AR real fica para futura fase. No navegador sem câmera, fallback toque com 1 clique.
4. Todas as telas: pausa, sair, opção sem permissão, explicação de que são brincadeiras voluntárias, desativar sensores ao desmontar componentes, reduzir movimento se configurado.
5. `POST /api/patients/{id}/games`: `game`, `mode`, `duration_seconds` ao finalizar, somente sessão adulta vinculada. Se API offline, resumo de jogo em memória e etiqueta 'Não sincronizado'.
6. TTS opcional não obrigatório aqui; agente de voz cuida de `speechSynthesis`.
7. Sem instalação Phaser, Three.js, MediaPipe ou TensorFlow nesta entrega: usar React + CSS + Canvas API nativa para poupar tempo.

## Critérios de aceite verificáveis
- Cada jogo é jogável apenas tocando/clique, mesmo sem sensores.
- Microfone é opcional e encerrado ao sair; câmera opcional e não envolve falsa detecção de objeto.
- Nenhum jogo dá diagnóstico, terapia ou recomenda esforço.
- Sessão salva no backend ou fica claramente em modo offline.
- Build TS passa.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 09_TRES_MINIJOGOS.md -->


---

<!-- INÍCIO: 10_MEDICAMENTOS_LEMBRETES.md -->

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


<!-- FIM: 10_MEDICAMENTOS_LEMBRETES.md -->


---

<!-- INÍCIO: 11_MENSAGENS_FAQ.md -->

# PROMPT 11 — Chat familiar-clínico e FAQ seguro

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: entregar comunicação básica real e uma simulação honesta de assistente sem custo


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
- `frontend/src/features/messages/**`, `frontend/src/features/assistant/**`, `backend/app/routers/messages.py`, `backend/app/routers/assistant.py`. Exportar `MessageCenter`, `InformationalAssistant` e routers.

## Implementação obrigatória, em ordem
1. Chat paciente ↔ responsável ↔ equipe: lista por `patient_id`, POST da mensagem, API protegida por vínculo, autor sempre derivado do JWT, renderizar datas e origem. Atualização por refresh manual ou polling leve de 15–30s só quando tela ativa; evitar WebSocket para poupar tempo.
2. Mostrar banner 'Este chat não é canal de emergência'. Sem garantir tempo de resposta e sem comunicação a paciente real.
3. Assistente com regras/FAQ **estático** em Python gratuito, respostas curadas: acesso, agendamento, registro de água, como usar jogos, privacidade, diferença entre alerta e administração confirmada. Afirmar no app 'FAQ automatizado de demonstração', NÃO 'IA treinada com dados hospitalares'.
4. Detectar palavras associadas a doses, alteração de remédio, sintomas graves, emergência ou prognóstico e devolver encaminhamento à equipe/serviços de urgência, SEM diagnóstico ou instrução clínica individual. Evitar falsas respostas 'é seguro'.
5. Resposta com `answer`, `source='FAQ SuperPed — demonstração'`, `escalate`, `is_demo:true`. Sem chamadas para APIs pagas; sem inventar fontes médicas ou hospitalares.
6. Layout adequado a família e médico, com empty state e loading.
7. Se falta tempo, chat CRUD real tem prioridade; FAQ pode ser 8 perguntas/respostas determinísticas.

## Critérios de aceite verificáveis
- Responsável manda texto, médico vinculado lê e responde.
- Mensagens de outro paciente estão inacessíveis.
- FAQ responde dúvidas gerais e recusa/encaminha dúvidas clínicas pessoais.
- UI não apresenta FAQ como IA hospitalar validada.
- Nenhum custo externo ou dependência de API Key.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 11_MENSAGENS_FAQ.md -->


---

<!-- INÍCIO: 12_MOBILE_PWA_VOZ.md -->

# PROMPT 12 — PWA responsivo e companheiro por voz

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: permitir instalação web e voz infantil original sem mensalidade


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
- `frontend/src/features/child-voice/**`, `frontend/public/manifest.webmanifest`, `frontend/public/icons/**`, `frontend/src/components/common/**` (somente componentes próprios). Não editar router ou telas infantis dos colegas.

## Implementação obrigatória, em ordem
1. Criar `MascotVoice` com `window.speechSynthesis` e lista curta de falas originais: boas-vindas, incentivo sem cobrança, como pausar, pedir ajuda a um adulto; voz genérica do navegador, sem nome/imitacão de ator/personagem. Texto escrito sempre junto; botão reproduzir/parar áudio. Se speechSynthesis não suportado, texto disponível.
2. Entrada por voz usando `SpeechRecognition`/`webkitSpeechRecognition` **somente se suportada** e após consentimento explícito. Fallback em botões de perguntas pré-definidas: 'Pode brincar comigo?', 'Quero descansar', 'Quero falar com adulto'. Responder com textos determinísticos; nunca permitir conversa livre irrestrita com criança nem enviar gravação ao servidor.
3. Criar `manifest.webmanifest` com título SuperPed, theme_color #203774, display standalone, start_url `/`, ícones locais SVG/PNG originais. Instruir que instalação PWA depende do browser/HTTPS. Se implementar service worker, cache SOMENTE estáticos públicos, não cachear prontuários/respostas autenticadas.
4. Testar responsividade mobile (375px), tablet (768px) e desktop (1440px), alvos de 48px, teclado/foco, preferências de movimento. Não construir React Native/Capacitor nesta janela; PWA basta.
5. Garantir que áudio e câmera parem ao trocar de tela e permitir revogar permissões.
6. Documento curto de comportamento offline: se API indisponível, tela informa 'Modo de demonstração local' sem afirmar sincronização.

## Critérios de aceite verificáveis
- Texto + TTS funcionam em browser compatível; sem suporte há fallback.
- PWA tem manifest válido e ícones locais, sem asset pago.
- Fala não dá instruções clínicas, não usa vozes licenciadas.
- Browser sem SpeechRecognition continua totalmente utilizável.
- Mobile não apresenta elementos inacessíveis.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 12_MOBILE_PWA_VOZ.md -->


---

<!-- INÍCIO: 13_AREA_DEV_STATUS.md -->

# PROMPT 13 — Painel desenvolvedor e status

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 15 minutos. Objetivo: criar quarta área sem acesso aos dados médicos


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
- `frontend/src/pages/developer/**`, `backend/app/routers/developer.py`. Exportar `DeveloperDashboard` e router.

## Implementação obrigatória, em ordem
1. Tela `/dev`: visual institucional, 'Ambiente demonstrativo', saúde da API, módulos disponíveis, versão, última checagem, botões abrir docs API (somente dev), status de DB se servidor o fornecer sem revelar endereço/segredos.
2. Endpoint `/api/developer/status`: autorizar somente DEVELOPER, devolver status sintético `{api, demo, modules}`; nunca incluir nome, email de paciente, comentários, mensagens, estágio, prescrição ou conexão secreta.
3. Apresentar logs de demonstração totalmente fictícios, se desejar, devidamente rotulados.
4. Nada de painel de SQL, execução arbitrária, tela de credenciais, impersonar médico ou usar permissões bypass.
5. Se não der tempo, entregar status simples 1 tela + endpoint seguro.

## Critérios de aceite verificáveis
- Dev loga e vê API 'ok' ou 'offline'.
- Dev recebe 403 para recursos de pacientes.
- Nenhuma URL com segredo ou dado clínico é exibida.
- Dashboard responsivo e coerente com branding.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 13_AREA_DEV_STATUS.md -->


---

<!-- INÍCIO: 14_INTEGRACAO_FRONT_BACK.md -->

# PROMPT 14 — Integração de módulos e API ponta a ponta

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 30 minutos. Objetivo: transformar páginas e routers isolados em um único app funcional


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
- ÚNICO agente autorizado a editar `frontend/src/app/{router.tsx,App.tsx}`, `frontend/src/lib/api.ts` e `backend/app/main.py` depois do scaffold. Pode fazer pequenos ajustes em imports/exports nos módulos COM ciência dos responsáveis.

## Implementação obrigatória, em ordem
1. Importar e registrar routers FastAPI com `include_router` e prefixes de contrato; confirmar no `/docs` e evitar duplicação `/api/api`.
2. Montar rotas React: `/`, `/login`, `/medico`, `/medico/pacientes`, `/medico/pacientes/:patientId`, `/familia`, `/crianca/:patientId`, `/dev`; usar `ProtectedRoute` e `AuthProvider`.
3. Fazer navegador consumir endpoints reais com token. Estados `loading/empty/error`. `VITE_API_URL` único, sem strings localhost hardcoded nos componentes.
4. Garantir que frontend e API usem mesma identidade de paciente/roles/campos; corrigir incompatibilidades de tipo, timezone e nomes (`times_json`, `score`, etc.).
5. Integração de componentes: médico ficha/medicamentos/mensagens; família dashboards/medicamentos/mensagens/FAQ; criança mascotes/emoção/3 games/voz; dev status.
6. Implementar fallback demo **explícito** se API falhar, preferencialmente usado só para pitch offline; emite aviso visual 'Modo offline — alterações não sincronizadas'. Não capturar erros e fingir que salvou.
7. Executar fluxo e2e manual: login médico -> criar paciente -> vincular responsável -> login responsável -> ver novo paciente -> registrar água -> criar evento de medicação -> abrir criança -> mood e jogo -> voltar médico -> ver registros.
8. Rodar `npm run build` e `pytest`; corrigir críticos antes de polir perfumaria. Anotar riscos de cold start Render e segredos Neon.

## Critérios de aceite verificáveis
- Todos os menus navegam e não há botões-chave sem ação.
- Médico e responsável compartilham os mesmos registros persistidos no banco.
- Auth backend bloqueia acesso por URL alterada.
- Build frontend e inicialização backend funcionam.
- Falha de API não gera sucesso falso.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 14_INTEGRACAO_FRONT_BACK.md -->


---

<!-- INÍCIO: 15_TESTES_ACEITE.md -->

# PROMPT 15 — Smoke tests e controle de acesso

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: não apresentar ao júri app quebrado ou sem autenticação segura


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
- `backend/tests/**`, `frontend/src/**/*.test.*` se disponíveis, `docs/TESTES_SMOKE_4H.md`.
- Evitar refatorar módulos de outros agentes; registrar defeitos com prioridade e pedir correção ao dono.

## Implementação obrigatória, em ordem
1. Testar 4 logins (médico, responsável, assistente, developer), login inválido 401, URL protegida, logout.
2. Testar IDOR: responsável A não vê paciente não vinculado; médico sem vínculo 403; dev não pode consultar pacientes, chat e meds; assistente não altera prescrição.
3. Verificar backend GET health, listar pacientes, criar paciente e vínculo, registrar mood 1..7, água, refeição, evento medicação, chat, FAQ, games.
4. Testar UX em 375, 768, 1440px; sem scroll horizontal; checar usabilidade por teclado e botões sair/pausar dos 3 jogos.
5. Validar que telas públicas exibem DEMONSTRAÇÃO, que medicamentos não prescrevem, que assistente se identifica como FAQ e que dados são fictícios.
6. Quando render estiver dormindo, simular splash de carregamento e fallback claro. Desconectar internet e verificar modo contingência rotulado.
7. Criar tabela PASSOU/FALHOU/NÃO TESTADO com passos, hora e severidade. Não escrever PASSOU sem executar. Gerar casos rápidos automatizados `pytest` quando possível.

## Critérios de aceite verificáveis
- `docs/TESTES_SMOKE_4H.md` lista resultados reais.
- Nenhum acesso cruzado identificado.
- `npm run build` final sem erro.
- Demo end-to-end concluída pelo menos uma vez.
- Defeitos P0 remanescentes são declarados honestamente.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 15_TESTES_ACEITE.md -->


---

<!-- INÍCIO: 16_DEPLOY_GRATUITO.md -->

# PROMPT 16 — Deploy gratuito: Vercel + Render + Neon

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 25 minutos. Objetivo: publicar uma demo funcional sem serviços pagos e preparar fallback local


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
- `README.md`, `docs/DEPLOY_GRATUITO.md`, `render.yaml` (opcional), `frontend/vercel.json`, arquivos env de exemplo. Não alterar dados/autenticação sem coordenação.

## Implementação obrigatória, em ordem
1. **Neon**: criar projeto Free na conta existente; copiar URL de conexão PostgreSQL com SSL para Render `DATABASE_URL` (se a pessoa já tiver conexão, reutilizar). Migrar seed DEMO 100% fictícia no ambiente de demo. Nunca passar credenciais em client, commit, README ou print.
2. **Render**: Web Service Free ligado ao repo, root `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; vars `DATABASE_URL`, `JWT_SECRET`, `DEMO_MODE=true`, `FRONTEND_URL`. Configurar `startup`/seed manual via build/start somente se idempotente e não duplicar. Testar `/api/health`.
3. **Vercel**: importar frontend Vite (root `frontend`), build `npm run build`, output `dist`, `VITE_API_URL=https://...onrender.com`, `VITE_DEMO_MODE=true`. Adicionar rewrite SPA para index.html em `/medico` e outras rotas. Conferir CORS da API apontando para URL real de Vercel.
4. Render Free hiberna após 15min, demora ~1min ao acordar; filesystem efêmero: NUNCA usar SQLite no Render para dados persistentes. Neon é DB na versão publicada. Neon Free tem limites e pode pausar; documentar comportamento.
5. Vercel Hobby é pessoal/não comercial; demo acadêmica pessoal apenas. Não usar produção hospitalar nem contas de pacientes reais.
6. Testar URL pública com login médico e família, registro de humor/medicação, voltar a página e verificar persistência.
7. Se deploy falhar, apresentar local usando `npm run dev -- --host 0.0.0.0` e `uvicorn...`; nunca desperdiçar os 20 minutos finais tentando corrigir DNS/config não essencial.
8. Documentar URLs reais APÓS confirmação, status e variáveis requeridas sem os valores secretos.

## Critérios de aceite verificáveis
- Se online: URLs reais de frontend/API funcionando, Neon persistindo registro após refresh.
- Se offline: comandos locais comprovados, com badge 'Demo local'.
- Nenhum segredo visível na tela, logs públicos ou versionado.
- `frontend/vercel.json` evita 404 em refresh de rota SPA.
- Aviso sobre cold start Render ao apresentador.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 16_DEPLOY_GRATUITO.md -->


---

<!-- INÍCIO: 17_PITCH_ROTEIRO.md -->

# PROMPT 17 — Pitch, roteiro de apresentação e plano de backup

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 15 minutos. Objetivo: contar uma história de cuidado e provar MVP real em 3–5 minutos


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
- `docs/PITCH_3_MINUTOS.md`, `docs/ROTEIRO_DEMO.md` e `docs/PLAN_B_APRESENTACAO.md`; não editar código.

## Implementação obrigatória, em ordem
1. Fazer pitch de 3 minutos: (i) problema da adesão/acolhimento durante tratamentos longos, (ii) solução com personagens lúdicos e pais/médicos conectados, (iii) stack 100% gratuita e MVP, (iv) segurança e próximas fases.
2. Demo guiada de 2 minutos: login médico -> paciente fictícia Nina -> medicamento -> login responsável -> registro de água/confirmar medicação -> entrar como criança -> escolher Pandi -> rosto emocional -> jogar vela ou pássaro -> voz original -> dashboard clínico atualizado.
3. Mostrar claramente que jogos são atividades lúdicas voluntárias, não terapia médica validada; relatório de água/humor é relato, não evolução oncológica; notificação é simulada enquanto o app aberto; FAQ não é IA hospitalar.
4. Inserir divisão por disciplinas do hackathon: saúde valida abordagem clínica futura, tecnologia desenvolve produto, negócios apresenta distribuição B2B futuro, design mantém marca e acessibilidade. Sem alegar parceria formal aprovada além do briefing.
5. Criar lista de perguntas difíceis do júri: custo, segurança LGPD, acesso restrito, autenticidade dos alarmes, limitação do microfone/câmera, proteção das marcas, como ampliar.
6. Plano B: abas pré-abertas, dados seed, PDF/screenshot do produto, app local, alternar para toque se hardware negar permissão. Nunca fingir backend online se offline.
7. Evitar estatísticas inventadas de sobrevida/adesão; focar demonstrações concretas.

## Critérios de aceite verificáveis
- Há script que pode ser lido por apresentador em 3 minutos.
- Demonstração tem sequência testável com dados falsos.
- Plano B cobre Render dormindo/internet indisponível.
- Diferença demo versus produto clínico real é explícita.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 17_PITCH_ROTEIRO.md -->


---

<!-- INÍCIO: 18_PLANO_B_LOCAL.md -->

# PROMPT 18 — Fallback local offline sem dependências pagas

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 10 minutos. Objetivo: manter produto demonstrável se Neon, Render ou Wi-Fi falharem


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
- `docs/PLANO_B_OFFLINE.md`, `frontend/src/lib/demoOffline.ts` se necessário; mudanças no cliente/rotas somente acordadas com integrador.

## Implementação obrigatória, em ordem
1. Garantir que FastAPI+SQLite funcionem em localhost e seed idempotente. Se a rede falhar, rodar servidor local no notebook; usar front no localhost apontando para API local.
2. Criar fixtures locais dos dados da demo para UI read-only se backend local também cair. Rotular `Modo offline de apresentação — mudanças não sincronizadas`.
3. Adicionar botão ou env flag `VITE_DEMO_MODE=true` para painel de demo. Não transformar mudanças apenas locais em sucesso falso.
4. Pré-carregar mascotes SVG/CSS, jogos sem rede, tipografia fallback, FAQ estática, sem cachear dados autenticados reais.
5. Mock auth só em flag demo e com tela identificada, jamais sistema real. Não armazenar dados verdadeiros em localStorage.
6. Criar três cenários: internet OK (Vercel+Render+Neon), só local com API e SQLite, só front com fixtures. Documentar como alternar em menos de 30s.

## Critérios de aceite verificáveis
- Demonstração infantil funciona sem internet (toque sempre).
- Dados offline são marcados e não alegam sincronização.
- Retorno online usa APIs reais sem modificar lógica de UI.
- Guia com comandos simples para cada modo.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.


<!-- FIM: 18_PLANO_B_LOCAL.md -->
