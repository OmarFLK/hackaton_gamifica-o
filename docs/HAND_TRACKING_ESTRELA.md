# Alcance as Estrelas — reconhecimento local de mãos

## Diagnóstico

O `StarGame.tsx` anterior chamava `useCamera` de `sensors.ts` apenas para exibir o vídeo. Não havia modelo de reconhecimento, inferência, landmarks, cursor ou colisão de mão. Só clicar na estrela incrementava o contador. O problema não era uma configuração do banco ou uma chave de API.

## Implementação

- `frontend/src/features/games/StarGame.tsx`: integra o reconhecimento ao jogo existente. Exibe câmera espelhada, cursor, estado da mão, estrela e pontuação. Mantém pausa, saída e toque no mesmo jogo.
- `frontend/src/features/games/hand/useHandTracking.ts`: permissão voluntária, vídeo preferencial de 640×480 sem áudio, carregamento local, `HandLandmarker` em `VIDEO`, duas mãos, GPU com tentativa por CPU. Inferência somente em frames novos, aproximadamente 18 vezes por segundo; reduz a frequência em aparelhos lentos. Encerra câmera, detector e RAF ao pausar, trocar de modo, sair, ocultar a aba ou ocorrer falha. Descarta permissões/modelos recebidos depois do cancelamento.
- `hand/coordinates.ts`: indicador (ponto 8) ou centro da palma, espelhamento único, recorte de `object-fit: cover`, pixels CSS e suavização EMA de 0,35. DPR altera somente o bitmap do canvas.
- `hand/collision.ts`: `idle → hovering → captured → cooldown`, permanência padrão de 200 ms, alternativas de 0/500 ms e troca de alvo após 400 ms. Duas mãos e eventos de toque duplicados continuam gerando um ponto por estrela. Perder/alternar a mão reinicia a permanência.
- `hand/hand.test.ts`: matemática e transições de captura.
- `frontend/src/styles/hand-tracking.css`: HUD, cursor, halo de colisão e ajustes responsivos. `GameShell.tsx` aceita rótulos específicos sem alterar os outros jogos.
- `frontend/public/models/hand_landmarker.task`: modelo oficial local, 7.819.105 bytes. Origem e SHA256 no README da mesma pasta.
- `frontend/scripts/copy-hand-runtime.mjs`: copia o WASM do pacote fixado `@mediapipe/tasks-vision@1.2.2` no `predev`/`prebuild`. As versões do pacote e dos arquivos servidos são verificadas antes de compilar.
- `frontend/scripts/build-offline.mjs`: cache local de modelo/WASM somente depois do uso; não aumenta o download inicial do login. Respostas da API permanecem fora do cache.
- `frontend/vercel.json`: entrega modelo/WASM como arquivos, sem reescrevê-los para o HTML da SPA.
- `frontend/vite.config.ts`: CSP `connect-src` permite a própria origem e a origem de `VITE_API_URL`. Bloqueia a telemetria externa automática do SDK antes da transmissão. A URL pública do backend é incorporada no build; nenhuma credencial nova é necessária.
- `scripts/smoke_hand_tracking.py`: teste de navegador com detector real e câmera sintética baseada em uma imagem pública oficial. Move a imagem dentro do vídeo, sem injetar landmarks nem clicar para capturar.

Nenhum vídeo, imagem ou landmark é gravado, enviado ao backend ou incluído em analytics. O resumo voluntário de sessão já existente continua enviando apenas jogo, modo e duração quando a pessoa clica em Terminar. Pontos e diagnóstico de mãos ficam na memória da tela.

## Executar e depurar

Na raiz:

```powershell
npm --prefix frontend ci
npm test
npm run build
npm --prefix frontend run preview
```

Abra `http://localhost:5174`, entre como responsável e abra **Mundo da criança → Estrela ao alcance → Ativar câmera**. O título do jogo é **Alcance as Estrelas**. Também funciona em **Apresentar sem API → Abrir apresentação offline**, navegando pelos links sem recarregar a sessão offline.

Para diagnóstico, acrescente `?handDebug=1` à rota `/crianca/1/jogos/star` antes de ativar a câmera. O painel mostra câmera/modelo, GPU/CPU, mãos, coordenadas CSS, alvo, sobreposição, estado e FPS. Desenha os 21 pontos somente quando a flag está ativa. Não existe registro persistente desses dados.

