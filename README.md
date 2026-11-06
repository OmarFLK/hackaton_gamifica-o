# Pendi — Cuidado que aproxima

Demonstração acadêmica com dados inteiramente fictícios. **DEMONSTRAÇÃO · Não validado para uso clínico.**

Escopo desta implementação: módulos 10–18 do kit `PROMPTS_HACKATHON_4H`. A demonstração complementar funciona de forma independente em `integration-kit/frontend`, sem ocupar a pasta `frontend/` do outro desenvolvedor. A integração final com os módulos 00–09 depende do envio deles pelo GitHub.

Disponível: agenda/relatos de medicamentos, mensagens família/equipe, FAQ estática, companhia infantil por botões e voz opcional, status dev, manifest PWA e modo offline de leitura. Marca e logos Pendi fornecidas pelo usuário. Verificação: build de produção, 48 testes API, 9 testes frontend e 18 verificações no Edge aprovados.

## Abrir a demonstração completa (PowerShell)

Primeira instalação, na raiz do repositório:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-demo.ps1
```

O setup preserva arquivos de ambiente existentes, gera um segredo local se necessário e instala/compila a demo. O registro oficial do Yarn foi usado porque o domínio do registro npm estava indisponível nesta rede.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-demo.ps1
```

Interface: **http://127.0.0.1:5174**. API: **http://127.0.0.1:8000/docs**. Serviços iniciam em segundo plano; logs em `.runtime/`, sem arquivos de ambiente versionados. `-Build` recompila antes de abrir; `-NoBrowser` evita abrir nova aba.

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

Health: `http://127.0.0.1:8000/api/health`. Documentação: `http://127.0.0.1:8000/docs`. Contas fictícias: `medico@superped.demo`, `responsavel@superped.demo`, `assistente@superped.demo`, `dev@superped.demo`; senha somente demo: `Demo2026!`. Assistente não recebe delegação implícita.

## Testar

```powershell
Set-Location backend
../.venv/Scripts/python -m pytest -q -p no:cacheprovider
```

Os testes usam SQLite isolado em memória, sem alterar o banco local.

Frontend: em `integration-kit/frontend`, `npm test` e `npm run build`. Navegador: instalar `backend/requirements-dev.txt`, manter os serviços locais ativos e executar `.venv/Scripts/python scripts/smoke_browser.py` na raiz. Usa o Edge instalado e dados fictícios; o percurso cria relatos/mensagens no banco demo local. Capturas e resultados detalhados ficam em `.runtime/browser/`.

## Integração e entrega

- [Estado real dos módulos](docs/STATUS_4H.md)
- [Contrato de API](docs/CONTRATO_MVP_4H.md)
- [Guia para o outro desenvolvedor](docs/INTEGRATION_NOTES.md)
- [Resultados atuais dos testes](docs/TESTES_MODULOS_10_18.md)
- [Deploy preparado, ainda não publicado](docs/DEPLOY_GRATUITO.md)
- [Contingência local](docs/PLANO_B_OFFLINE.md)
- [Pitch](docs/PITCH_3_MINUTOS.md) e [roteiro da demo](docs/ROTEIRO_DEMO.md)

Nenhum deploy público foi feito: Render/Neon/Vercel precisam ser configurados na conta do apresentador. O blueprint e o rewrite SPA estão prontos. Cadastro de pacientes, rotina/água, emoções e jogos são responsabilidade dos módulos 00–09; não foram recriados neste escopo.
