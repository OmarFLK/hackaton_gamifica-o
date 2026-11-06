# PROMPT 01 — Orquestrador e chefe de integração

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 5 minutos. Objetivo: conduzir vários agentes de IA, garantir arquitetura funcional e preservar tempo de testes


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
- Você é o **coordenador**. É dono de `README.md`, `docs/STATUS_4H.md`, `frontend/src/app/router.tsx`, `backend/app/main.py` para integração (depois do scaffold).
- Não implemente por conta própria grandes funcionalidades que os demais agentes estão construindo.

## Implementação obrigatória, em ordem
1. Ler `docs/CONTRATO_MVP_4H.md`, `docs/ARQUITETURA_E_OWNERSHIP.md` e identidade visual antes de delegar.
2. Fixar stack: React+TS+Vite+Tailwind, FastAPI, SQLAlchemy, PostgreSQL Neon e SQLite local fallback; PWA sem app nativo no hackathon.
3. Criar quadro de execução com tarefas P0 e dono: scaffold(02), visual/login(03), auth(04), DB(05), médico(06), família(07), infantil(08), games(09), medicamentos(10), chat(11), PWA/voz(12), dev(13), integração(14), testes(15), deploy(16), pitch(17).
4. Executar scaffold primeiro; distribuir prompts após congelar arquivos compartilhados. Se IAs trabalham em paralelo, usar git worktrees/branches independentes ou agentes com arquivos exclusivos; não sobrescrever trabalho alheio.
5. A cada 30 minutos verificar: `npm run build`, `/api/health`, login, navegação. Cortar escopo não essencial imediatamente se bloquear P0.
6. **Marcos**: até minuto 30 front + backend iniciam e login abre; até 120 min portais + jogos com dados; até 180 min chamadas reais CRUD; até 210 min deploy ou fallback; últimos 30 min exclusivamente smoke/pitch.
7. Quando faltarem 40 min, declarar FEATURE FREEZE. Não iniciar novos módulos; resolver só erros críticos.
8. Manter painel de status: funcional, demo local, fora do escopo, pendente, link e comando. Não inventar que está implementado.

## Critérios de aceite verificáveis
- Existe `docs/STATUS_4H.md` com P0 e responsáveis.
- Há um comando de inicialização local para front e back e um contrato único.
- Roteamento, menus e imports finais funcionam sem conflitos entre agentes.
- Pelo menos um fluxo end-to-end funcional por perfil.
- Cada tarefa tem fallback claro se 20 min atrasada.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