Em **Ajustes para brincar no seu ritmo**, escolha indicador/palma, tempo de permanência e margem de colisão de 15/20/30 px. A câmera é opcional; **Jogar com toque**, **Desligar câmera**, **Pausar** e **Voltar** permanecem disponíveis.

## Validação reproduzível

Resultado desta entrega: `npm run build` passou e `npm test` teve **28 testes aprovados**. No Edge, o modelo real reconheceu a imagem pública e capturou cinco estrelas sem cliques. Também passaram pausa/retomada, resize para 375 px, desligamento da câmera com continuidade por toque, permissão negada e câmera ausente. A rodada estendida foi encerrada a pedido do usuário para ele realizar a conferência manual. O cache offline foi corrigido após a rodada detectar que o primeiro WASM podia chegar antes do controle do service worker; essa correção e os cenários restantes do script precisam de nova execução. Não se declara aprovação da suíte estendida completa nem teste de webcam física.

```powershell
.venv/Scripts/python.exe scripts/smoke_hand_tracking.py
# Contra o site publicado:
.venv/Scripts/python.exe scripts/smoke_hand_tracking.py --base https://hackatongamifica-o.vercel.app
```

Requer Playwright, Edge e `httpx` no Python. A imagem pública de teste é obtida pelo script Python, fora do navegador do jogo, e fica apenas em `.runtime/hand-tracking`. O navegador reconhece a imagem com o modelo real. Não utiliza a webcam física. Relatórios e capturas de teste ficam nessa pasta ignorada pelo Git.

O build mantém o aviso já existente de chunk principal maior que 500 kB. O detector é carregado por importação dinâmica, e modelo/WASM são baixados ao ativar a câmera, sem CDN em runtime.

## Conferência manual que exige câmera física

1. Em HTTPS ou localhost, entre como responsável e abra o jogo. Confirme que nenhuma permissão é solicitada antes de **Ativar câmera**.
2. Permita a câmera. Com boa iluminação, mostre uma mão e espere o indicador verde **Mão encontrada!** e o cursor.
3. Mova a mão para sua direita: o cursor deve acompanhar a mão vista no vídeo espelhado. Teste os quatro cantos visíveis. Partes recortadas pelo vídeo não são artificialmente presas à borda.
4. Leve o indicador até o halo da estrela e mantenha por um instante. Confirme `+1`, um único ponto e outro alvo. Repita cinco vezes sem mouse/teclado. Teste duas mãos e alternância entre elas.
5. Retire a mão durante a aproximação e confira que a permanência reinicia. Experimente centro da palma e tempo maior se for mais confortável.
6. Gire o celular e redimensione a janela. Confirme alinhamento entre mão, cursor e estrela. Em aparelhos lentos, use toque se o reconhecimento ficar desconfortável.
7. Pause, retome, troque de aba, desligue a câmera e saia. Confirme pelo indicador do navegador que a webcam foi liberada. Teste também permissão negada e alternativa por toque.
8. Depois do primeiro carregamento completo, desligue a internet e reabra a câmera na mesma sessão de apresentação offline. Limpar o cache ou atualizar a versão exige baixar os arquivos novamente.

Não foi possível atestar iluminação, câmera física, desempenho térmico ou permissões reais de cada aparelho. A automação com viewport mobile não substitui teste em Android/iOS. Chrome/Edge atuais são a referência inicial; Safari e cada dispositivo precisam dessa conferência. Não há promessa de avaliação clínica por movimento.

## Fontes oficiais consultadas

- [Hand Landmarker para Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).
- [Referência JavaScript de HandLandmarker](https://developers.google.com/edge/api/mediapipe/js/tasks-vision.handlandmarker).
- [Pacote e modelos oficiais](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/tasks/web/vision/README.md).
- [Aviso de privacidade das Tasks](https://developers.google.com/edge/mediapipe/solutions/tasks#mediapipe_tasks_privacy_notice).
- [Esclarecimento oficial sobre bloquear telemetria no Web SDK](https://github.com/google-ai-edge/mediapipe/issues/6306).
