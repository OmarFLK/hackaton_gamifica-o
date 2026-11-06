# Pendi — demonstração complementar dos módulos 10–18

O outro dev está construindo a interface geral e enviará a base pelo GitHub. Os módulos complementares foram isolados aqui para poderem ser executados e testados enquanto a base não chega. Não substituir o frontend dele pelo kit inteiro.

Disponíveis: medicamentos, mensagens, FAQ, companhia por voz/botões, dashboard dev, manifest, cache público e fixtures de leitura. O aplicativo de demonstração usa login real da bancada API, com autorização por vínculo. O modo offline é explicitamente de leitura. Build, testes e navegador validados conforme `docs/TESTES_MODULOS_10_18.md`.

Para iniciar, executar `scripts/start-demo.ps1` a partir da raiz após o setup. Alternativa: em `frontend/`, copiar `.env.example` para `.env.local`, executar `npm ci`, `npm run build` e `npm run preview`. Endereço padrão: http://127.0.0.1:5174. API local esperada na porta 8000.

Integração: [docs/INTEGRATION_NOTES.md](../docs/INTEGRATION_NOTES.md). Copiar features e adaptar o provider, layout e cliente compartilhados do projeto final. As logos originais fornecidas ficam em `frontend/public/brand/`.
