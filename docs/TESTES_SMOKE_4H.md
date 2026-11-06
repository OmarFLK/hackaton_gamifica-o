# Resultados reais — 06/11/2026

**Registro histórico da primeira etapa.** A validação atualizada com frontend/build/navegador está em [TESTES_MODULOS_10_18.md](TESTES_MODULOS_10_18.md).

Execução às aproximadamente 11:25 (São Paulo). Comando: `../.venv/Scripts/python -m pytest -q`, dentro de `backend`. Resultado: **48 passed em 31,80s**. SQLite em memória, TestClient e tokens reais gerados pelo login demo. Nenhum teste usa Neon ou serviços remotos.

| Verificação | Resultado | Evidência/limite | Severidade se falhar |
|---|---|---|---|
| Health e quatro logins | PASSOU | Login/me para médico, responsável, assistente e dev | P0 |
| Senha inválida, token ausente/inválido/expirado | PASSOU | Respostas 401 | P0 |
| Paciente fora do vínculo | PASSOU | GET/POST de agenda/eventos/chat negados a médico e responsável | P0 |
| Dev sem acesso aos pacientes | PASSOU | 403 para pacientes, agendas, eventos e chat | P0 |
| Assistente não altera agenda | PASSOU | POST/PUT negados; nenhuma delegação implícita | P0 |
| Criação/edição pelo médico | PASSOU | Horários normalizados e persistidos; horários inválidos 422 | P0 |
| Relato familiar e leitura pelo médico | PASSOU | Mesmo evento consultado por sessões distintas | P0 |
| Três estados e histórico de correções | PASSOU | given/not_given/postponed; registros imutáveis separados | P0 |
| Agenda de outro paciente | PASSOU | POST evento e PUT agenda 403 | P0 |
| Autoria e data servidor | PASSOU | Autores derivados da sessão; campos extras de autoria 422 | P0 |
| Timezone da ocorrência | PASSOU | Offset obrigatório, HH:MM validado, UTC persistido | P0 |
| Mensagens família/equipe | PASSOU | Troca entre duas sessões, texto vazio/autor forjado 422 | P0 |
| FAQ e encaminhamento | PASSOU | Oito tópicos gerais e oito exemplos clínicos/de tentativa de instrução | P0 |
| Status dev sem dados pessoais | PASSOU | Campos restritos a api/demo/modules/version | P0 |
| CORS | PASSOU | Origem configurada aceita; origem arbitrária negada | P0 |
| Seed e hashes | PASSOU | Duas reinicializações não duplicam; Argon2; sem seed fora de demo | P0 |
| Build/TypeScript frontend | NÃO TESTADO | Interface do outro dev ainda não recebida; kit isolado | P0 |
| Navegador em 375/768/1440px e teclado | NÃO TESTADO | Aguardar frontend e integração | P0 |
| Lembrete 10s e navegador aberto | NÃO TESTADO | Componente preparado; não executado em browser | P0 |
| Voz, permissões e PWA | NÃO TESTADO | Implementação aguarda base visual | P1 |
| Portais, água, humor e três jogos | NÃO TESTADO | Módulos 00–09 fora desta implementação | P0 |
| Demo completa ponta a ponta | NÃO TESTADO | Depende do código do outro dev | P0 |
| Neon/Render/Vercel e persistência remota | NÃO TESTADO | Deploy não executado | P0 |
| Contingência visual offline | NÃO TESTADO | Fixtures prontas, navegação ainda não integrada | P0 |

Houve dois avisos da infraestrutura: Starlette depreca o uso de httpx no TestClient desta versão; pytest não conseguiu criar seu cache no sandbox. Nenhum deles falhou testes. O comando documentado usa `-p no:cacheprovider` para dispensar o cache. Reavaliar a compatibilidade de TestClient ao atualizar dependências.

Essa suíte valida o escopo implementado, não certifica segurança clínica, cobertura de toda linguagem clínica ou funcionamento do produto completo.
