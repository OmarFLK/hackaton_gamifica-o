# SuperPed — Jornada Corajosa

Demonstração acadêmica com dados inteiramente fictícios. **DEMONSTRAÇÃO · Não validado para uso clínico.**

Escopo desta implementação: módulos 10–18 do kit `PROMPTS_HACKATHON_4H`. A interface geral e os módulos 00–09 serão enviados pelo outro desenvolvedor; a integração visual está aguardando esse código.

Disponível agora: API de agenda/relatos de medicamentos, mensagens por paciente, FAQ estática e status técnico restrito ao desenvolvedor. Uma bancada isolada fornece login demo e pacientes de leitura para testes. Há 48 testes API aprovados; a aplicação visual completa ainda não foi compilada/testada.

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

## Integração e entrega

- [Estado real dos módulos](docs/STATUS_4H.md)
- [Contrato de API](docs/CONTRATO_MVP_4H.md)
- [Guia para o outro desenvolvedor](docs/INTEGRATION_NOTES.md)
- [Resultados dos testes](docs/TESTES_SMOKE_4H.md)
- [Deploy preparado, ainda não publicado](docs/DEPLOY_GRATUITO.md)
- [Contingência local](docs/PLANO_B_OFFLINE.md)
- [Pitch](docs/PITCH_3_MINUTOS.md) e [roteiro da demo](docs/ROTEIRO_DEMO.md)

Componentes React já preparados ficam em `integration-kit/frontend`, sem ocupar o frontend do outro dev. Não são uma aplicação independente.
