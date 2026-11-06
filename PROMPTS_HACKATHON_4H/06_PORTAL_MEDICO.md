# PROMPT 06 — Portal médico e cadastros

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 35 minutos. Objetivo: implementar acompanhamento profissional com ações reais e dados demonstrativos


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
- `frontend/src/pages/doctor/**` e `backend/app/routers/patients.py`; exportar `DoctorDashboard`, `PatientsPage`, `PatientDetailPage`, `PatientCreatePage` e `router` FastAPI.
- Não mexer em modelos, classes do layout compartilhado nem router global.

## Implementação obrigatória, em ordem
1. Dashboard: cards pacientes vinculados, registros recentes, medicações programadas e atividade recente, todos com nota 'indicadores de rotina, não evolução clínica'; usar Recharts com dados reais de API ou seed. Loading e vazio.
2. Lista de pacientes: pesquisa, cartões responsivos ou tabela, ação 'Abrir ficha', botão cadastrar e fluxo de autorização.
3. Ficha: nome, avatar, DOB/idade, vínculo família, registros de humor, água/refeições e medicações; ocultar detalhes clínicos à família na API.
4. Novo paciente: formulário em etapas rápido com dados fictícios, escolha de tema, médico responsável, convite de familiar selecionando responsável demo existente; etapa de vínculo por `/api/patients/{id}/guardians`. Em demo não enviar e-mail real. Só médico/assistente delegada cria paciente; assistente sem campos clínicos.
5. API conforme contrato: `GET /api/patients`, `POST`, `GET /{id}`, `POST /{id}/guardians`, `GET /{id}/dashboard`. Filtrar queries por médico vinculado/família vinculada; nunca retornar pacientes de todos indiscriminadamente.
6. Criar painel de revisão clínica se houver tempo: campos `cancer_type_demo`, `clinical_stage_demo` só para médico (rotulados fictícios). Sem inferência ou alteração automática por jogo/IA.
7. Não construir toda a funcionalidade de prontuário nem sincronização hospitalar. Exportar o router sem alterá-lo no arquivo principal.

## Critérios de aceite verificáveis
- Login médico lista pelo menos 3 pacientes fictícios e abre ficha.
- Cadastro de paciente novo persiste na API/SQLite/Neon.
- Assistente não altera prescrição/diagnóstico.
- Família/DEV recebem 403 ao cadastrar paciente.
- Dashboard funciona em desktop e mobile.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
