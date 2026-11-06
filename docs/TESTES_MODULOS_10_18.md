# Pendi — verificação dos módulos complementares

Executado em 06/11/2026, horário de São Paulo. Resultados finais: **build aprovado, 48 testes API, 9 testes frontend e 18 verificações de navegador aprovadas**. Os resultados históricos anteriores ficam em `TESTES_SMOKE_4H.md`.

## Comandos executados

- `../.venv/Scripts/python -m pytest -q -p no:cacheprovider` em `backend`: 48 passed em 38,70s. Testes usam SQLite isolado em memória.
- `npm run build` em `integration-kit/frontend`: TypeScript e Vite aprovados; gerador offline inclui seis arquivos públicos, sem API.
- `npm test`: 9 passed, sobre ocorrência/data/fuso/histórico e falas infantis determinísticas.
- `.venv/Scripts/python scripts/smoke_browser.py`: 18 PASSOU no Edge headless instalado. Usa API HTTP local e SQLite em disco, com contas e dados fictícios. Produz relatos/mensagens fictícios durante o percurso.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-demo.ps1 -NoBrowser`: serviços locais respondem; interface HTTP 200 e API health ok.

## Navegador — resultados reais

1. Login médico e agenda vinculada.
2. Criação de programação fictícia na API.
3. Família consulta agenda e registra relato com autor.
4. Persistência após refresh.
5. Agenda sem overflow em 375px.
6. Agenda sem overflow em 768px.
7. Agenda sem overflow em 1440px.
8. Lembrete demonstrativo após 10 segundos.
9. Mensagens compartilhadas entre sessões médico/família.
10. FAQ geral e encaminhamento de questão clínica.
11. Companheiro por botões, chamada local de adulto, tela infantil sem medicamentos.
12. Médico lê relato e mensagem enviados pela família.
13. Dev vê somente status; endpoint de pacientes retorna 403.
14. Assistente sem delegação não recebe acesso implícito.
15. Modo offline identificado, com escritas desabilitadas.
16. Cache de service worker auditado sem respostas da API.
17. SPA e FAQ reabertas com internet desligada após cache público.
18. Nenhum erro JavaScript não tratado durante o percurso.

Capturas: [desktop](screenshots/agenda-desktop.png), [celular](screenshots/agenda-mobile.png), [companheiro](screenshots/companhia-mobile.png). Evidência estruturada: `qa/browser-results.json`. Arquivos de ambiente, tokens e banco não são incluídos.

## Limites explícitos

- Não foram testados microfone físico, audição do TTS, notificações do sistema operacional ou instalação PWA em aparelho real. O aviso dentro da página e a alternativa por botões foram testados.
- Não houve publicação nem teste Neon/Render/Vercel.
- Módulos 00–09 não chegaram nesta execução; cadastro, água, emoção, jogos e o portal principal não foram validados aqui.
- A suíte API ainda emite aviso de depreciação de TestClient/httpx na versão instalada; nenhum teste falhou por isso.
- A primeira execução do teste de navegador encontrou seletores excessivamente exatos e um parêntese extra no script de auditoria; foram corrigidos, e o percurso final passou integralmente.
