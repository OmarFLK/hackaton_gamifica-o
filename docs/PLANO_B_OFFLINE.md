# Plano B — estado e alternância

## A. Internet e serviços disponíveis

Frontend publicado aponta para a API Render, que usa PostgreSQL Neon. URLs ainda não existem nesta entrega. Confirmar persistência após refresh antes de apresentar.

## B. API local + SQLite

Na raiz, preparar uma vez:

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.lock.txt
Copy-Item backend/.env.example backend/.env
```

Gerar um segredo aleatório e colocá-lo em `backend/.env` como `JWT_SECRET`; não compartilhar o arquivo. Comando para gerar localmente: `.venv/Scripts/python -c "import secrets; print(secrets.token_urlsafe(48))"`.

Em um terminal:

```powershell
Set-Location backend
../.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

O `.env` precisa de `DEMO_MODE=true`, `DATABASE_URL=sqlite:///./superped_demo.db` e `FRONTEND_URL` com a origem local. O seed executa no startup e não duplica contas/agendas.

Após o frontend chegar, iniciá-lo em outro terminal com `VITE_API_URL=http://localhost:8000`. Deixar esses dois processos prontos antes da apresentação; alternar para as abas locais leva menos de 30 segundos. A instalação inicial não cabe nesses 30 segundos.

As APIs locais foram testadas via TestClient com SQLite. Navegação local ponta a ponta ainda não foi testada, pois a interface está sendo criada pelo outro dev.

## C. Somente frontend, sem API

O kit contém `demoOffline.ts` com fixtures fictícias somente de leitura. Deve ser conectado a um botão explícito, disponível apenas com `VITE_DEMO_MODE=true`.

Exibir: **Modo offline de apresentação — mudanças não sincronizadas**. Desabilitar escrita na agenda/chat. FAQ local curada pode explicar uso; não responder clínica pessoal. Não falsificar login online nem apresentar POST local como persistência real. Voltar ao online exige autenticação na API.

Ainda pendentes: tela seletora de contingência, cache de assets públicos, manifest, voz e integração infantil. Não há jogos offline implementados por este escopo: dependem do módulo 09.

O service worker, se adicionado, deve cachear somente shell e assets públicos. Nunca interceptar/cachear `/api`, respostas autenticadas, tokens ou dados clínicos. Tipografia deve ter fallback local.
