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
