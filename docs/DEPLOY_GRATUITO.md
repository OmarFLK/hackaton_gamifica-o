# Pendi publicado: Neon + Render + Vercel

Verificado em **06/11/2026**, com dados ficticios.

- Aplicativo: https://hackatongamifica-o.vercel.app
- API: https://pendi-demo-api.onrender.com
- Health: https://pendi-demo-api.onrender.com/api/health
- API docs: https://pendi-demo-api.onrender.com/docs

O navegador acessa somente a API do Render. Apenas o backend conecta ao Neon e ao provedor de IA. As credenciais estao em arquivos privados ignorados pelo Git.

## 1. Neon: banco PostgreSQL

Projeto `late-mouse-13219700`, organizacao `org-odd-pond-80210670`, branch `production`, AWS Ohio. O banco existente foi reutilizado, sem reset.

Na raiz do repositorio:

```powershell
npm i -g neon@latest
neon login
neon init -y --org-id org-odd-pond-80210670 --project-id late-mouse-13219700 --branch production --services postgres --no-agent-setup
neon deploy
```

Se a instalacao global falhar, substituir `neon` por `npx neon@latest`. O primeiro init sem `--no-agent-setup` ficou esperando a instalacao do plugin de outro editor; essa opcao evitou repetir essa etapa e concluiu o vinculo. O init criou `neon.ts` e puxou cinco variaveis para `.env.local`, incluindo `DATABASE_URL` pooled e `DATABASE_URL_UNPOOLED` direta. `.neon` guarda o vinculo local. Esses dois arquivos estao ignorados pelo Git.

`neon deploy` aplica a infraestrutura Neon; nao publica frontend nem FastAPI. O `neon.ts` declara somente PostgreSQL e preserva a autenticacao JWT existente.

A instalacao automatica de skills exigiu Node >=22.20.0; a maquina tem 22.18.0. As skills oficiais `neon` e `neon-postgres` foram lidas diretamente no repositorio oficial. Foi mantido SQLAlchemy + psycopg 3. A preparacao do esquema usou a conexao direta; a API usa a pooled. O TLS foi confirmado pelo driver (`pgconn.ssl_in_use=True`) e a consulta `SELECT 1` passou. O indicador `pg_stat_ssl` do servidor atras do proxy nao descreve o trecho cliente-proxy.

Foram criadas as 11 tabelas do projeto e as 6 contas ficticias pelo seed idempotente. O MVP usa `create_all` e atualizacoes aditivas; ainda nao possui uma cadeia Alembic completa.

