# Plano B — estado e alternância

Pendi: o preview complementar já funciona com API local e também sem internet após o cache inicial. Comandos rápidos testados: `scripts/start-demo.ps1`, interface em http://127.0.0.1:5174. Na primeira instalação use `scripts/setup-demo.ps1`.

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

O frontend complementar usa `VITE_API_URL=http://localhost:8000` e porta 5174. Deixar os dois processos prontos antes da apresentação; alternar para as abas locais leva menos de 30 segundos. A instalação inicial não cabe nesses 30 segundos.

As APIs foram testadas via TestClient com SQLite em memória, e a navegação complementar foi testada no Edge contra a API HTTP com SQLite em disco. Os portais completos e jogos do outro dev continuam fora desta validação.

## C. Somente frontend, sem API

O kit contém `demoOffline.ts` com fixtures fictícias somente de leitura, conectado ao link “Apresentar sem API” da tela de login, disponível apenas com `VITE_DEMO_MODE=true`. Selecionar o perfil da apresentação e abrir.

Exibir: **Modo offline de apresentação — mudanças não sincronizadas**. Desabilitar escrita na agenda/chat. FAQ local curada pode explicar uso; não responder clínica pessoal. Não falsificar login online nem apresentar POST local como persistência real. Voltar ao online exige autenticação na API.

Seletor de contingência, cache de assets públicos, manifest, voz opcional e companhia infantil por botões estão implementados. Sem internet, abrir a URL previamente carregada, escolher “Apresentar sem API” e continuar em leitura. Após reload a sessão fictícia precisa ser escolhida novamente; nenhuma credencial falsa é persistida. Não há jogos offline implementados por este escopo: dependem do módulo 09.

O service worker gerado no build cacheia somente shell e assets públicos. A auditoria automatizada confirmou ausência de `/api` no cache; requisições com Authorization não são interceptadas. A tipografia possui fallback local. O primeiro carregamento deve acontecer com o serviço local ou hospedado disponível; não é possível instalar/cachear pela primeira vez sem nenhuma origem acessível.
