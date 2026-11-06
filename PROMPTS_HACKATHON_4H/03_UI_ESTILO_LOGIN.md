# PROMPT 03 — Identidade visual, landing e telas de login

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: transformar os protótipos Canva numa interface funcional e responsiva


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
- `frontend/src/styles/**`, `frontend/src/components/ui/**`, `frontend/src/components/layouts/**`, `frontend/src/pages/public/**`.
- Exportar `LandingPage`, `LoginPage`, `AdultLayout`, `ChildLayout`, `DemoBadge`; não alterar `router.tsx` nem cliente API.

## Implementação obrigatória, em ordem
1. Aplicar tokens exatos em CSS/Tailwind: azul #203774, azul noite #132653, vinho #941C2F, branco, preto, cinza-gelo. Fontes Montserrat/Open Sans/Nunito com fallback sem depender de CDN se indisponível.
2. Reproduzir direção de interface do Canva: [manual](https://www.canva.com/d/qhEadXuVjCz0PNh), [portal médico](https://www.canva.com/d/GdXiNy07riAWWpx), [família](https://www.canva.com/d/aEv5mPlyVjdZTbD), [infantil](https://www.canva.com/d/fJzcpra68rWeEit). Não tentar conectar à API do Canva nem copiar logotipos não fornecidos.
3. Landing com SuperPed, texto curto de proposta e cards de entrada: Sou profissional, Sou responsável, Espaço infantil, Desenvolvedor. Aviso acadêmico DEMONSTRAÇÃO sempre visível.
4. `LoginPage`: escolha perfil (profissional, responsável, dev), form e-mail/senha, mostrar/ocultar senha, erros reais, loading, acessibilidade. Botões de preenchimento rápido com contas fictícias somente em `VITE_DEMO_MODE=true` e sempre identificados como demo.
5. Layout médico: sidebar azul-noite desktop e drawer mobile; layout família cards menos densos; layout infantil com tipografia Nunito, botão pausar e chamar adulto.
6. Criar UI primitives Button, Input, Card, Modal, EmptyState, Loading, ErrorState, Badge; não usar dependências de UI complexas que atrasem.
7. Testar em 375px e 1440px, tab e contraste mínimo; não ocultar funcionalidades por overflow.

## Critérios de aceite verificáveis
- Quatro cartões de entrada e formulário funcional conectado via props/callbacks ao AuthProvider.
- Sidebar e mobile menu sem sobreposição/scroll horizontal.
- Tokens e fontes visíveis e acessíveis; `npm run build` passa.
- Componente de aviso DEMONSTRAÇÃO está em todas as áreas autenticadas.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
