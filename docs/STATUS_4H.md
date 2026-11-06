# Pendi — status real dos módulos 10–18

06/11/2026. Escopo do outro dev: interface geral e módulos 00–09. Sem agentes adicionais nesta execução.

| Item | Responsável | Estado verificável |
|---|---|---|
| 10 Medicamentos | Codex | API e telas conectadas; agenda, edição, relato, histórico e alarme demo testados |
| 11 Mensagens/FAQ | Codex | APIs e telas conectadas; troca médico/família e encaminhamento FAQ testados |
| 12 Mobile/PWA/voz | Codex | Componente com TTS/STT opcionais, botões determinísticos, manifest e cache público; mobile/offline testados, áudio físico não validado |
| 13 Status dev | Codex | Endpoint e dashboard testados; dev recebe 403 para pacientes |
| 14 Integração | Codex + outro dev | Módulos complementares integrados e executáveis; conexão com os módulos 00–09 aguarda GitHub |
| 15 Testes | Codex | Build + 48 testes API + 9 testes frontend + 18 verificações Edge passaram |
| 16 Deploy | Codex + contas do apresentador | Blueprint Render e guia preparados; não publicado |
| 17 Pitch | Codex | Roteiros preparados e limitados ao estado real; ensaio não executado |
| 18 Contingência | Codex | API SQLite local e frontend de leitura sem internet testados; escritas desabilitadas offline |

Não estão prontos nesta entrega: cadastro de pacientes, rotina/água, emoções, seletor dos sete mascotes, jogos e portais completos 00–09. A área de companhia com voz/botões usa Pandi como preview do módulo 12. Não apresentar o fluxo completo dos módulos 00–18 como concluído antes da integração.

## Retomada

Quando o outro dev enviar o código ao GitHub: inspecionar o diff remoto, integrar pelos adapters documentados, preservar o frontend dele, repetir build/smoke nos pontos alterados e validar o deploy real. A execução atual está isolada na branch `codex/modules-10-18`.
