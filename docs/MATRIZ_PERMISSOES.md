# RBAC — REGRAS MÍNIMAS DE SEGURANÇA

| Ação | Médico | Assistente delegada | Família vinculada | Criança assistida | Dev |
|---|---|---|---|---|---|
| Listar pacientes no próprio escopo | Sim | Restrito | Só vinculados | Não | Não |
| Criar cadastro paciente | Sim | Sim (administrativo) | Não | Não | Não |
| Vincular família | Sim | Sim (delegado) | Não | Não | Não |
| Alterar diagnóstico/estágio | Sim (demo) | Não | Não | Não | Não |
| Criar prescrição/programação | Sim (demo) | Não | Não | Não | Não |
| Relatar medicamento administrado | Sim (com autor) | Não | Sim | Não | Não |
| Registrar água e refeição | Sim (com fonte) | Conforme autorização | Sim | Não | Não |
| Escolher personagem e jogo | Visualizar demo | Não | Assistir | Sim, via sessão de responsável | Só preview sem dados |
| Registrar humor infantil | Ver | Ver restrito | Assistir | Sim, pela sessão autorizada | Não |
| Chat familiar-equipe | Sim | Autorizado | Sim | Não | Não |
| Métricas técnicas agregadas | Não | Não | Não | Não | Sim |

**Backend verifica role + vínculo em cada endpoint por patient_id**, inclusive PUT/POST/GET. Não basta esconder o botão no React. Dados clínicos sempre mockados. Isso não substitui governança/autorização LGPD para um produto futuro.
