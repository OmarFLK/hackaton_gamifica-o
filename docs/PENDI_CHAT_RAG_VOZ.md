# Pendi — mensagens, notificações, RAG e voz

Entrega de 06/11/2026. O assistente se chama **Pendi**, inclusive quando a criança escolhe outro mascote. A integração real usa **`google/gemma-3-27b`**, confirmado na listagem da API Barô da Mauá; o modelo do exemplo fornecido não foi usado como substituto.

## Onde encontrar

- Médico: **Mensagens**, **Notificações** e **Assistente IA** no menu. Conversas também continuam disponíveis na ficha do paciente.
- Responsável: as mesmas três entradas; selecione a criança na central de conversas.
- Criança: entre pela conta do responsável, abra o mundo da criança e **Conversar com o Pendi**.
- Local: http://127.0.0.1:5174. API: http://127.0.0.1:8000/docs.

## Conversa humana e avisos

O chat médico/família é independente da IA. Mensagens mostram nome e perfil do autor obtidos da sessão. Cada mensagem familiar gera notificação ao médico vinculado; mensagens médicas avisam responsáveis ativos vinculados. Há sino, contador, aviso na tela, lista persistente e leitura individual.

“Enviar um aviso” cria um aviso com título e texto para a outra parte vinculada. Abrir a conversa marca somente mensagens recebidas até o ID carregado; não marca avisos independentes. Revogar um vínculo remove o acesso às notificações daquele paciente.

Atualização a cada cinco segundos com a página visível. Notificações do navegador dependem de consentimento e usam texto genérico, sem conteúdo clínico ou nome de criança. Não há garantia de entrega com o aplicativo fechado. O chat não é canal de emergência.

## RAG simples, separado por perfil

Bases Markdown locais e versionadas em `backend/app/knowledge/`:

| Perfil | Base recuperada | Linguagem |
|---|---|---|
| Responsável | `guardian.md`: rotina, lembretes, comunicação, acolhimento e privacidade | Clara e acolhedora |
| Médico | `clinician.md`: vínculo, cadastro, registros, revisão fictícia e limites dos indicadores | Objetiva e voltada aos fluxos profissionais |
| Criança | `child.md`: histórias imaginárias, brincar, sentimentos, descanso e pedir ajuda | Frases curtas, lúdicas, sem cobrança |

Retrieval lexical BM25 seleciona até três trechos **depois de restringir a base ao perfil autorizado**. Não usa banco vetorial, embedding pago, prontuário ou mensagens como documentos. O contexto e a pergunta revisada são enviados à API hospedada pela Mauá; nenhum registro de paciente é anexado automaticamente.

O perfil adulto é decidido pelo usuário autenticado, sem aceitar `audience` do navegador. A rota infantil exige sessão GUARDIAN e vínculo com `patient_id`. As respostas adultas exibem “Base consultada pelo Pendi”, com os títulos recuperados. A base explica o produto; não contém protocolos hospitalares validados.

## Fala → texto → revisão → envio

1. O responsável autoriza o microfone na tela infantil.
2. A criança toca em **Falar com o Pendi**, fala por até 30 segundos e toca em **Parar e transcrever**.
3. A gravação é processada em memória pelo backend Pendi com Faster Whisper, modelo base CPU/int8 instalado localmente.
4. O texto aparece na caixa, editável. **Não é enviado automaticamente ao Gemma.**
5. A criança revisa com o adulto e toca em **Enviar para o Pendi**.

Não salvamos gravações no banco nem encaminhamos áudio à Mauá. Cancelar, sair, esconder a aba ou pausar encerra a captura; gravação sem envio é descartada. A síntese opcional “Ouvir” usa voz genérica do navegador.

Se não houver modelo local preparado, o componente oferece reconhecimento do próprio navegador quando disponível, informando que o fornecedor pode processar áudio. Digitação permanece como alternativa. Microfone em celular exige contexto seguro/HTTPS ou localhost; permissões e ruído afetam o reconhecimento. Revisão existe para corrigir palavras, não há promessa de acerto perfeito.

## Configuração sem expor a chave

`backend/.env` contém a chave local. O arquivo é ignorado pelo Git e, nesta máquina Windows, teve acesso restringido à conta atual e SYSTEM. A chave não foi incluída no frontend, prompts do modelo, logs de aplicação ou artefatos públicos.

Variáveis apenas no backend: `BARO_API_KEY`, `AI_API_URL`, `AI_API_MODEL`, `AI_ALLOWED_HOSTS`. O padrão de host permitido é `ia.maua.br`; redirecionamentos HTTP do provedor não são seguidos. Para configurar em outro ambiente, usar entrada oculta:

```powershell
.venv/Scripts/python scripts/configure_baro.py
```

Para preparar voz em outra máquina:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-demo.ps1 -WithSpeech
```

O modelo público de reconhecimento é baixado para `.runtime/models/`, fora do Git. Em hospedagem, configurar a chave pelo gerenciador de segredos do backend, instalar as dependências de voz e preparar o modelo, se desejar transcrição no servidor. **A configuração local não publica a chave nem configura Render/Vercel automaticamente.**

## Proteções implementadas e limites

- JWT, perfil e vínculo verificados no servidor; dev/assistente não acessam estes chats/IA.
- Chave enviada somente pelo backend no cabeçalho de autenticação TLS; não entra no prompt. Campos extras e histórico com papel `system` são rejeitados.
- Corpus separado antes da busca, remoção de segredos conhecidos e padrões de token em texto, limite de histórico e respostas de erro sem detalhes do provedor.
- Limites por usuário, duas chamadas simultâneas ao modelo, uma transcrição CPU por vez, áudio limitado em bytes/duração e requisições JSON limitadas.
- Respostas autenticadas com `Cache-Control: no-store`; worker continua cacheando apenas arquivos públicos.
- Perguntas clínicas individuais e tentativas comuns de extração são encaminhadas sem consultar o modelo. O fluxo infantil trata conteúdo inadequado e risco convidando um adulto.

Essas proteções reduzem riscos; não constituem garantia absoluta contra toda tentativa de prompt injection nem validação clínica. O ambiente permanece uma demonstração com contas e dados fictícios. Qualquer uso real requer autenticação/contas próprias, governança e avaliação especializada.

## Verificação executada

- Chamadas reais ao Gemma 27B para os três perfis, com respostas e citações da base correspondente.
- Transcrição real da frase sintética em português “Olá Pendi. Eu quero brincar com uma estrela.”, reconhecida corretamente.
- Navegador Edge: 12 verificações de comunicação, notificações entre duas sessões, tamanhos 375/768/1440px, RAG, captura sintética via MediaRecorder e texto revisável antes do envio. Sem erro JavaScript não tratado ou chamada direta do navegador à Mauá.
- **115 testes API passaram**, incluindo os 85 anteriores e 30 casos de comunicação, RAG, voz e proteção. O arquivo novo é `backend/tests/test_communication_ai.py`.
- Build TypeScript/Vite e 17 testes frontend aprovados. Relatório numérico atualizado em `STATUS_4H.md`.
- `scripts/check_secrets.py` confere fonte versionada e build público sem imprimir credenciais.

Evidências sem chaves: `docs/qa/communication-browser.json` e `docs/qa/pendi-live-checks.json`. Referências técnicas: [API de Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create), [Faster Whisper](https://github.com/SYSTRAN/faster-whisper), [uploads no FastAPI](https://fastapi.tiangolo.com/tutorial/request-files/).
