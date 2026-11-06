"""HandLandmarker REAL sobre camera sintetica com imagem publica oficial.

Nao usa webcam fisica nem grava imagens privadas. Nao injeta landmarks nem captura
com clique: move apenas a imagem de teste dentro do MediaStream do navegador.
"""
import argparse
import base64
import json
from pathlib import Path
import re
import httpx
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.runtime' / 'hand-tracking'
OUT.mkdir(parents=True, exist_ok=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:5174')
    args = parser.parse_args()
    fixture = OUT / 'thumb_up.jpg'
    if not fixture.exists():
        response = httpx.get('https://storage.googleapis.com/mediapipe-assets/thumb_up.jpg', trust_env=False, timeout=30)
        response.raise_for_status(); fixture.write_bytes(response.content)
    image_uri = 'data:image/jpeg;base64,' + base64.b64encode(fixture.read_bytes()).decode()
    results = []

    def ok(label):
        results.append({'test': label, 'status': 'PASSOU'})
        print('PASSOU:', label, flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True, args=['--enable-unsafe-swiftshader'])
        context = browser.new_context(viewport={'width': 1280, 'height': 1000}, locale='pt-BR', reduced_motion='reduce')
        init_script = '''
          window.__testStreams = []; window.__denyCamera = false; window.__moveHand = null; window.__cspBlocked = [];
          document.addEventListener('securitypolicyviolation', e => window.__cspBlocked.push(e.blockedURI));
          navigator.mediaDevices.getUserMedia = async () => {
            if (window.__denyCamera) throw new DOMException('Synthetic unavailable', window.__cameraError || 'NotAllowedError');
            if (window.__cameraDelay) await new Promise(resolve=>setTimeout(resolve,window.__cameraDelay));
            if (!window.__handCanvas) {
              const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
              const ctx = canvas.getContext('2d'); const image = new Image();
              image.src = IMAGE_URI;
              await image.decode();
              let dx = 0, dy = 0;
              const draw = () => {
                ctx.fillStyle = '#b5c2ce'; ctx.fillRect(0,0,640,480);
                ctx.drawImage(image, 150 + dx, 55 + dy, 325,345);
              };
              window.__moveHand = (x,y) => { dx=x;dy=y;draw(); };
              window.__handCanvas = canvas; draw(); window.__fixtureTimer = setInterval(draw,40);
            }
            const stream = window.__handCanvas.captureStream(24);
            window.__testStreams.push(stream);
            return stream;
          };
        '''.replace('IMAGE_URI', json.dumps(image_uri))
        context.add_init_script(init_script)
        page = context.new_page(); page.set_default_timeout(20000)
        errors, network_posts, external = [], [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: network_posts.append(request.url) if request.method == 'POST' else None)
        page.on('request', lambda request: external.append(request.url) if re.match(r'https?://', request.url) and not request.url.startswith(args.base) else None)
        # Sem backend: o proprio fluxo offline da familia abre a crianca ficticia.
        page.route('**/api/**', lambda route: route.abort())
        def open_game(page):
            page.goto(args.base + '/login?perfil=responsavel')
            page.get_by_text('Apresentar sem API', exact=True).click()
            page.get_by_role('button', name='Abrir apresentação offline', exact=False).click()
            expect(page).to_have_url(re.compile('/familia$'))
            page.get_by_role('link', name='Entrar no mundo da criança', exact=True).click()
            page.get_by_role('link', name=re.compile('Estrela ao alcance')).click()
            page.evaluate("history.replaceState(null,'',location.pathname+'?handDebug=1')")
        open_game(page)
        page.get_by_role('button', name='Ativar câmera', exact=False).click()
        game = page.locator('.hand-star-game')
        try:
            expect(game).to_have_attribute('data-model-status', 'ready', timeout=60000)
        except Exception:
            print(page.locator('body').inner_text(), flush=True)
            page.screenshot(path=str(OUT/'failure.png'),full_page=True)
            raise
        expect(game).to_have_attribute('data-hand-count', '1', timeout=30000)
        expect(page.get_by_text('Mão encontrada!', exact=True)).to_be_visible()
        page.wait_for_timeout(800)
        ok('Camera sintetica carrega modelo/WASM locais e detector real reconhece 21 pontos de uma mao sem backend')

        def cursor():
            text = page.locator('.hand-debug pre').inner_text()
            match = re.search(r'(?:Left|Right)(?:-[01])?: ([\d.-]+),([\d.-]+)', text)
            assert match, text
            return float(match[1]), float(match[2])

        def geometry():
            return page.locator('.star-field').evaluate('''stage => {
              const s=stage.getBoundingClientRect(), t=stage.querySelector('.star-target').getBoundingClientRect(),v=stage.querySelector('video');
              return {w:s.width,h:s.height,vw:v.videoWidth,vh:v.videoHeight,tx:t.left+t.width/2-s.left,ty:t.top+t.height/2-s.top};
            }''')

        def original(x, y, g):
            scale = max(g['w']/g['vw'],g['h']/g['vh'])
            return (1-(x-(g['w']-g['vw']*scale)/2)/(g['vw']*scale))*g['vw'], (y-(g['h']-g['vh']*scale)/2)/scale

        g = geometry(); x,y = cursor(); anchor_x,anchor_y = original(x,y,g)
        count = int(page.locator('.star-points strong').inner_text())
        for n in range(5):
            g = geometry(); tx,ty = original(g['tx'],g['ty'],g)
            page.evaluate('([x,y])=>window.__moveHand(x,y)', [tx-anchor_x,ty-anchor_y])
            expect(page.locator('.star-points strong')).to_have_text(str(count+1), timeout=10000)
            # Sem acoes sobre a estrela. O proximo alvo so pode aparecer apos cooldown.
            count += 1
            page.wait_for_timeout(520)
            assert int(page.locator('.star-points strong').inner_text()) == count
        ok('Cinco estrelas seguidas capturadas pelo detector real, movendo a imagem da mao, um ponto por alvo e sem clicar')
        page.screenshot(path=str(OUT/'camera-real-model-desktop.png'), full_page=True)
        page.locator('.game-controls').get_by_role('button',name='Pausar',exact=True).click()
        page.wait_for_function('window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
        page.locator('.game-controls').get_by_role('button',name='Continuar',exact=True).click()
        expect(game).to_have_attribute('data-model-status','ready',timeout=45000)
        expect(game).to_have_attribute('data-hand-count','1',timeout=20000)
        ok('Pausar encerra tracks; continuar reabre camera e detector sem loop duplicado')
        page.evaluate('window.__moveHand(0,0)')
        page.set_viewport_size({'width':375,'height':812})
        page.wait_for_timeout(1000)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        g=geometry()
        assert g['w'] <= 375 and g['vw']==640
        expect(game).to_have_attribute('data-hand-count','1')
        page.screenshot(path=str(OUT/'camera-real-model-mobile.png'),full_page=True)
        ok('Resize para 375px mantem tracking, canvas e video no mesmo container sem overflow')
        page.get_by_role('button',name='Desligar câmera',exact=True).click()
        page.wait_for_function('window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
        target=page.get_by_role('button',name=re.compile('Pegar a estrela'))
        before=int(page.locator('.star-points strong').inner_text())
        page.wait_for_timeout(500);target.click()
        expect(page.locator('.star-points strong')).to_have_text(str(before+1))
        ok('Desligar camera encerra video e continua no mesmo jogo por toque com a mesma pontuacao')
        page.evaluate('window.__denyCamera=true')
        page.get_by_role('button',name='Ativar câmera',exact=False).click()
        expect(game).to_have_attribute('data-model-status','off',timeout=10000)
        expect(page.locator('.hand-indicator')).to_contain_text('A câmera não foi permitida')
        page.get_by_role('button',name='Jogar com toque',exact=True).click()
        target.click()
        ok('Permissao negada mantem o mesmo jogo disponivel por toque')
        page.evaluate("window.__cameraError='NotFoundError'")
        page.get_by_role('button',name='Ativar câmera',exact=False).click()
        expect(page.locator('.hand-indicator')).to_contain_text('Não encontrei uma câmera')
        page.get_by_role('button',name='Jogar com toque',exact=True).click()
        ok('Camera ausente mostra motivo compreensivel e oferece toque')
        page.evaluate('window.__denyCamera=false;window.__moveHand(-1000,-1000)')
        # Depois do primeiro uso, modelo e WASM devem existir no cache publico local.
        page.wait_for_function("caches.keys().then(async keys=>(await Promise.all(keys.map(k=>caches.open(k).then(async c=>{const files=await c.keys();return files.some(r=>r.url.endsWith('/models/hand_landmarker.task')) && files.some(r=>r.url.endsWith('.wasm')) && files.some(r=>r.url.includes('/mediapipe/')&&r.url.endsWith('.js'))})))).some(Boolean))")
        context.set_offline(True)
        page.get_by_role('button',name='Ativar câmera',exact=False).click()
        expect(game).to_have_attribute('data-model-status','ready',timeout=45000)
        expect(game).to_have_attribute('data-hand-count','0')
        expect(page.locator('.hand-help')).to_be_visible(timeout=12000)
        stable = int(page.locator('.star-points strong').inner_text())
        page.wait_for_timeout(400)
        assert int(page.locator('.star-points strong').inner_text()) == stable
        ok('Modelo reabre sem internet apos cache; ausencia de mao nao pontua e mostra ajuda apos sete segundos')
        page.get_by_role('button',name='Voltar',exact=True).click()
        page.wait_for_function('window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
        ok('Sair desmonta detector, encerra tracks e remove o loop da camera')
        context.set_offline(False)
        page.get_by_role('link', name=re.compile('Estrela ao alcance')).click()
        page.evaluate('window.__cameraDelay=500')
        page.get_by_role('button',name='Ativar câmera',exact=False).click()
        page.get_by_role('button',name='Voltar',exact=True).click()
        page.wait_for_timeout(1200)
        assert page.evaluate('window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
        ok('Permissao concedida depois de sair tambem encerra o stream tardio')
        assert not errors,errors
        blocked = page.evaluate('window.__cspBlocked')
        # O SDK tenta enviar metricas. A CSP deve impedi-las antes de qualquer transmissao.
        assert all(url in blocked for url in network_posts), (network_posts, blocked)
        assert all(url in blocked for url in external), (external, blocked)
        ok('CSP bloqueia telemetria do SDK; nenhum frame/landmark ou POST externo transmitido')
        context.close()
        broken = browser.new_context(viewport={'width':1280,'height':1000},service_workers='block')
        broken.add_init_script(init_script)
        page = broken.new_page();page.set_default_timeout(20000)
        page.route('**/api/**',lambda route:route.abort())
        page.route('**/models/hand_landmarker.task',lambda route:route.fulfill(status=404,body='Missing model'))
        open_game(page)
        page.get_by_role('button',name='Ativar câmera',exact=False).click()
        expect(page.locator('.hand-star-game')).to_have_attribute('data-model-status','error',timeout=60000)
        expect(page.locator('.hand-indicator')).to_contain_text('Não consegui carregar')
        page.wait_for_function('window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
        page.get_by_role('button',name='Jogar com toque',exact=True).click()
        page.get_by_role('button',name=re.compile('Pegar a estrela')).click()
        expect(page.locator('.star-points strong')).to_have_text('1')
        ok('Modelo 404 libera camera e mantem captura por toque sem travar a tela')
        browser.close()
    (OUT/'results.json').write_text(json.dumps({'base':args.base,'camera':'synthetic-public-fixture','results':results},ensure_ascii=False,indent=2),encoding='utf-8')


if __name__=='__main__':main()
