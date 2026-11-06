# Deploy demonstrativo — preparado, ainda não publicado

Status em 06/11/2026: não foram criados projetos Render, Neon ou Vercel. Não há URLs públicas verificadas. A demonstração complementar Pendi em `integration-kit/frontend` já compila e funciona localmente. A publicação conjunta com os módulos 00–09 ainda depende do outro desenvolvedor.

## API no Render + Neon

1. Criar/reutilizar um projeto Neon Free. Guardar a conexão no ambiente do servidor, nunca no frontend ou Git. Usar `postgresql+psycopg://...` e os parâmetros TLS fornecidos pelo Neon.
2. Importar `render.yaml` pelo Render. Selecionar plano gratuito. A configuração usa `backend`, Python 3.13.6, `pip install -r requirements.lock.txt`, `uvicorn app.main:app --host 0.0.0.0 --port $PORT` e `/api/health`.
3. Configurar `DATABASE_URL` com PostgreSQL, `FRONTEND_URL` com as origens exatas separadas por vírgula e `DEMO_MODE=true`. `JWT_SECRET` é gerado pelo blueprint. A bancada é exclusivamente demonstrativa e não inicia com `DEMO_MODE=false`.
4. O startup cria as tabelas e executa seed idempotente de dados fictícios. Antes de migrar para os modelos da fundação, comparar schemas; não reaproveitar cegamente tabelas incompatíveis.
5. Verificar `/api/health`, os quatro logins e os testes de vínculo. Reiniciar e confirmar a persistência de um relato no PostgreSQL.

SQLite é apenas local. A API rejeita SQLite ao detectar ambiente Render. Não foi testada uma conexão Neon nesta execução.

## Frontend na Vercel

- Para publicar apenas os módulos complementares: root `integration-kit/frontend`, build `npm run build`, output `dist`. `vercel.json` já está nessa pasta e evita 404 na SPA, preservando assets/manifest/worker.
- Para publicar o sistema integrado após o commit do outro dev: usar a pasta do frontend final, copiar os assets/manifest e adaptar o passo de build do service worker. Não publicar o kit como se já incluísse os módulos 00–09.
- Ambiente: `VITE_API_URL=https://<api-real>.onrender.com`, `VITE_DEMO_MODE=true`.
- Adicionar `vercel.json` com rewrite SPA, preservando arquivos estáticos:

```json
{"rewrites":[{"source":"/((?!brand/|assets/|manifest.webmanifest|sw.js).*)","destination":"/index.html"}]}
```

- Ajustar `FRONTEND_URL` no backend para o domínio publicado. Verificar refresh direto em `/familia`, `/dev` e nas rotas protegidas.
- Confirmar o plano gratuito e adequação acadêmica/não comercial na conta antes de publicar. Não cadastrar dados reais.

Nenhuma credencial de hospedagem foi solicitada por chat ou colocada no código. Blueprint/arquivos de configuração estão prontos; provisionamento e verificação pública continuam pendentes de acesso às contas.

## Limites e fontes

O Render Free pode suspender o serviço após inatividade; seu filesystem é efêmero. Pré-abrir a API antes do pitch e manter o plano local preparado. [Documentação oficial Render Free](https://render.com/docs/free).

Rewrites devem entregar o index da SPA em navegações internas. [Documentação oficial Vercel](https://vercel.com/docs/routing/rewrites).

Planos e limites devem ser conferidos na conta ao publicar: [Neon](https://neon.com/docs/introduction/plans), [Vercel Hobby](https://vercel.com/docs/plans/hobby). Nenhum serviço pago é necessário nesta configuração.
