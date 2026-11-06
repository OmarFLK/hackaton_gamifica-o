# Pendi (SuperPed) — status real dos módulos

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
| 08 Área infantil | Home, 7 mascotes SVG originais × 7 expressões, check-in, chamar adulto, pausar, sair, conversa (módulo 12) | smoke completo |
| 09 Jogos | Vela, Pássaro, Estrela; toque sempre; microfone/câmera opcionais; sessão salva ou "Não sincronizado" | jogáveis por toque; sessões salvas |
| 10–18 | Entregues anteriormente (outro agente); agora ligados à fundação definitiva e ao frontend principal | 48 testes originais seguem passando |

## Verificação executada

- Backend: `pytest` → **85 passaram** (75 existentes + 10 regressões da revisão).
- Frontend: `npm test` → **17 passaram** (9 originais + 8 dos jogos); `npm run build` OK.
- Navegador (Edge, `scripts/smoke_01_09.py`): **19 verificações** em 1440px e 375px, no dev server e no build de produção.
- Revisão extra (Edge, `scripts/smoke_review_integration.py`): **18 verificações**, com teclado, sensores sintéticos, falha de API, modo offline e jogos em 375/768/1440px.
- Banco local atualizado a partir da demo antiga, preservando pacientes; 10 tabelas e zero violações de chave estrangeira.

## Não feito / pendente real

- Backend Render e banco Neon **não validados nesta execução**. Há preview Vercel informado no PR; integração pública de login/gravações ainda precisa ser conferida.
- Microfone e câmera testados com dispositivos sintéticos do Edge, incluindo fechamento dos tracks e permissão negada. Validar hardware físico antes da apresentação.
- Escolha de mascote persiste só no dispositivo (contrato não tem endpoint de avatar); a interface informa isso.
- Kiosk infantil sem responsável não foi implementado (opcional no contrato).
- Bundle JS de ~800 kB (Recharts): funciona, mas sem code-splitting.
- `integration-kit/frontend` foi mantido intacto como referência; o app oficial é `frontend/`.
