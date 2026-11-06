# Pendi — roteiro de 3 minutos

**Nota ao apresentador:** os módulos complementares possuem interface e API integradas, com medicamentos, chat, FAQ, companhia por voz/botões, status e contingência. Os portais completos, rotinas e jogos 00–09 ainda aguardam o outro dev. Ajustar as cenas do pitch ao estado mostrado em `STATUS_4H.md`.

**0:00–0:40 — contexto**

Durante um tratamento longo, famílias precisam organizar a rotina e encontrar formas acolhedoras de acompanhar a criança. A proposta do Pendi é reunir atividades lúdicas voluntárias, registros da família e comunicação com a equipe num mesmo ambiente. Esta é uma demonstração acadêmica com dados inteiramente fictícios, sem validação clínica.

**0:40–1:25 — experiência proposta**

A criança participa com um responsável, escolhe um companheiro original e pode registrar como se sente ou brincar por toque. Ela pode pausar e pedir ajuda a qualquer momento. A família acompanha horários fictícios de medicamentos e registra o que relata ter acontecido. A equipe vinculada consulta esses registros e conversa pelo chat. Um alerta é apenas um lembrete; a administração exige um relato separado. Humor e jogos não estimam evolução do câncer.

**1:25–2:10 — demonstração e tecnologia**

Na demonstração, mostramos somente os fluxos já integrados e testados. A API utiliza FastAPI e SQLAlchemy, com SQLite para execução local e configuração PostgreSQL para hospedagem. A interface utiliza React e Vite. O projeto está preparado para serviços gratuitos, sujeito aos limites das contas. A FAQ usa respostas estáticas; não há IA treinada com prontuários nem chamada a API paga. A voz usa síntese genérica do navegador, com texto sempre disponível. O reconhecimento de voz é opcional, com consentimento e alternativas por botões.

**2:10–2:45 — acesso e limites**

O servidor verifica perfil e vínculo a cada acesso. Um responsável não acessa outra família; o desenvolvedor recebe somente status técnico sintético. O chat não é canal de emergência. Lembretes dependem da página aberta e não prometem entrega com o aplicativo fechado. Todos os medicamentos e registros desta apresentação são fictícios.

**2:45–3:00 — próximos passos**

Saúde deverá avaliar a abordagem antes de qualquer piloto; tecnologia conecta e testa os fluxos; design cuida de acessibilidade; negócios explora distribuição institucional futura. Qualquer uso real dependeria de governança, proteção de dados e validação. Hoje apresentamos a viabilidade técnica de um protótipo acadêmico, sem alegar parceria formal aprovada.

## Perguntas do júri

- **É tratamento ou ferramenta validada?** Não. São atividades voluntárias e organização de relatos num protótipo.
- **Quanto custa?** A configuração usa planos gratuitos; limites e disponibilidade devem ser conferidos antes da publicação.
- **E LGPD?** A demo não usa dados reais. Um produto real exigiria avaliação jurídica, consentimento apropriado, governança e controles adicionais.
- **O alarme funciona com o app fechado?** Não há essa garantia. Há aviso com a página aberta e simulação identificada.
- **Microfone/câmera são obrigatórios?** Não. Deve existir alternativa por toque; disponibilidade depende do navegador.
- **A voz é de personagem conhecido?** Não. Apenas voz genérica do navegador e falas originais.
- **O dev pode ver prontuários?** Não. Apenas o status técnico sintético, com autorização no servidor.
