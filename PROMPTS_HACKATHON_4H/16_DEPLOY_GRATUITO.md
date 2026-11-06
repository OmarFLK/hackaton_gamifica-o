# PROMPT 16 — Deploy gratuito: Vercel + Render + Neon

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 25 minutos. Objetivo: publicar uma demo funcional sem serviços pagos e preparar fallback local


## Regras obrigatórias para TODOS os agentes
- Contexto: **SuperPed — Jornada Corajosa**, demo acadêmica hackathon Instituto Mauá de Tecnologia × Centro Universitário São Camilo. **PRAZO TOTAL: 4 HORAS**. Produzir CÓDIGO EXECUTÁVEL, não apenas texto ou pseudocódigo. Trabalhe no repositório atual, inspecione arquivos existentes e não destrua trabalho de outras IAs.
- **100% gratuito/sem cartão**: React + TypeScript + Vite, Tailwind CSS e Lucide React, Recharts; Python + FastAPI + SQLAlchemy; PostgreSQL Neon Free via DATABASE_URL, fallback SQLite local; Vercel Hobby para frontend acadêmico não comercial, Render Free para backend. Sem SMS, ElevenLabs pago, OpenAI API paga, Firebase pago, APIs médicas ou serviços com cobrança automática.
- A aplicação é SOMENTE UMA DEMONSTRAÇÃO acadêmica. Todos os dados são **100% fictícios** com badge DEMONSTRAÇÃO. Não usar dados reais de crianças, fotos, registros médicos ou credenciais reais. NÃO afirmar validação clínica; não oferecer diagnósticos, dose, estágio estimado, tratamento ou aconselhamento médico individual.
- Sempre disponibilizar alternativas a microfone e câmera. Voz infantil apenas sintética e original via `speechSynthesis`; nada de clonagem, vozes de atores ou personagens protegidos. Sete companheiros originais: Arco, Guarda-Lua, Faísca, Pinta, Pipo, Niva (lenço opcional), Pandi (panda neutro).
- Identidade visual canônica: navy #203774, azul-noite #132653, vinho #941C2F, preto #101521, branco #FFFFFF, fundo #F4F6FA, bordas #E3E7EF; Montserrat (título), Open Sans (texto), Nunito (infantil); componentes acessíveis, responsividade mobile-first, botões 48px, foco visível, animação reduzida. Co-branding tipográfico, não falsificar logos oficiais.
- Segurança: autenticação e verificação de permissões no BACKEND, nunca confiar apenas em ocultar botão. Médico vê pacientes vinculados; responsável somente filhos vinculados; assistente faz cadastro administrativo delegado mas NÃO altera diagnóstico/prescrição; desenvolvedor vê apenas ambiente/telemetria sintéticos e NÃO vê dados clínicos. Criança usa acesso assistido pelo responsável, sem credencial nem prontuário.
- **Não edite arquivos de outro agente**. Se precisar, registre no seu `INTEGRATION_NOTES.md` e exporte os componentes/routers para integração pelo coordenador. Evitar refatoração ampla.
- Toda resposta da IA deve incluir: arquivos modificados, comandos utilizados, testes/build, pendências reais e instrução mínima de integração. Sem alegar funcionalidades não executadas.
- Leia antes: `docs/CONTRATO_MVP_4H.md` e `docs/ARQUITETURA_E_OWNERSHIP.md` (incluídos no pacote); se ainda não tiverem sido copiados ao repositório, peça ao coordenador que os copie, ou use o contrato fornecido com este prompt.

## Propriedade de arquivos — não editar fora daqui
- `README.md`, `docs/DEPLOY_GRATUITO.md`, `render.yaml` (opcional), `frontend/vercel.json`, arquivos env de exemplo. Não alterar dados/autenticação sem coordenação.

## Implementação obrigatória, em ordem
1. **Neon**: criar projeto Free na conta existente; copiar URL de conexão PostgreSQL com SSL para Render `DATABASE_URL` (se a pessoa já tiver conexão, reutilizar). Migrar seed DEMO 100% fictícia no ambiente de demo. Nunca passar credenciais em client, commit, README ou print.
2. **Render**: Web Service Free ligado ao repo, root `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; vars `DATABASE_URL`, `JWT_SECRET`, `DEMO_MODE=true`, `FRONTEND_URL`. Configurar `startup`/seed manual via build/start somente se idempotente e não duplicar. Testar `/api/health`.
3. **Vercel**: importar frontend Vite (root `frontend`), build `npm run build`, output `dist`, `VITE_API_URL=https://...onrender.com`, `VITE_DEMO_MODE=true`. Adicionar rewrite SPA para index.html em `/medico` e outras rotas. Conferir CORS da API apontando para URL real de Vercel.
4. Render Free hiberna após 15min, demora ~1min ao acordar; filesystem efêmero: NUNCA usar SQLite no Render para dados persistentes. Neon é DB na versão publicada. Neon Free tem limites e pode pausar; documentar comportamento.
5. Vercel Hobby é pessoal/não comercial; demo acadêmica pessoal apenas. Não usar produção hospitalar nem contas de pacientes reais.
6. Testar URL pública com login médico e família, registro de humor/medicação, voltar a página e verificar persistência.
7. Se deploy falhar, apresentar local usando `npm run dev -- --host 0.0.0.0` e `uvicorn...`; nunca desperdiçar os 20 minutos finais tentando corrigir DNS/config não essencial.
8. Documentar URLs reais APÓS confirmação, status e variáveis requeridas sem os valores secretos.

## Critérios de aceite verificáveis
- Se online: URLs reais de frontend/API funcionando, Neon persistindo registro após refresh.
- Se offline: comandos locais comprovados, com badge 'Demo local'.
- Nenhum segredo visível na tela, logs públicos ou versionado.
- `frontend/vercel.json` evita 404 em refresh de rota SPA.
- Aviso sobre cold start Render ao apresentador.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
