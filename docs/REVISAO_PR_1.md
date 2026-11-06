# Pendi — revisão e integração do PR #1

06/11/2026. PR do Bernardo: https://github.com/OmarFLK/hackaton_gamifica-o/pull/1.

## Problemas encontrados e corrigidos antes do merge

1. **Banco anterior incompatível:** `create_all` não acrescentava os três campos clínicos à tabela `patients` já existente. Adicionada atualização aditiva, idempotente, sem apagar registros. Antes de executar no banco local foi salvo backup em `.runtime/backups/before-pr1-20261106-141459.db`.
2. **Referências SQLite:** o engine agora habilita `PRAGMA foreign_keys=ON` em cada conexão. Incluído teste que rejeita vínculo com paciente/responsável inexistentes.
3. **Teclado no pássaro:** o handler global de Espaço interceptava os botões Pausar/Continuar/Terminar. Agora preserva controles nativos e só usa a tecla como ação do jogo fora deles.
4. **Câmera durante pausa:** o jogo da estrela mantinha a captura ativa ao pausar. Agora encerra os tracks na pausa e pode retomar depois.
5. **Limpeza de recursos:** microfone encerra stream/contexto também se a inicialização falhar; fechamento do AudioContext não gera rejeição não tratada. Timer do brilho da estrela é limpo na saída.
6. **Troca de paciente infantil:** limpa o perfil anterior enquanto valida o novo ID; uma rota sem vínculo não mantém dados da criança anterior na tela.
7. **Inicialização local:** troca de porta da API recompila o build nos dois sentidos, e o script detecta uma API/preview antigos em vez de informar sucesso indevido.

## Verificações executadas

| Camada | Comando/roteiro | Resultado |
|---|---|---|
| API | `python -m pytest -q -p no:cacheprovider` em `backend` | **85 passaram**; 75 existentes + 10 regressões da revisão |
| Frontend | `npm test` em `frontend` | **17 passaram** |
| Produção | `npm run build` | TypeScript/Vite e geração de cache público aprovados |
| Portais/jogos | `scripts/smoke_01_09.py`, Edge, build local | **19 verificações passaram** em 1440px e 375px |
| Integração extra | `scripts/smoke_review_integration.py`, Edge | **18 verificações passaram**, incluindo jogo em 375/768/1440px |
| Banco local | Auditoria SQLite após atualizar o arquivo antigo | 10 tabelas; zero violações de FK; pacientes anteriores preservados |
| Inicialização | `scripts/start-demo.ps1 -Build -NoBrowser` | API e frontend integrado respondendo |

O roteiro de portais cria paciente e vínculo, registra água/refeição/humor, escolhe mascote, joga vela/pássaro/estrela e verifica leitura pelo médico. Os dois 401 de console desse roteiro correspondem aos testes intencionais de senha inválida.

O roteiro extra cobre agenda e mensagens cruzadas entre médico/família, FAQ, teclado, encerramento dos sensores, permissão negada, API indisponível, ID fora do vínculo, tamanhos mobile/tablet/desktop e jogo offline com resumo não sincronizado. Nenhum erro JavaScript não tratado ocorreu nesse percurso.

Sensores foram exercitados com dispositivos sintéticos do Edge e instrumentação de tracks. Não equivale a validar hardware físico. Evidências estruturadas em `qa/pr1-review-results.json` e `qa/pr1-database-audit.json`; captura em `screenshots/jogo-integrado-mobile.png`.

## Estado do banco e pendências reais

- **Banco local funcional para o MVP:** usuários, delegações, pacientes, vínculos, humores, rotina, agenda, relatos, mensagens e sessões de jogo persistem em SQLite.
- **Neon/PostgreSQL remoto ainda não validado nesta execução.** A conexão deve ser configurada exclusivamente no backend. O PR informa um preview Vercel; isso não comprova backend nem banco remoto funcionando.
- A atualização existente é aditiva e específica da demo anterior. Antes de um piloto real, adotar migrações versionadas completas, estratégia de backup e governança de dados.
- Validar microfone/câmera/TTS e instalação PWA em aparelhos reais. Os caminhos sem permissão e por toque funcionam.
- A escolha do mascote continua uma preferência do dispositivo, identificada como tal; não há endpoint de avatar no contrato atual.
- O bundle principal tem cerca de 800 kB por incluir os gráficos. Build aprovado; separar chunks é uma melhoria futura, não um bloqueio para a demo local.
- Os PNGs de `mascotes_separados_png/`, adicionados localmente pelo usuário, foram preservados sem alteração; os sete mascotes deste PR são os SVGs originais da implementação.

## Testar na máquina

Interface: http://127.0.0.1:5174. Na tela de login, escolher Responsável, preencher a conta demo e entrar. No painel, usar **Entrar no mundo da criança**; estão disponíveis os três jogos, sentimentos e troca de companheiro. A criança usa a sessão do responsável, sem senha própria.

Código oficial em `frontend/` e `backend/`. `integration-kit/frontend/` permanece como referência histórica dos módulos complementares.
