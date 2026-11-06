# Pendi — Cuidado que aproxima

Demonstração acadêmica com dados inteiramente fictícios. **DEMONSTRAÇÃO · Não validado para uso clínico.**

Módulos 01–18 do kit `PROMPTS_HACKATHON_4H` integrados. O app oficial está em `frontend/` e a API em `backend/`. `integration-kit/frontend` foi mantido como referência dos módulos 10–18.

Disponível: landing com 4 entradas; login por perfil com JWT e permissões verificadas no servidor; portal médico (painel, pacientes, ficha, cadastro em etapas, vínculo familiar, revisão clínica fictícia); portal família (água, refeições, humor, gráficos de 7 dias); área infantil assistida pelo responsável (7 mascotes originais, check-in de 7 rostinhos, conversa por voz sintética); 3 minijogos (vela, pássaro, estrela) jogáveis por toque, com microfone/câmera opcionais; agenda de medicamentos, mensagens, FAQ, status dev, PWA e modo offline de leitura.

Verificação após revisão: 85 testes de API, 17 testes de frontend, build de produção e 37 verificações no Edge, incluindo jogos em 375/768/1440px e sensores sintéticos. Detalhes em [docs/REVISAO_PR_1.md](docs/REVISAO_PR_1.md).

## Abrir a demonstração completa (PowerShell)

Primeira instalação, na raiz do repositório:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-demo.ps1
```

O setup preserva arquivos de ambiente existentes, gera um segredo local se necessário e instala/compila a demo. O registro oficial do Yarn foi usado porque o domínio do registro npm estava indisponível nesta rede.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-demo.ps1
```

Interface: **http://127.0.0.1:5174**. API: **http://127.0.0.1:8000/docs**. Serviços iniciam em segundo plano; logs em `.runtime/`, sem arquivos de ambiente versionados. `-Build` recompila antes de abrir; `-NoBrowser` evita abrir nova aba; `-ApiPort 8010` usa outra porta para a API se a 8000 estiver ocupada (recompila a interface).

Na tela de login, os botões Médico/Família/Assistente/Dev preenchem contas fictícias; clique em Entrar. O link “Apresentar sem API” abre a contingência explícita de leitura. As contas demo mantêm `@superped.demo` por compatibilidade com o briefing e o código do outro dev.

## Executar a API local (PowerShell)

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.lock.txt
Copy-Item backend/.env.example backend/.env
```

Em `backend/.env`, definir `JWT_SECRET` com um segredo aleatório de pelo menos 32 caracteres. Manter `DEMO_MODE=true` e SQLite para execução local. Não versionar `.env`.

```powershell
Set-Location backend
../.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health: `http://127.0.0.1:8000/api/health`. Documentação: `http://127.0.0.1:8000/docs`. Contas fictícias: `medico@superped.demo`, `responsavel@superped.demo`, `assistente@superped.demo`, `dev@superped.demo`; senha somente demo: `Demo2026!`. Assistente só acessa pacientes de médicos que o delegaram explicitamente (o seed delega `assistente@` para `medico@`). Recriar o banco local: `ALLOW_DB_RESET=true python -m app.seed --reset`.

## Testar

```powershell
Set-Location backend
../.venv/Scripts/python -m pytest -q -p no:cacheprovider
```

Os testes usam SQLite isolado em memória, sem alterar o banco local.

Frontend: em `frontend`, `npm test` e `npm run build`. Desenvolvimento: `npm run dev` (porta 5173; `frontend/.env.local` define `VITE_API_URL` e `VITE_DEMO_MODE=true`). Navegador: instalar `backend/requirements-dev.txt`, manter os serviços locais ativos e executar `SMOKE_BASE=http://127.0.0.1:5174 .venv/Scripts/python scripts/smoke_01_09.py` (módulos 01–09) ou `scripts/smoke_browser.py` (módulos 10–18, roteiro do app antigo) na raiz. Usa o Edge instalado e dados fictícios; o percurso cria relatos/mensagens no banco demo local. Capturas e resultados detalhados ficam em `.runtime/browser/`.

## Integração e entrega

- [Estado real dos módulos](docs/STATUS_4H.md)
- [Contrato de API](docs/CONTRATO_MVP_4H.md)
- [Guia para o outro desenvolvedor](docs/INTEGRATION_NOTES.md)
- [Resultados atuais dos testes](docs/TESTES_MODULOS_10_18.md)
- [Deploy preparado, ainda não publicado](docs/DEPLOY_GRATUITO.md)
- [Contingência local](docs/PLANO_B_OFFLINE.md)
- [Pitch](docs/PITCH_3_MINUTOS.md) e [roteiro da demo](docs/ROTEIRO_DEMO.md)

Banco SQLite local funcional, incluindo atualização preservando dados da demo antiga. O backend com banco Neon remoto ainda precisa ser configurado/validado; o preview Vercel informado no PR não comprova essa integração. O blueprint e o rewrite SPA estão prontos. Consulte as pendências reais no relatório de revisão.
