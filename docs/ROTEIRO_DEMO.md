# Pendi — demo guiada dos módulos complementares

**Executado no navegador:** médico cria agenda, família registra relato, ambos leem mensagens, FAQ encaminha questão clínica, criança usa companhia por botões, dev vê somente status, e contingência funciona sem internet. Os módulos 00–09 continuam com o outro dev.

## Percurso disponível agora (2 minutos)

1. **0–20s:** abrir http://127.0.0.1:5174, preencher conta Médico e entrar. Nina é selecionada pela bancada de leitura. Criar programação fictícia ou consultar a agenda existente.
2. **20–45s:** sair, entrar com Família, selecionar uma ocorrência e registrar um relato. Mostrar autor e horário no histórico. A notificação é apenas um lembrete; não equivale a administração.
3. **45–65s:** em Mensagens, enviar texto fictício. Em Dúvidas frequentes, consultar uma questão de uso e demonstrar que uma pergunta sobre dose é encaminhada, sem orientação individual.
4. **65–90s:** abrir “Conhecer o Pandi”, escolher “Quero descansar” e mostrar que os botões funcionam sem microfone. Reproduzir voz somente se disponível; chamar adulto é uma ação local, não um alerta remoto.
5. **90–110s:** voltar ao adulto, mostrar o botão de simulação de 10 segundos e o aviso identificado. Sair e entrar como Dev para mostrar status sem pacientes.
6. **110–120s:** sair e abrir “Apresentar sem API”; mostrar o aviso offline e os botões de gravação desabilitados.

## Percurso futuro com os módulos 00–09

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

## Alternativa técnica via API

Com a API local em execução, abrir `http://127.0.0.1:8000/docs`, autenticar usando o token obtido em `/api/auth/login`, consultar a agenda, criar um relato, consultar histórico por outra conta vinculada e trocar mensagens. Esse é um percurso técnico; não equivale ao teste manual do produto completo.
