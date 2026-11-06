# Demo guiada — 2 minutos após integração

**Ainda não executada:** interface e módulos 00–09 estão com outro dev. As etapas dependentes aparecem explicitamente abaixo. Não apresentar este roteiro como teste aprovado.

| Tempo | Cena | Dependência/estado |
|---|---|---|
| 0–15s | Login médico, abrir Nina fictícia | Login/lista na bancada disponíveis por API; portal 06 pendente |
| 15–35s | Consultar/criar horário fictício de Medicamento A | API 10 testada; integrar componente de agenda |
| 35–55s | Login responsável, registrar relato de administração | API 10 testada; integração visual pendente |
| 55–65s | Exibir histórico com autor e hora; enviar mensagem | APIs 10/11 testadas; telas pendentes |
| 65–75s | Registrar água | Módulo 07, outro dev; remover cena se ainda ausente |
| 75–95s | Entrar como criança, escolher Pandi e humor | Módulo 08, outro dev; remover cena se ainda ausente |
| 95–110s | Vela ou pássaro por toque; voz original opcional | Módulos 09/12 pendentes; não simular como pronto |
| 110–120s | Voltar ao médico e conferir o relato | Leitura compartilhada testada via API; navegação pendente |

Antes do ensaio: usar só contas `@superped.demo` com senha fictícia do seed, verificar origem CORS, não abrir `.env` em público, confirmar banco persistente se hospedado. O botão de simulação do lembrete deve anunciar claramente que é uma simulação de 10 segundos.

## Demo disponível agora, sem interface

Com a API local em execução, abrir `http://127.0.0.1:8000/docs`, autenticar usando o token obtido em `/api/auth/login`, consultar a agenda, criar um relato, consultar histórico por outra conta vinculada e trocar mensagens. Esse é um percurso técnico; não equivale ao teste manual do produto completo.
