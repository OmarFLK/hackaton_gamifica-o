"""Regressões de integração e jogos do PR #1, com mídia sintética do Edge.

Os sensores são simulados; não valida microfone/câmera físicos. Requer a API
local em :8000 e frontend integrado em :5174. Dados exclusivamente fictícios.
"""
import json
import re
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = 'http://127.0.0.1:5174'
OUT = Path(__file__).resolve().parents[1] / '.runtime' / 'review-pr1'
OUT.mkdir(parents=True, exist_ok=True)
RUN = datetime.now().strftime('%H%M%S')
results = []


def ok(name):
    results.append({'test': name, 'status': 'PASSOU'})
    print('PASSOU:', name, flush=True)


def login(page, profile, account):
    page.goto(f'{BASE}/login?perfil={profile}')
    page.get_by_role('button', name=account, exact=True).click()
    page.get_by_role('button', name='Entrar', exact=True).click()
    target = 'familia' if profile == 'responsavel' else 'dev' if profile == 'dev' else 'medico'
    expect(page).to_have_url(re.compile(f'/{target}$'))


def logout(page):
    page.get_by_role('button', name='Sair da conta').click()
    expect(page.get_by_role('heading', name='Como você quer entrar?')).to_be_visible()


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='msedge', headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, timezone_id='America/Sao_Paulo', locale='pt-BR', permissions=['camera', 'microphone'], reduced_motion='reduce')
        context.add_init_script('''
          window.__tracks = []; window.__denyMedia = false;
          if (navigator.mediaDevices?.getUserMedia) {
            const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = async options => {
              if (window.__denyMedia) throw new DOMException('QA denial', 'NotAllowedError');
              const stream = await original(options);
              window.__tracks.push(...stream.getTracks());
              return stream;
            };
          }
        ''')
        page = context.new_page(); page.set_default_timeout(15000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        login(page, 'profissional', 'Médico(a) demo')
        page.goto(BASE + '/medico/pacientes/1')
        page.get_by_role('tab', name='Medicamentos', exact=True).click()
        page.get_by_role('button', name='Nova programação').click()
        page.get_by_label('Identificação').select_option('Medicamento B')
        page.get_by_label('Horários separados por vírgula').fill('10:45')
        page.get_by_role('button', name='Salvar programação').click()
        expect(page.get_by_text('Programação fictícia salva na API.')).to_be_visible()
        ok('Medicamentos do médico integrados à ficha real')
        page.get_by_role('tab', name='Mensagens', exact=True).click()
        doctor_message = f'Equipe integrada demo {RUN}'
        page.get_by_label('Nova mensagem').fill(doctor_message)
        page.get_by_role('button', name='Enviar mensagem').click()
        expect(page.get_by_text('Mensagem enviada e salva na API.')).to_be_visible()
        logout(page)
        login(page, 'responsavel', 'Responsável demo')
        page.get_by_label('ACOMPANHANDO').select_option('1')
        page.goto(BASE + '/familia/medicamentos')
        page.get_by_label('ACOMPANHANDO').select_option('1')
        page.locator('.schedule-row').filter(has_text='10:45').last.get_by_role('button', name='Registrar relato').click()
        dialog = page.get_by_role('dialog')
        dialog.get_by_label('Observação opcional').fill(f'Relato integrado demo {RUN}')
        dialog.get_by_role('button', name='Registrar relato', exact=True).click()
        expect(page.get_by_text('Relato registrado na API com autor e horário.')).to_be_visible()
        ok('Família registra na agenda criada pelo médico do app integrado')
        page.goto(BASE + '/familia/mensagens')
        expect(page.get_by_text(doctor_message, exact=True)).to_be_visible()
        family_message = f'Familia integrada demo {RUN}'
        page.get_by_label('Nova mensagem').fill(family_message)
        page.get_by_role('button', name='Enviar mensagem').click()
        expect(page.get_by_text('Mensagem enviada e salva na API.')).to_be_visible()
        ok('Chat dos módulos 10–11 funciona nas telas novas')
        page.goto(BASE + '/familia/ajuda')
        page.get_by_label('Sua pergunta sobre o sistema').fill('Posso dobrar a dose?')
        page.get_by_role('button', name='Perguntar', exact=True).click()
        expect(page.get_by_text('FALE COM A EQUIPE RESPONSÁVEL', exact=True)).to_be_visible()
        ok('FAQ integrada mantém encaminhamento clínico')

        page.goto(BASE + '/crianca/1/jogos/bird')
        page.get_by_role('button', name='Tocar na tela', exact=False).click()
        pause_button = page.locator('.game-controls').get_by_role('button', name='Pausar', exact=True)
        pause_button.focus(); page.keyboard.press('Space')
        expect(page.get_by_text('Pausado. Descanse o quanto quiser.')).to_be_visible()
        resume_button = page.locator('.game-controls').get_by_role('button', name='Continuar', exact=True)
        resume_button.focus(); page.keyboard.press('Space')
        expect(page.get_by_text('Pausado. Descanse o quanto quiser.')).not_to_be_visible()
        ok('Espaço preserva acionamento nativo de Pausar/Continuar no pássaro')
        page.get_by_role('button', name='Subir', exact=True).click()
        page.locator('.game-controls').get_by_role('button', name='Terminar', exact=True).click()
        expect(page.get_by_text('Sessão registrada no servidor.')).to_be_visible()

        page.goto(BASE + '/crianca/1/jogos/star')
        page.get_by_role('button', name='Usar câmera', exact=False).click()
        page.wait_for_function("window.__tracks.some(track => track.kind === 'video' && track.readyState === 'live')")
        page.locator('.game-controls').get_by_role('button', name='Pausar', exact=True).click()
        page.wait_for_function("window.__tracks.every(track => track.readyState === 'ended')")
        ok('Câmera sintética é encerrada ao pausar a estrela')
        page.locator('.game-controls').get_by_role('button', name='Continuar', exact=True).click()
        page.wait_for_function("window.__tracks.some(track => track.kind === 'video' && track.readyState === 'live')")
        page.locator('.game-controls').get_by_role('button', name='Terminar', exact=True).click()
        page.wait_for_function("window.__tracks.every(track => track.readyState === 'ended')")
        expect(page.get_by_text('Sessão registrada no servidor.')).to_be_visible()
        ok('Câmera pode retomar e encerra ao finalizar')

        page.goto(BASE + '/crianca/1/jogos/candle')
        page.get_by_role('button', name='Usar microfone', exact=False).click()
        page.wait_for_function("window.__tracks.some(track => track.kind === 'audio' && track.readyState === 'live')")
        page.locator('.kid-topbar').get_by_role('button', name='Pausar', exact=True).click()
        page.wait_for_function("window.__tracks.every(track => track.readyState === 'ended')")
        ok('Pausa global encerra microfone sintético da vela')
        page.locator('.game-controls').get_by_role('button', name='Continuar', exact=True).click()
        page.wait_for_function("window.__tracks.some(track => track.kind === 'audio' && track.readyState === 'live')")
        page.locator('.kid-topbar').get_by_role('button', name='Sair', exact=True).click()
        page.wait_for_function("window.__tracks.every(track => track.readyState === 'ended')")
        ok('Saída do jogo desmonta seus recursos de mídia')

        page.goto(BASE + '/crianca/1/jogos/candle')
        page.evaluate('window.__denyMedia = true')
        page.get_by_role('button', name='Usar microfone', exact=False).click()
        expect(page.get_by_text('Permissão negada ou dispositivo indisponível.', exact=False)).to_be_visible()
        page.get_by_role('button', name='Brincar por toque', exact=True).click()
        for _ in range(4): page.get_by_role('button', name='Soprar', exact=True).click()
        expect(page.get_by_text('A vela apagou!', exact=False)).to_be_visible()
        ok('Permissão negada mantém a vela totalmente jogável por toque')
        page.route('**/api/patients/1/games', lambda route: route.abort() if route.request.method == 'POST' else route.continue_())
        page.locator('.game-controls').get_by_role('button', name='Terminar', exact=True).click()
        expect(page.get_by_text('Não sincronizado — resumo guardado só nesta tela.', exact=False)).to_be_visible()
        expect(page.get_by_text('Sessão registrada no servidor.')).not_to_be_visible()
        page.unroute('**/api/patients/1/games')
        ok('Falha de API no jogo informa não sincronizado sem falso sucesso')
        page.goto(BASE + '/crianca/99999')
        expect(page.get_by_text('Paciente fora do seu vínculo', exact=False)).to_be_visible()
        expect(page.get_by_text('Mundo de Nina')).not_to_be_visible()
        ok('ID infantil fora do vínculo não mantém perfil anterior na tela')

        for width in (375, 768, 1440):
            page.set_viewport_size({'width': width, 'height': 1000})
            page.goto(BASE + '/crianca/1/jogos/star')
            page.get_by_role('button', name='Tocar na tela', exact=False).click()
            page.get_by_role('button', name='Pegar a estrela.', exact=False).click()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(OUT / f'jogo-estrela-{width}.png'), full_page=True)
            ok(f'Jogo da estrela sem overflow em {width}px')
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.goto(BASE + '/familia')
        logout(page)
        login(page, 'profissional', 'Médico(a) demo')
        page.goto(BASE + '/medico/pacientes/1')
        page.get_by_role('tab', name='Medicamentos', exact=True).click()
        expect(page.get_by_text(f'Relato integrado demo {RUN}', exact=True)).to_be_visible()
        page.get_by_role('tab', name='Mensagens', exact=True).click()
        expect(page.get_by_text(family_message, exact=True)).to_be_visible()
        ok('Médico lê relato e mensagem familiar no portal integrado')
        logout(page)
        page.goto(BASE + '/login?perfil=responsavel')
        page.get_by_text('Apresentar sem API', exact=True).click()
        page.get_by_role('button', name='Abrir apresentação offline').click()
        page.evaluate('navigator.serviceWorker.ready.then(() => true)')
        context.set_offline(True)
        page.get_by_role('link', name='Entrar no mundo da criança', exact=True).click()
        page.get_by_role('link', name='Vela tranquila', exact=False).click()
        page.get_by_role('button', name='Tocar na tela', exact=False).click()
        for _ in range(4): page.get_by_role('button', name='Soprar', exact=True).click()
        page.locator('.game-controls').get_by_role('button', name='Terminar', exact=True).click()
        expect(page.get_by_text('Não sincronizado', exact=False)).to_be_visible()
        ok('Jogo offline funciona por toque e identifica resumo não sincronizado')
        assert not errors, errors
        ok('Nenhum erro JavaScript não tratado no percurso adicional')
        browser.close()
except Exception as error:
    results.append({'test': 'Execução adicional', 'status': 'FALHOU', 'detail': str(error)})
    raise
finally:
    (OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
