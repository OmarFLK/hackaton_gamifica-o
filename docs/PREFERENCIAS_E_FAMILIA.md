# Preferências e novos registros da família

Atualização de 06/11/2026.

- Cabeçalhos adulto, infantil, landing e login: botão do narrador com 🗣️ e X quando desligado; botão de modo claro/escuro. Preferências persistem neste navegador e acompanham a navegação e troca de conta no aparelho. O narrador começa desligado. Desligar cancela a fala atual e bloqueia novas falas do app; não desliga o microfone de ditado.
- Médico: menu **Novo responsável** (`/medico/responsaveis/novo`), nome, e-mail, senha e confirmação. Senha mínima de 12 caracteres; hash Argon2 no backend, nunca devolvida pela API. Contas novas usam a tela de login normal; não são adicionadas aos botões de contas demo. A conta sem vínculo não acessa criança alguma.
- Cadastro de paciente e ficha: **Cadastrar novo responsável** cria a conta e a seleciona. No cadastro, o vínculo é salvo ao finalizar o paciente; na ficha existente, clicar em **Vincular** depois de criar a conta.
- Peso (kg) e altura (cm): disponíveis no cadastro e na aba **Revisão clínica**, editáveis apenas pelo médico responsável. Valores inválidos são rejeitados. Campos não enviados numa revisão permanecem preservados.
- Família > **Água e refeições**: novo bloco **Anotações gerais**, com até 2.000 caracteres. As anotações são registros da rotina, com autor da sessão e horário. Não alteram notas clínicas. O médico lê os relatos dos últimos sete dias no resumo da ficha.
- **Registros recentes**: até 200 registros retornados pela API, com altura limitada e rolagem dentro do bloco; não estica a tela com todo o histórico. Funciona também pelo teclado. Mudanças de paciente descartam respostas atrasadas da criança anterior.

## Banco e segurança

Adicionadas apenas duas colunas opcionais FLOAT em `patients`: `weight_kg`, `height_cm`. Nenhuma tabela ou registro foi removido. A migração aditiva é idempotente em SQLite e PostgreSQL.

Antes da migração foi criada a branch Neon `pre-family-updates-20261106` (`br-misty-mud-beohkdqx`), sem compute, com expiração em 13/11/2026. A atualização de produção usou TLS e a conexão direta; as contagens foram conferidas antes/depois.

Novo endpoint: `POST /api/guardians`, somente `CLINICIAN`; normaliza e-mail, rejeita duplicatas e campos extras, nunca permite escolher o perfil via formulário. `POST /api/patients/{id}/routines` passa a aceitar `kind=note` dentro do mesmo escopo de vínculo da água e refeição. O dashboard retorna `general_notes` separado de `meal_entries`.

## Verificação

- 126 testes backend aprovados, incluindo novas permissões, senha, e-mail duplicado, medidas e notas por vínculo.
- 17 testes frontend aprovados e build TypeScript/Vite aprovado.
- `scripts/smoke_family_updates.py`: sete verificações completas no Edge, incluindo cadastro real via modal, vínculo, edição de medidas, leitura pelo médico, rolagem interna, persistência das preferências e telas em 375px sem rolagem horizontal. A fala é interceptada no teste para contar chamadas, sem emitir som.
- Capturas e relatório local em `.runtime/family-updates/`.

Reexecutar em produção (cria somente registros fictícios):

```powershell
.venv/Scripts/python.exe scripts/smoke_family_updates.py --base https://hackatongamifica-o.vercel.app --api-url https://pendi-demo-api.onrender.com
```

Voz para texto, câmera opcional, limites do Render Free e funcionamento das notificações permanecem descritos no [guia de deploy](DEPLOY_GRATUITO.md).
