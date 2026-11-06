# Pendi (SuperPed) — status real dos módulos

## Preferências e família

Adicionados controles globais de narrador/modo escuro, cadastro de responsável pelo médico, peso/altura, anotações da família e histórico com rolagem interna. 126 testes API, 17 frontend, build e fluxos desktop/mobile aprovados. [Detalhes e testes](PREFERENCIAS_E_FAMILIA.md).

## Publicação em nuvem — 06/11/2026

PR #2 revisado e integrado à main. Produção demonstrativa: https://hackatongamifica-o.vercel.app, API https://pendi-demo-api.onrender.com e PostgreSQL Neon `production` com 11 tabelas. Configuração e provas: [DEPLOY_GRATUITO.md](DEPLOY_GRATUITO.md). Passaram build da raiz, 21 verificações desktop/mobile na URL pública e 11 verificações de API com os três perfis RAG/Gemma. Antes da publicação passaram 120 testes backend e 17 frontend. As seções abaixo preservam resultados históricos; o estado atual e as limitações de voz/câmera estão no guia de deploy.

## Atualização de comunicação e IA

Implementados: central humana de conversas, avisos/sino/leitura por usuário, Pendi com Gemma 27B real da Mauá, três bases RAG isoladas e transcrição local com revisão antes do envio infantil. O navegador passou em 12 novas verificações com duas contas e captura sintética. Ver [PENDI_CHAT_RAG_VOZ.md](PENDI_CHAT_RAG_VOZ.md). Os resultados anteriores do PR #1 abaixo são históricos.

Validação atual: **115 testes API, 17 testes frontend, build de produção e 12 novas verificações no navegador aprovados**. Chamadas reais ao Gemma confirmadas para os três perfis; reconhecimento de voz validado com áudio sintético em português. Nenhuma chave foi incluída no código ou no build público.

Atualizado em 06/11/2026 após a revisão do PR #1. Este quadro só lista o que foi executado e verificado. Detalhes em [REVISAO_PR_1.md](REVISAO_PR_1.md).

| Item | Estado verificável | Evidência |
|---|---|---|
| 01 Orquestração | Quadro, scripts e documentação atualizados | este arquivo, `README.md`, `INTEGRATION_NOTES.md` |
| 02 Scaffold | `frontend/` principal (Vite+React+TS+Tailwind), tipos do contrato, cliente API, `demo.ts`, roteador | `npm run build` passa |
| 03 UI/login | Tokens, fontes empacotadas (sem CDN), landing com 4 entradas, login com perfis, primitives, layouts adulto/infantil | smoke 1440/375 sem scroll horizontal |
| 04 Auth/RBAC | JWT HS256, Argon2, `get_current_user`, `require_role`, `require_patient_access`, `AuthProvider`, `ProtectedRoute` | testes 401/403/200 e IDOR |
| 05 Banco/seed | 10 entidades SQLAlchemy, SQLite local / Neon por `DATABASE_URL`, seed idempotente | `python -m app.seed` 2x sem duplicar; `test_seed.py` |
| 06 Portal médico | Painel, lista com busca, ficha com abas, cadastro em 3 etapas, vínculo familiar, revisão clínica fictícia | cadastro persiste; família/dev 403 |
| 07 Portal família | Painel, seletor de criança vinculada, água/refeição, humor, gráficos 7 dias, links para medicamentos/mensagens/FAQ | registro aparece para o médico |
| 08 Área infantil | Home, Pandi com as ilustrações oficiais (7 humores) (Homem-Aranha, Mickey e Minnie só como "Em desenvolvimento", sem arte), check-in, chamar adulto, pausar, sair, conversa (módulo 12) | smoke completo |
| 09 Jogos | Vela, Pássaro, Estrela; toque sempre; microfone/câmera opcionais; sessão salva ou "Não sincronizado" | jogáveis por toque; sessões salvas |
| 10–18 | Entregues anteriormente (outro agente); agora ligados à fundação definitiva e ao frontend principal | 48 testes originais seguem passando |

## Verificação executada

- Backend: `pytest` → **120 passaram** (inclui isolamento do responsável e IA/notificações com provedor simulado).
- Frontend: `npm test` → **17 passaram** (9 originais + 8 dos jogos); `npm run build` OK.
- Navegador (Edge, `scripts/smoke_01_09.py`): **21 verificações** em 1440px e 375px.
- Revisão extra (Edge, `scripts/smoke_review_integration.py`): **18 verificações**, com teclado, sensores sintéticos, falha de API, modo offline e jogos em 375/768/1440px.
- Banco local atualizado a partir da demo antiga, preservando pacientes; zero violações de chave estrangeira.
- `scripts/smoke_communication_pendi.py` (IA real e ditado) **não executado nesta máquina**: exige chave da API Barô e modelo Whisper locais.

## Não feito / pendente real

- Atualização: backend Render, banco Neon e frontend Vercel foram publicados e validados em 06/11/2026; consultar o guia de deploy acima para URLs, testes e limites atuais.
- Microfone e câmera testados com dispositivos sintéticos do Edge, incluindo fechamento dos tracks e permissão negada. Validar hardware físico antes da apresentação.
- Personagens Homem-Aranha, Mickey e Minnie: somente o nome com aviso "Em desenvolvimento". Uso de arte, voz ou nome em produção exige licença dos detentores (Marvel/Disney) e contraria a regra original do briefing; decisão pendente da equipe.
- Kiosk infantil sem responsável não foi implementado (opcional no contrato).
- Bundle JS de ~800 kB (Recharts): funciona, mas sem code-splitting.
- `integration-kit/frontend` foi mantido intacto como referência; o app oficial é `frontend/`.
