# CHECKLIST EXECUTIVO — SUPERPED MVP 4 HORAS

## 00:00–00:30 — fundação
- [ ] Git criado, apenas 1 contrato de API, app React inicial e backend `/api/health` 200
- [ ] Seed fake definido, roles, paleta e rotas congeladas
- [ ] Agentes divididos por pastas/branches distintas

## 00:30–02:00 — desenvolvimento paralelo (90min)
- [ ] Médico: lista de pacientes, ficha, cadastro
- [ ] Família: dash, água, alimento, humor
- [ ] Criança: mascote, check-in, pelo menos 2 games toque
- [ ] Banco: autenticação JWT/seed/SQLite e Neon se disponível
- [ ] Medicamentos: calendário, confirmação e simular alarme
- [ ] Chat/FAQ/voz quando não atrasar P0

## 02:00–03:00 — integração (60min)
- [ ] Login médico real
- [ ] Create patient -> família vê paciente
- [ ] Família registra água -> médico vê
- [ ] Família registra medicação relatada -> médico vê
- [ ] Criança joga e registra humor via perfil autorizado
- [ ] Sem permissões indevidas, build e pytest smoke

## 03:00–03:30 — deploy (30min)
- [ ] Neon Free (ou SQLite local para demo), Render Free, Vercel Hobby
- [ ] Verificar CORS, envs, 404 em rotas React
- [ ] Se deploy falhar, manter modo local

## 03:30–04:00 — apresentação (30min)
- [ ] Testar demo completa com cronômetro
- [ ] Pré-abrir URLs e versão local, verificar aparelho/mic/câmera
- [ ] Não usar dados reais nem afirmar validação clínica
- [ ] Ter screenshot ou vídeo curto gravado como último recurso
- [ ] Freeze de features e foco exclusivo na apresentação

## Pontos de corte se atrasar
1. Primeiro remover speech-to-text e câmera; usar toque.
2. Depois remover chat persistente; manter FAQ fixa.
3. Depois remover área dev complexa; manter status minimalista.
4. Depois simplificar dashboards, mas NUNCA dispensar autenticação/vínculo no backend.
5. Se backend não estiver pronto, criar demo front honesta rotulada offline; não apresentar como integrado.
