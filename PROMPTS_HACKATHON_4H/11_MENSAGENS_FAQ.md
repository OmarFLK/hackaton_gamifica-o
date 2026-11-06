# PROMPT 11 — Chat familiar-clínico e FAQ seguro

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: entregar comunicação básica real e uma simulação honesta de assistente sem custo


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
- `frontend/src/features/messages/**`, `frontend/src/features/assistant/**`, `backend/app/routers/messages.py`, `backend/app/routers/assistant.py`. Exportar `MessageCenter`, `InformationalAssistant` e routers.

## Implementação obrigatória, em ordem
1. Chat paciente ↔ responsável ↔ equipe: lista por `patient_id`, POST da mensagem, API protegida por vínculo, autor sempre derivado do JWT, renderizar datas e origem. Atualização por refresh manual ou polling leve de 15–30s só quando tela ativa; evitar WebSocket para poupar tempo.
2. Mostrar banner 'Este chat não é canal de emergência'. Sem garantir tempo de resposta e sem comunicação a paciente real.
3. Assistente com regras/FAQ **estático** em Python gratuito, respostas curadas: acesso, agendamento, registro de água, como usar jogos, privacidade, diferença entre alerta e administração confirmada. Afirmar no app 'FAQ automatizado de demonstração', NÃO 'IA treinada com dados hospitalares'.
4. Detectar palavras associadas a doses, alteração de remédio, sintomas graves, emergência ou prognóstico e devolver encaminhamento à equipe/serviços de urgência, SEM diagnóstico ou instrução clínica individual. Evitar falsas respostas 'é seguro'.
5. Resposta com `answer`, `source='FAQ SuperPed — demonstração'`, `escalate`, `is_demo:true`. Sem chamadas para APIs pagas; sem inventar fontes médicas ou hospitalares.
6. Layout adequado a família e médico, com empty state e loading.
7. Se falta tempo, chat CRUD real tem prioridade; FAQ pode ser 8 perguntas/respostas determinísticas.

## Critérios de aceite verificáveis
- Responsável manda texto, médico vinculado lê e responde.
- Mensagens de outro paciente estão inacessíveis.
- FAQ responde dúvidas gerais e recusa/encaminha dúvidas clínicas pessoais.
- UI não apresenta FAQ como IA hospitalar validada.
- Nenhum custo externo ou dependência de API Key.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
