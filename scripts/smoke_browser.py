"""QA local dos módulos 10–18; usa Edge instalado, sem downloads de browser.

Executar na raiz com a API em :8000 e o build preview em :5174:
  .venv/Scripts/python scripts/smoke_browser.py
Somente contas e dados fictícios. Resultados e capturas ficam em .runtime/.
"""
import json
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '.runtime' / 'browser'
OUTPUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:5174'
report = []


def passed(name):
    report.append({'test': name, 'status': 'PASSOU', 'at': datetime.now().astimezone().isoformat()})
    print('PASSOU:', name, flush=True)


def login(page, account):
    page.goto(BASE + '/login')
    page.get_by_role('button', name=account, exact=True).click()
    page.get_by_role('button', name='Entrar', exact=True).click()


def logout(page):
    page.get_by_role('button', name='Sair da conta', exact=True).click()
    expect(page.get_by_role('heading', name='Vamos continuar?')).to_be_visible()


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, timezone_id='America/Sao_Paulo', locale='pt-BR', reduced_motion='reduce')
        page = context.new_page()
        page.set_default_timeout(15000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        login(page, 'Médico')
        expect(page.get_by_role('heading', name='Agenda de medicamentos.')).to_be_visible()
        expect(page.locator('#patient-select')).to_have_value('1')
        page.screenshot(path=str(OUTPUT / 'medico-inicial.png'), full_page=True)
        passed('Login médico real e agenda de paciente vinculado')
        page.get_by_role('button', name='Nova programação').click()
        page.get_by_label('Identificação').select_option('Medicamento B')
        page.get_by_label('Horários separados por vírgula').fill('10:30')
        page.get_by_role('button', name='Salvar programação').click()
        expect(page.locator('.schedule-row').filter(has_text='10:30').last).to_be_visible()
        passed('Médico cria programação fictícia persistida na API')
        page.get_by_role('link', name='Mensagens', exact=True).click()
        doctor_message = 'Mensagem fictícia da equipe — teste de integração'
        page.get_by_label('Nova mensagem').fill(doctor_message)
        page.get_by_role('button', name='Enviar mensagem').click()
        expect(page.get_by_text('Mensagem enviada e salva na API.')).to_be_visible()
        logout(page)
        login(page, 'Família')
        expect(page.locator('.schedule-row').filter(has_text='10:30').last).to_be_visible()
        page.locator('.schedule-row').filter(has_text='10:30').last.get_by_role('button', name='Registrar relato').click()
        dialog = page.get_by_role('dialog')
        expect(dialog).to_be_visible()
        dialog.get_by_label('Observação opcional').fill('Relato inteiramente fictício — teste de navegador')
        dialog.get_by_role('button', name='Registrar relato', exact=True).click()
        expect(dialog).not_to_be_visible()
        expect(page.get_by_text('Relato registrado na API com autor e horário.')).to_be_visible()
        passed('Família vê agenda compartilhada e registra relato com autor')
        page.reload()
        expect(page.locator('.history-list').get_by_text('Relato inteiramente fictício — teste de navegador').first).to_be_visible()
        passed('Relato persiste após refresh')
        for width in [375, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.wait_for_timeout(100)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow em {width}px'
            page.screenshot(path=str(OUTPUT / f'agenda-{width}.png'), full_page=True)
            passed(f'Agenda responsiva sem overflow em {width}px')
        page.get_by_role('button', name='Simular lembrete em 10 segundos').click()
        expect(page.get_by_text('Simulação · Lembrete de medicamento programado', exact=True)).to_be_visible(timeout=15000)
        passed('Lembrete demonstrativo dispara após 10 segundos')
        page.get_by_role('button', name='Fechar lembrete').click()
        page.get_by_role('link', name='Mensagens', exact=True).click()
        expect(page.get_by_text(doctor_message, exact=True).first).to_be_visible()
        family_message = 'Resposta fictícia da família — teste de integração'
        page.get_by_label('Nova mensagem').fill(family_message)
        page.get_by_role('button', name='Enviar mensagem').click()
        expect(page.get_by_text('Mensagem enviada e salva na API.')).to_be_visible()
        passed('Mensagens compartilhadas entre sessões médico e família')
        page.get_by_role('link', name='Dúvidas frequentes').click()
        page.get_by_label('Sua pergunta sobre o sistema').fill('Posso dobrar a dose?')
        page.get_by_role('button', name='Perguntar', exact=True).click()
        expect(page.get_by_text('FALE COM A EQUIPE RESPONSÁVEL', exact=True)).to_be_visible()
        page.get_by_role('button', name='Como vejo os horários?').click()
        expect(page.get_by_text('RESPOSTA DA FAQ', exact=True)).to_be_visible()
        passed('FAQ explica uso e encaminha questão clínica pessoal')
        page.get_by_role('link', name='Conhecer o Pandi').click()
        expect(page.get_by_role('heading', name='Oi, eu sou o Pandi!')).to_be_visible()
        assert 'Medicamento A' not in page.inner_text('body')
        page.get_by_role('button', name='Quero descansar', exact=True).click()
        expect(page.get_by_text('Tudo bem fazer uma pausa.', exact=False)).to_be_visible()
        page.get_by_role('button', name='Chamar adulto', exact=True).click()
        expect(page.get_by_text('Este botão não envia mensagens', exact=False)).to_be_visible()
        page.set_viewport_size({'width': 375, 'height': 1000})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=str(OUTPUT / 'companhia-375.png'), full_page=True)
        passed('Companheiro por botões, chamada local de adulto e tela infantil sem medicação')
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.get_by_role('button', name='Voltar ao responsável').click()
        logout(page)
        login(page, 'Médico')
        expect(page.locator('.history-list').get_by_text('Relato inteiramente fictício — teste de navegador').first).to_be_visible()
        page.get_by_role('link', name='Mensagens', exact=True).click()
        expect(page.get_by_text(family_message, exact=True).first).to_be_visible()
        passed('Médico lê o relato e a mensagem da família')
        logout(page)
        login(page, 'Dev')
        expect(page.get_by_text('Operacional', exact=True)).to_be_visible()
        assert 'Nina Aurora' not in page.inner_text('body')
        forbidden = page.evaluate("""async () => {
          const response = await fetch('http://localhost:8000/api/patients', {headers: {Authorization: 'Bearer ' + sessionStorage.getItem('superped.token')}});
          return response.status;
        }""")
        assert forbidden == 403
        passed('Dev recebe status técnico e 403 para pacientes')
        page.screenshot(path=str(OUTPUT / 'dev-1440.png'), full_page=True)
        logout(page)
        login(page, 'Assistente')
        expect(page.get_by_text('Nenhuma delegação disponível', exact=False)).to_be_visible()
        passed('Assistente sem delegação não recebe acesso clínico implícito')
        logout(page)
        page.get_by_text('Apresentar sem API', exact=True).click()
        page.get_by_role('button', name='Abrir apresentação offline').click()
        expect(page.get_by_text('Modo offline de apresentação', exact=False)).to_be_visible()
        assert page.get_by_role('button', name='Registrar relato').count() > 0
        for button in page.get_by_role('button', name='Registrar relato').all():
            expect(button).to_be_disabled()
        passed('Modo offline explícito e gravações desabilitadas')
        page.evaluate('navigator.serviceWorker.ready.then(() => true)')
        cached = page.evaluate('''async () => {
          const keys = await caches.keys();
          return Promise.all(keys.map(async key => {
            const cache = await caches.open(key);
            return (await cache.keys()).map(request => request.url);
          }));
        }''')
        assert cached and not any('/api/' in url for cache in cached for url in cache)
        passed('Service worker cacheia somente shell e assets públicos')
        context.set_offline(True)
        page.reload()
        expect(page.get_by_role('heading', name='Vamos continuar?')).to_be_visible()
        page.get_by_text('Apresentar sem API', exact=True).click()
        page.get_by_role('button', name='Abrir apresentação offline').click()
        expect(page.get_by_role('heading', name='Agenda de medicamentos.')).to_be_visible()
        page.get_by_role('link', name='Dúvidas frequentes').click()
        page.get_by_role('button', name='Como vejo os horários?').click()
        expect(page.get_by_text('RESPOSTA DA FAQ', exact=True)).to_be_visible()
        passed('Reabertura da SPA e FAQ sem internet após cache público')
        assert not errors, errors
        passed('Nenhum erro JavaScript não tratado durante a demo')
        browser.close()
except Exception as error:
    report.append({'test': 'Execução do navegador', 'status': 'FALHOU', 'detail': str(error)})
    raise
finally:
    (OUTPUT / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
