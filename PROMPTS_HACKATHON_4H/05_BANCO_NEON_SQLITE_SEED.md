# PROMPT 05 — Modelo de dados, Neon e seed local

> **Use este arquivo como instrução para um agente de programação.** Tempo máximo sugerido: 25 minutos. Objetivo: tornar o CRUD reprodutível sem serviços pagos ou dependência de nuvem


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
- `backend/app/models/**`, `backend/app/core/database.py`, `backend/app/seed.py`, `backend/tests/test_seed.py`.
- Não editar `app/main.py` nem routers de colegas. Modelos devem refletir contrato exatamente.

## Implementação obrigatória, em ordem
1. Usar SQLAlchemy 2.0 com models tipados e engine obtido de `DATABASE_URL`. Se não definido, usar `sqlite:///./superped_demo.db` (connect_args check_same_thread=False somente SQLite). Neon com `postgresql+psycopg://...?...` e TLS, segredo via env; não abrir connection pool enorme.
2. Criar entidades `User`, `Patient`, `PatientGuardian`, `MoodEntry`, `RoutineEntry`, `MedicationSchedule`, `MedicationEvent`, `Message`, `GameSession`; índices para patient_id, guardian_id e created_at. `times_json` mapeado para JSON compatível PostgreSQL/SQLite.
3. Criar Pydantic schemas de leitura/escrita consistentes; não serializar password_hash, notas clínicas para responsáveis nem histórico completo para developer.
4. Implementar seed idempotente (`python -m app.seed`), lê `seed/usuarios_demo.json` ou estrutura equivalente; apenas se `DEMO_MODE=true`; quatro contas fictícias com hash de senha, 3 pacientes, vínculos, registros de humor, água/refeição e medicações fictícias. Gerar datas relativas ao dia atual se quiser, mas os horários são locais de demonstração.
5. Inicializar tabelas com `Base.metadata.create_all` somente no MVP. Deixar observação: usar Alembic antes de qualquer piloto real. NÃO inserir dados do usuário ou arquivos médicos reais.
6. Verificar tanto SQLite local quanto Neon se DATABASE_URL disponível; seed não duplica ao rodar 2x. Incluir script simples reset_db apenas local sob flag.
7. Documentar variável DATABASE_URL para Render, sem colocar secrets em commit.

## Critérios de aceite verificáveis
- Seed local cria 4 perfis e 3 pacientes, sem duplicação.
- `python -m app.seed` executa sem erro no SQLite.
- `SELECT` e relacionamentos funcionam via sessão DB.
- Se Neon configurado, usa Neon sem mudar código.
- Nenhuma senha em plaintext persistida, apenas hash.

## Entrega do agente
- Código persistido, sem arquivos fictícios vazios, testes mínimos e integração documentada.
- Se o tempo acabar: entregue a rota/tela principal funcional em vez de escrever promessas.
