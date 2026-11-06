# PROMPT 15 — Smoke tests e controle de acesso

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 20 minutos. Objetivo: não apresentar ao júri app quebrado ou sem autenticação segura


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
- `backend/tests/**`, `frontend/src/**/*.test.*` se disponíveis, `docs/TESTES_SMOKE_4H.md`.
- Evitar refatorar módulos de outros agentes; registrar defeitos com prioridade e pedir correção ao dono.

## Implementação obrigatória, em ordem
1. Testar 4 logins (médico, responsável, assistente, developer), login inválido 401, URL protegida, logout.
2. Testar IDOR: responsável A não vê paciente não vinculado; médico sem vínculo 403; dev não pode consultar pacientes, chat e meds; assistente não altera prescrição.
3. Verificar backend GET health, listar pacientes, criar paciente e vínculo, registrar mood 1..7, água, refeição, evento medicação, chat, FAQ, games.
4. Testar UX em 375, 768, 1440px; sem scroll horizontal; checar usabilidade por teclado e botões sair/pausar dos 3 jogos.
5. Validar que telas públicas exibem DEMONSTRAÇÃO, que medicamentos não prescrevem, que assistente se identifica como FAQ e que dados são fictícios.
6. Quando render estiver dormindo, simular splash de carregamento e fallback claro. Desconectar internet e verificar modo contingência rotulado.
7. Criar tabela PASSOU/FALHOU/NÃO TESTADO com passos, hora e severidade. Não escrever PASSOU sem executar. Gerar casos rápidos automatizados `pytest` quando possível.

## Critérios de aceite verificáveis
- `docs/TESTES_SMOKE_4H.md` lista resultados reais.
- Nenhum acesso cruzado identificado.
- `npm run build` final sem erro.
- Demo end-to-end concluída pelo menos uma vez.
- Defeitos P0 remanescentes são declarados honestamente.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
