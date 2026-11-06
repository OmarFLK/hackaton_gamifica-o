# PROMPT 02 — Scaffold do monorepo e contratos

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: criar fundação executável rapidamente antes de abrir trabalho em paralelo


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
- Crie `frontend/` inteiro a partir de Vite+React+TS, `backend/` pacote mínimo, configs raiz, `frontend/src/lib/{api.ts,types.ts,demo.ts}`, `frontend/src/app/{App.tsx,router.tsx}`, `backend/app/main.py` inicial, `.env.example`, `.gitignore`, README de comandos.
- Só altere `backend/app/core/config.py` se necessário. Não implementar telas finais; serão responsabilidade dos agentes.

## Implementação obrigatória, em ordem
1. Detectar versões instaladas (`node -v`, `python -V`), usar Node LTS e Python local; criar `frontend` com `npm create vite@latest ... -- --template react-ts` ou equivalente estável.
2. Instalar mínimo: `react-router-dom`, `lucide-react`, `recharts`, `tailwindcss` e plugin Vite Tailwind compatível com versão, sem excesso de dependências.
3. Criar `backend/requirements.txt`: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `psycopg[binary]`, `pyjwt`, `pwdlib[argon2]`, `python-dotenv`, `pydantic`, `pytest`, `httpx` (ver compatibilidades). `backend/app/main.py`: FastAPI com `GET /api/health`, CORS com env, espaço para `include_router` dos agentes. API doc em `/docs`.
4. Configurar `frontend/src/lib/api.ts` com cliente fetch que lê `VITE_API_URL`, injeta token via getter e transforma erros, sem base mock silencioso. Tipos de todos os objetos segundo contrato.
5. Criar `frontend/src/lib/demo.ts` com `isDemo`, rótulo `DEMONSTRAÇÃO` e fixtures de estrutura (poderão ser estendidas pelo agente do portal).
6. Criar páginas placeholder compiláveis e roteador básico; será substituído pelo agente 14. Fazer build e API health antes de delegar.
7. Enviar aos agentes lista explícita de exports/nomes. Não introduzir Docker, Turbo, Nx, next.js, Storybook ou testes e2e pesados.

## Critérios de aceite verificáveis
- `cd frontend && npm install && npm run dev` abre tela sem crash.
- `cd frontend && npm run build` conclui.
- `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload` entrega `/api/health` 200.
- `frontend/src/lib/types.ts` implementa os tipos e rotas do contrato sem inventar campos.
- `.env` privado ignorado pelo Git.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
