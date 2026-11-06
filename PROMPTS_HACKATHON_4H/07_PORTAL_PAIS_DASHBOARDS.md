# PROMPT 07 — Portal família, registros e dashboards

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 35 minutos. Objetivo: dar aos responsáveis acompanhamento de rotina sem alegar monitoramento médico


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
- `frontend/src/pages/guardian/**`, `backend/app/routers/routines.py`, `backend/app/routers/mood.py`. Exportar páginas `GuardianDashboard`, `GuardianRoutinePage`, `GuardianMoodPage` e os dois routers FastAPI.

## Implementação obrigatória, em ordem
1. Página inicial: saudação e seletor apenas de pacientes vinculados, cards 'Como está hoje?', 'Próximo registro de medicamento', 'Água relatada', 'Alimentação registrada', botão 'Entrar no mundo da criança'.
2. Dashboard com Recharts de humores 7 dias (discretização informada), volume de água TOTAL relatado por dia e lista de refeições; dizer `Relatado pela família` e não `melhora do câncer`. Se não houver registro, mostrar 'Sem informação' e não zero inventado.
3. Formulários rápidos para água em ml e refeição por descrição, com carimbo data e autor. Possibilidade de edição futura não exigida.
4. Registros de humor podem ser informados na área da criança sob responsável autorizado; família pode criar relato também, cada um com `source` explícito.
5. APIs `/api/patients/{id}/routines` GET/POST e `/api/patients/{id}/moods` GET/POST. Validar score 1..7, quantity >=0, texto com limite, paciente vinculado e author do token (não confiar no ID do formulário).
6. Renderizar estados loading/vazio/erro e possível modo offline rotulado. Botões retornam feedback honesto de sucesso ou falha.
7. Linkar (sem reimplementar) componentes de medicamentos, chat, FAQ e jogos criados por outros agentes; fornecer placeholders de import para integração pelo orquestrador.

## Critérios de aceite verificáveis
- Responsável vê somente pacientes vinculados e muda entre eles.
- Cria água, refeição e humor e enxerga imediatamente o novo registro.
- Gráficos não confundem registros voluntários com progressão clínica.
- Não existe botão de alterar doses, estágio clínico ou cadastrar paciente.
- Mobile 375px funciona sem scroll horizontal.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
