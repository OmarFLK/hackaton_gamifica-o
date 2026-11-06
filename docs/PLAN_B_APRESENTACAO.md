# Plano B da apresentação

1. Deixar API e interface locais já iniciadas e abas abertas antes de entrar no palco. Usar `scripts/start-demo.ps1`; os módulos complementares estão disponíveis na porta 5174.
2. Pré-abrir `/api/health` remoto para reduzir surpresa com serviço suspenso. Se a API não responder, anunciar a troca para demo local.
3. Sem internet, usar a API local SQLite com dados fictícios. Sem API local, escolher “Apresentar sem API” na tela de login; anunciar que não há sincronização. Carregar a demo uma vez antes para preparar o cache público.
4. Se microfone/câmera negarem permissão, usar toque. Áudio é opcional e deve ter texto equivalente.
5. Capturas reais disponíveis em `docs/screenshots/`: agenda desktop, agenda mobile e companhia infantil. Nenhum vídeo foi gravado.
6. Se só a API estiver disponível, mostrar a documentação interativa e os resultados dos testes; não afirmar que portais/jogos estão prontos.

Não fazer deploy de última hora durante o pitch. Não inventar persistência, validação clínica ou números de impacto.
