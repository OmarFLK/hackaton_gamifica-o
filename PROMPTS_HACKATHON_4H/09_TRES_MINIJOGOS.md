# PROMPT 09 — Minijogos vela, pássaro e estrela

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 35 minutos. Objetivo: três jogos simples controlados por toque e, quando possível, microfone/câmera


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
- `frontend/src/features/games/**`, `backend/app/routers/games.py`; exportar `CandleGame`, `BirdGame`, `StarGame` e router API.
- Não mexer em páginas infantis de outro agente; elas vão importar seus exports.

## Implementação obrigatória, em ordem
1. **Vela tranquila**: SVG/Canvas com vela animada. Botão 'Soprar' por toque faz chama diminuir suavemente até apagar; botão 'Usar microfone' opcional com `getUserMedia({audio:true})` e amplitude RMS simplificada da Web Audio API; a amplitude é só sinal interativo, não mensuração respiratória. Botão 'Pausar'/'Sair'.
2. **Pássaro das nuvens**: minijogo de desviar de obstáculos inspirado em mecânica genérica, arte original sem Flappy Bird; controle por toque/space para subir; microfone opcional controla a mesma ação por volume, calibragem simples, reiniciar. Limitar FPS e espaço de falha sem 'perdeu por doença'.
3. **Estrela ao alcance**: cenário SVG/Canvas com estrela que aparece em pontos da tela; toque/click captura. Modo câmera opcional: solicitar permissão e mostrar câmera com overlay, usuário toca na estrela; NÃO afirmar que IA detecta mão/objeto — detecção de pose/AR real fica para futura fase. No navegador sem câmera, fallback toque com 1 clique.
4. Todas as telas: pausa, sair, opção sem permissão, explicação de que são brincadeiras voluntárias, desativar sensores ao desmontar componentes, reduzir movimento se configurado.
5. `POST /api/patients/{id}/games`: `game`, `mode`, `duration_seconds` ao finalizar, somente sessão adulta vinculada. Se API offline, resumo de jogo em memória e etiqueta 'Não sincronizado'.
6. TTS opcional não obrigatório aqui; agente de voz cuida de `speechSynthesis`.
7. Sem instalação Phaser, Three.js, MediaPipe ou TensorFlow nesta entrega: usar React + CSS + Canvas API nativa para poupar tempo.

## Critérios de aceite verificáveis
- Cada jogo é jogável apenas tocando/clique, mesmo sem sensores.
- Microfone é opcional e encerrado ao sair; câmera opcional e não envolve falsa detecção de objeto.
- Nenhum jogo dá diagnóstico, terapia ou recomenda esforço.
- Sessão salva no backend ou fica claramente em modo offline.
- Build TS passa.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