Fontes oficiais: [init](https://neon.com/docs/cli/init), [deploy](https://neon.com/docs/cli/deploy), [pooling](https://neon.com/docs/connect/connection-pooling), [skill PostgreSQL](https://github.com/neondatabase/agent-skills/tree/main/skills/neon-postgres).

## 2. Arquivos de ambiente ja escritos

Para regenerar os arquivos com as variaveis do Neon e a chave da IA ja presente no backend:

```powershell
.venv/Scripts/python.exe scripts/configure_cloud.py --api-url https://pendi-demo-api.onrender.com
```

| Arquivo | Uso |
| --- | --- |
| `.env.local` | Variaveis puxadas pelo Neon; contem credenciais. |
| `backend/.env` | Backend local conectado ao Neon, preservando a IA e origens locais. |
| `backend/.env.render` | Configuracao privada pronta para o Render. |
| `frontend/.env.vercel` | Somente as duas variaveis publicas da Vercel. |
| `frontend/.env.production.local` | Build local usando a API publica. |

O script gera um JWT de nuvem na primeira execucao e o preserva nas seguintes. Os arquivos com credenciais e os backups receberam acesso local apenas para o usuario atual e SYSTEM. Backups do ambiente anterior: `.runtime/backups/`. Nao copiar ambientes privados para o Git. `scripts/check_secrets.py` verifica chaves, tokens e senha Neon nos arquivos versionados e no build publico.

## 3. Render: backend FastAPI

Criado em **Omar's workspace > Hackaton > Production**, servico `pendi-demo-api`, ID `srv-dbn1uqkipgvc73bbp63g`, plano Free.

No formulario mostrado nas capturas:

| Campo | Valor correto |
| --- | --- |
| Repository | `OmarFLK/hackaton_gamifica-o` |
| Name | `pendi-demo-api` |
| Language | `Python 3` |
| Branch | `main` |
| Region | `Ohio (US East)` |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.lock.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health` |
| Instance | `Free` |
| Environment Variable | `PYTHON_VERSION=3.13.6` |

**Configuracao efetivamente usada:** o conteudo de `backend/.env.render` foi enviado pelo CLI oficial como **Secret File chamado `.env`**. O Render disponibiliza o arquivo tambem na raiz de servicos Python, onde o python-dotenv do backend o encontra. A versao Python foi definida separadamente como variavel, pois e usada antes do startup.

**Alternativa pelo painel:** Environment > Add from .env > importar `backend/.env.render` > salvar e fazer deploy. Nao e necessario duplicar os valores em arquivo secreto e variaveis. Uma variavel de ambiente definida no Render tem precedencia sobre o dotenv; se ela existir, atualizar essa variavel ao trocar a chave.

O arquivo privado contem: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `DEMO_MODE=true`, `ALLOW_DB_RESET=false`, `FRONTEND_URL=https://hackatongamifica-o.vercel.app`, `BARO_API_KEY`, `AI_API_URL=https://ia.maua.br/api/v1`, `AI_API_MODEL=google/gemma-3-27b`, `AI_ALLOWED_HOSTS=ia.maua.br`, `AI_PROVIDER_LABEL=Pendi` e `AI_ALLOW_HTTP=false`. Os valores secretos ja estao escritos; nao constam neste guia.

`render.yaml` foi validado pelo CLI e serve como alternativa para criar o servico via Blueprint. Editar o YAML nao reconfigura automaticamente este servico, que foi criado via CLI; usar Settings/Environment ou `render services update`. Commits em `backend/` disparam o auto-deploy da main. Com Root Directory definido, alteracoes fora dessa pasta nao disparam esse auto-deploy.

Fontes oficiais: [FastAPI](https://render.com/docs/deploy-fastapi), [monorepo](https://render.com/docs/monorepo-support), [ambientes e Secret Files](https://render.com/docs/configure-environment-variables), [Python](https://render.com/docs/python-version), [CLI](https://render.com/docs/cli).

## 4. Vercel: frontend React/Vite

Projeto existente `hackaton_gamifica-o`, scope `omars-projects-30603b7a`. O 404 foi corrigido: a raiz estava `.` e o framework, `Other`.

Em Settings > Build and Deployment:

| Campo | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | `Vite` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | `22.x` |
| Production Branch | `main` |

Em Environment Variables, configurar **Production e Preview** com apenas:

```dotenv
VITE_API_URL=https://pendi-demo-api.onrender.com
VITE_DEMO_MODE=true
```

Essas duas variaveis ja foram configuradas. Nunca colocar `DATABASE_URL`, `BARO_API_KEY` ou `JWT_SECRET` neste frontend. `VITE_*` entra no JavaScript entregue ao navegador. Depois de mudar ambiente, fazer novo deploy para recompilar.

`frontend/vercel.json` fixa build/dist e faz o fallback da SPA, preservando assets, mascotes, manifest e service worker. `.vercelignore` exclui backend, arquivos de ambiente e artefatos locais do upload. Pastas exclusivas da raiz usam `/scripts/`, `/docs/` etc.: sem a barra inicial, a regra tambem excluia `frontend/scripts/build-offline.mjs` e fazia o build automatico falhar. A regra foi corrigida para preservar esse script de build.

Para publicar novamente, pela raiz do repositorio:

```powershell
vercel login
vercel link --yes --project hackaton_gamifica-o --scope omars-projects-30603b7a
vercel --prod --yes --scope omars-projects-30603b7a
```

O vinculo Git existente tambem publica commits da main com as configuracoes corrigidas. A URL publica de apresentacao foi testada sem login da hospedagem; previews podem continuar protegidos pela Vercel.

Fontes oficiais: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [configuracao](https://vercel.com/docs/project-configuration), [variaveis](https://vercel.com/docs/environment-variables), [Vite e variaveis publicas](https://vite.dev/guide/env-and-mode).

## 5. Celular e apresentacao

1. Abrir https://hackatongamifica-o.vercel.app no celular com internet; nao precisa estar na mesma rede do computador.
2. Entrar como **Responsavel**: `responsavel@superped.demo`, senha `Demo2026!`, para Nina. Theo: `responsavel.theo@superped.demo`; Lia: `responsavel.lia@superped.demo`; mesma senha ficticia.
3. Abrir **Entrar no mundo da crianca** para jogos por toque e conversa com o Pendi.
4. Em outra sessao/aparelho, entrar como `medico@superped.demo`, mesma senha, para testar mensagens e notificacoes com a familia.
5. Antes de apresentar, abrir o health e fazer um login. O Render Free suspende apos 15 minutos sem trafego de entrada e pode levar aproximadamente um minuto para iniciar; tentar novamente se necessario. Os dados persistem no Neon, apesar do filesystem efemero do Render.

`assistente@superped.demo` e `dev@superped.demo` tambem usam `Demo2026!`. O dev nao acessa pacientes. Cada responsavel pode ter outras criancas ficticias vinculadas pelo medico.

**Limites reais:** Whisper nao instalado no Render Free; `/api/speech/status` retorna `available=false`. O ditado usa Web Speech quando disponivel, com consentimento e revisao antes de enviar. Isso varia por navegador e pode usar um servico externo do navegador. Nao foi validado microfone fisico no celular; digitar continua disponivel. A camera opcional falhou ao retomar apos pausa no Edge de teste; os tres jogos por toque passaram. Notificacoes atualizam com a pagina aberta, sem push garantido com o app fechado.

Fontes: [Render Free](https://render.com/docs/free), [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).

## 6. Evidencias

```powershell
npm run build
.venv/Scripts/python.exe scripts/verify_cloud.py --with-ai
$env:SMOKE_BASE='https://hackatongamifica-o.vercel.app'
.venv/Scripts/python.exe scripts/smoke_01_09.py
.venv/Scripts/python.exe scripts/check_secrets.py
```

- Neon init/deploy: exit 0, cinco variaveis puxadas; `No changes - branch production already matches the policy`.
- Build da raiz: TypeScript/Vite passaram; 38 arquivos publicos no PWA, API excluida. Apenas aviso de bundle JS >500 kB.
- Render: deploy `live`, health 200; TLS confirmado no driver; registros da API encontrados por uma nova conexao ao Neon.
- API publica: 11 verificacoes passaram, incluindo CORS, seis logins, bloqueio 403 entre familias, persistencia, mensagens/notificacoes e Gemma real com os tres RAGs. [Relatorio](qa/cloud-api-checks.json).
- Edge contra a URL publica: 21 verificacoes desktop/mobile passaram. Os dois 401 de console vieram do teste proposital de senha incorreta.
- PR #2 revisado e integrado antes do deploy: 120 testes backend e 17 frontend passaram.
- Scanner: nenhum segredo privado encontrado no Git ou build publico.

Falhas contornadas: setup do plugin do editor no primeiro init; requisito de Node para instalar skills; ambientes multiplos da Vercel no PowerShell, corrigidos com `'production,preview'`. Asserts dos scripts foram ajustados para preservar cadastros anteriores e verificar as notificacoes genericas, que ocultam o texto privado da conversa.
