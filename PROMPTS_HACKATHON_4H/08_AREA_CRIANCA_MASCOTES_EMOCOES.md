# PROMPT 08 — Área infantil, sete mascotes e emoção

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 30 minutos. Objetivo: criar experiência acolhedora sem uso de marcas famosas ou acesso a dados clínicos


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
- `frontend/src/pages/child/**`; exportar `ChildHomePage`, `AvatarPickerPage`, `EmotionCheckinPage` e tema/AvatarProvider se necessário. Não mexer nos jogos em `features/games/`.

## Implementação obrigatória, em ordem
1. Tela inicial da criança (acesso derivado da sessão do responsável ou kiosk demo explícito) com nome fictício, mascote ativo, `Como estou hoje?`, `Minhas aventuras`, `Conversar` e botão fixo 'Chamar adulto' e 'Sair'. Sem qualquer diagnóstico, estágio, medicamento ou dado de prontuário.
2. Seletor visual dos 7 mascotes originais: Arco (céu/constelações), Guarda-Lua (luz), Faísca (energia), Pinta (jardim), Pipo (animal), Niva (neve, opção lenço), Pandi (panda neutro). Criar ilustrações simples originais com SVG/CSS ou emojis apropriados, não depender de imagens pagas; não usar Homem-Aranha/Batman/Elsa/Sonic/Ladybug/Mickey nem suas vozes.
3. Cada mascote define tokens infantis secundários (gradiente/cenário, iconografia, tom de fala) sem alterar tokens institucionais. Se seleção só persiste no navegador, rotular 'preferência guardada neste dispositivo'; backend persist opcional em interface contratada.
4. Check-in de sete estados ilustrados com a FACE do mascote escolhida: 7 radiante, 6 muito feliz, 5 feliz, 4 neutro, 3 não tão bem, 2 muito mal, 1 muito triste; textos neutros, sem 'errado', botão pular e 'quero chamar um adulto'. Salvar por `POST /api/patients/{id}/moods` com `source=CHILD` sob sessão adulta.
5. Acessibilidade: texto com apoio sonoro opcional, targets grandes, microinterações discretas, prefers-reduced-motion, sem contagem regressiva ou punições.
6. Na home, exibir cards que abrem jogos exportados pelo outro agente. Se jogo não estiver pronto, placeholder honesto 'Em preparação' e nunca botão inerte.

## Critérios de aceite verificáveis
- Área infantil não exibe dados de câncer, medicamentos ou prontuário.
- Todos os 7 mascotes têm representação e rosto emocional coerente.
- É possível entrar no mundo, selecionar mascote, registrar sentimento e voltar ao adulto.
- Tema pode ser alterado sem reconstruir layout.
- Teclado e toque funcionam.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
