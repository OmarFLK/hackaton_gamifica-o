# PROMPT 14 — Integração de módulos e API ponta a ponta

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 30 minutos. Objetivo: transformar páginas e routers isolados em um único app funcional


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
- ÚNICO agente autorizado a editar `frontend/src/app/{router.tsx,App.tsx}`, `frontend/src/lib/api.ts` e `backend/app/main.py` depois do scaffold. Pode fazer pequenos ajustes em imports/exports nos módulos COM ciência dos responsáveis.

## Implementação obrigatória, em ordem
1. Importar e registrar routers FastAPI com `include_router` e prefixes de contrato; confirmar no `/docs` e evitar duplicação `/api/api`.
2. Montar rotas React: `/`, `/login`, `/medico`, `/medico/pacientes`, `/medico/pacientes/:patientId`, `/familia`, `/crianca/:patientId`, `/dev`; usar `ProtectedRoute` e `AuthProvider`.
3. Fazer navegador consumir endpoints reais com token. Estados `loading/empty/error`. `VITE_API_URL` único, sem strings localhost hardcoded nos componentes.
4. Garantir que frontend e API usem mesma identidade de paciente/roles/campos; corrigir incompatibilidades de tipo, timezone e nomes (`times_json`, `score`, etc.).
5. Integração de componentes: médico ficha/medicamentos/mensagens; família dashboards/medicamentos/mensagens/FAQ; criança mascotes/emoção/3 games/voz; dev status.
6. Implementar fallback demo **explícito** se API falhar, preferencialmente usado só para pitch offline; emite aviso visual 'Modo offline — alterações não sincronizadas'. Não capturar erros e fingir que salvou.
7. Executar fluxo e2e manual: login médico -> criar paciente -> vincular responsável -> login responsável -> ver novo paciente -> registrar água -> criar evento de medicação -> abrir criança -> mood e jogo -> voltar médico -> ver registros.
8. Rodar `npm run build` e `pytest`; corrigir críticos antes de polir perfumaria. Anotar riscos de cold start Render e segredos Neon.

## Critérios de aceite verificáveis
- Todos os menus navegam e não há botões-chave sem ação.
- Médico e responsável compartilham os mesmos registros persistidos no banco.
- Auth backend bloqueia acesso por URL alterada.
- Build frontend e inicialização backend funcionam.
- Falha de API não gera sucesso falso.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
