# PROMPT 12 — PWA responsivo e companheiro por voz

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: permitir instalação web e voz infantil original sem mensalidade


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
- `frontend/src/features/child-voice/**`, `frontend/public/manifest.webmanifest`, `frontend/public/icons/**`, `frontend/src/components/common/**` (somente componentes próprios). Não editar router ou telas infantis dos colegas.

## Implementação obrigatória, em ordem
1. Criar `MascotVoice` com `window.speechSynthesis` e lista curta de falas originais: boas-vindas, incentivo sem cobrança, como pausar, pedir ajuda a um adulto; voz genérica do navegador, sem nome/imitacão de ator/personagem. Texto escrito sempre junto; botão reproduzir/parar áudio. Se speechSynthesis não suportado, texto disponível.
2. Entrada por voz usando `SpeechRecognition`/`webkitSpeechRecognition` **somente se suportada** e após consentimento explícito. Fallback em botões de perguntas pré-definidas: 'Pode brincar comigo?', 'Quero descansar', 'Quero falar com adulto'. Responder com textos determinísticos; nunca permitir conversa livre irrestrita com criança nem enviar gravação ao servidor.
3. Criar `manifest.webmanifest` com título SuperPed, theme_color #203774, display standalone, start_url `/`, ícones locais SVG/PNG originais. Instruir que instalação PWA depende do browser/HTTPS. Se implementar service worker, cache SOMENTE estáticos públicos, não cachear prontuários/respostas autenticadas.
4. Testar responsividade mobile (375px), tablet (768px) e desktop (1440px), alvos de 48px, teclado/foco, preferências de movimento. Não construir React Native/Capacitor nesta janela; PWA basta.
5. Garantir que áudio e câmera parem ao trocar de tela e permitir revogar permissões.
6. Documento curto de comportamento offline: se API indisponível, tela informa 'Modo de demonstração local' sem afirmar sincronização.

## Critérios de aceite verificáveis
- Texto + TTS funcionam em browser compatível; sem suporte há fallback.
- PWA tem manifest válido e ícones locais, sem asset pago.
- Fala não dá instruções clínicas, não usa vozes licenciadas.
- Browser sem SpeechRecognition continua totalmente utilizável.
- Mobile não apresenta elementos inacessíveis.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
