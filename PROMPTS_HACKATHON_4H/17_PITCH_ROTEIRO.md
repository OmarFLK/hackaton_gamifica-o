# PROMPT 17 — Pitch, roteiro de apresentação e plano de backup

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 15 minutos. Objetivo: contar uma história de cuidado e provar MVP real em 3–5 minutos


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
- `docs/PITCH_3_MINUTOS.md`, `docs/ROTEIRO_DEMO.md` e `docs/PLAN_B_APRESENTACAO.md`; não editar código.

## Implementação obrigatória, em ordem
1. Fazer pitch de 3 minutos: (i) problema da adesão/acolhimento durante tratamentos longos, (ii) solução com personagens lúdicos e pais/médicos conectados, (iii) stack 100% gratuita e MVP, (iv) segurança e próximas fases.
2. Demo guiada de 2 minutos: login médico -> paciente fictícia Nina -> medicamento -> login responsável -> registro de água/confirmar medicação -> entrar como criança -> escolher Pandi -> rosto emocional -> jogar vela ou pássaro -> voz original -> dashboard clínico atualizado.
3. Mostrar claramente que jogos são atividades lúdicas voluntárias, não terapia médica validada; relatório de água/humor é relato, não evolução oncológica; notificação é simulada enquanto o app aberto; FAQ não é IA hospitalar.
4. Inserir divisão por disciplinas do hackathon: saúde valida abordagem clínica futura, tecnologia desenvolve produto, negócios apresenta distribuição B2B futuro, design mantém marca e acessibilidade. Sem alegar parceria formal aprovada além do briefing.
5. Criar lista de perguntas difíceis do júri: custo, segurança LGPD, acesso restrito, autenticidade dos alarmes, limitação do microfone/câmera, proteção das marcas, como ampliar.
6. Plano B: abas pré-abertas, dados seed, PDF/screenshot do produto, app local, alternar para toque se hardware negar permissão. Nunca fingir backend online se offline.
7. Evitar estatísticas inventadas de sobrevida/adesão; focar demonstrações concretas.

## Critérios de aceite verificáveis
- Há script que pode ser lido por apresentador em 3 minutos.
- Demonstração tem sequência testável com dados falsos.
- Plano B cobre Render dormindo/internet indisponível.
- Diferença demo versus produto clínico real é explícita.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
