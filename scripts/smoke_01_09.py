"""Smoke de navegador dos módulos 01–09 (Edge instalado, sem download de browser).

Com a API e o frontend rodando:
  SMOKE_BASE=http://127.0.0.1:5173 .venv/Scripts/python scripts/smoke_01_09.py
Cria registros FICTÍCIOS no banco demo local. Capturas em .runtime/browser-01-09/.
"""
import os
import re
from datetime import datetime
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.runtime' / 'browser-01-09'
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.getenv('SMOKE_BASE', 'http://127.0.0.1:5173')
RUN = datetime.now().strftime('%H%M%S')
results, console_errors = [], []


def ok(name):
    results.append(name)
    print('PASSOU:', name, flush=True)


def no_horizontal_scroll(page, label):
    width = page.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    assert width[0] <= width[1] + 1, f'scroll horizontal em {label}: {width}'


def login(page, profile, account):
    page.goto(f'{BASE}/login?perfil={profile}')
    page.get_by_role('button', name=account, exact=True).click()
    page.get_by_role('button', name='Entrar', exact=True).click()


def logout(page):
    page.locator('.topbar').wait_for()
    menu = page.get_by_role('button', name='Abrir menu')
    if menu.is_visible():  # mobile: a saída fica no drawer
        menu.click()
        expect(page.locator('.sidebar.open')).to_be_visible()
    page.get_by_role('button', name='Sair da conta').first.click()
    expect(page.get_by_role('heading', name='Como você quer entrar?')).to_be_visible()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel='msedge', headless=True)
    for width, height, tag in [(1440, 1000, 'desktop'), (375, 812, 'mobile')]:
        context = browser.new_context(viewport={'width': width, 'height': height}, locale='pt-BR', timezone_id='America/Sao_Paulo')
        page = context.new_page()
        page.set_default_timeout(15000)
        page.on('console', lambda msg: console_errors.append(f'{tag}: {msg.text}') if msg.type == 'error' else None)

        # 03 Landing: quatro entradas e aviso demo
        page.goto(BASE + '/')
        expect(page.locator('.entry-card')).to_have_count(4)
        expect(page.get_by_text('Demonstração acadêmica.')).to_be_visible()
        no_horizontal_scroll(page, 'landing'); page.screenshot(path=OUT / f'{tag}-landing.png', full_page=True)
        ok(f'{tag}: landing com 4 cartões e aviso')

        # 03/04 Login: erro real com senha errada
        page.goto(BASE + '/login?perfil=profissional')
        page.get_by_label('E-mail').fill('medico@superped.demo'); page.locator('#login-password').fill('errada')
        page.get_by_role('button', name='Entrar', exact=True).click()
        expect(page.get_by_text('E-mail ou senha inválidos')).to_be_visible()
        no_horizontal_scroll(page, 'login'); page.screenshot(path=OUT / f'{tag}-login.png', full_page=True)
        ok(f'{tag}: login mostra erro real da API')

        # 06 Médico: painel, lista >= 3, ficha
        login(page, 'profissional', 'Médico(a) demo')
        expect(page).to_have_url(re.compile(r'/medico$'))
        expect(page.locator('.demo-badge').first).to_be_visible()
        expect(page.get_by_text('Indicadores de rotina relatados pela família')).to_be_visible()
        no_horizontal_scroll(page, 'painel médico'); page.screenshot(path=OUT / f'{tag}-medico-painel.png', full_page=True)
        page.goto(BASE + '/medico/pacientes')
        expect(page.locator('.patient-card').nth(2)).to_be_visible()
        page.get_by_role('link', name='Abrir ficha de Nina Aurora').click()
        expect(page.get_by_role('heading', name=re.compile('Nina Aurora'))).to_be_visible()
        page.get_by_role('tab', name='Revisão clínica').click()
        expect(page.get_by_label('Estágio (fictício)')).to_be_visible()
        page.get_by_role('tab', name='Resumo').click()
        no_horizontal_scroll(page, 'ficha'); page.screenshot(path=OUT / f'{tag}-medico-ficha.png', full_page=True)
        ok(f'{tag}: médico lista pacientes e abre ficha')

        # 06 Cadastro em etapas persistido, vinculado a OUTRO responsável (Jô, do Theo)
        new_name = f'Bia Estrela {tag} {RUN}'
        page.goto(BASE + '/medico/pacientes/novo')
        page.get_by_label('Nome fictício da criança').fill(new_name)
        page.get_by_label('Data de nascimento (fictícia)').fill('2018-04-05')
        page.get_by_role('button', name='Continuar').click()
        page.get_by_label('Convidar familiar (responsável demo existente)').select_option(label='Jô Responsável · responsavel.theo@superped.demo')
        page.get_by_role('button', name='Continuar').click()
        page.get_by_role('button', name='Cadastrar no servidor').click()
        expect(page).to_have_url(re.compile(r'/medico/pacientes/\d+$'))
        expect(page.get_by_role('heading', name=re.compile(new_name))).to_be_visible()
        ok(f'{tag}: cadastro de paciente persistido')
        if tag == 'mobile':
            page.get_by_role('button', name='Abrir menu').click()
            expect(page.locator('.sidebar.open')).to_be_visible()
            page.screenshot(path=OUT / f'{tag}-drawer.png')
            page.keyboard.press('Escape')
            ok('mobile: drawer abre e fecha')
        logout(page)

        # 07 Família: apenas crianças vinculadas, preservando cadastros de testes anteriores.
        login(page, 'responsavel', 'Responsável demo')
        expect(page).to_have_url(re.compile(r'/familia$'))
        options = page.get_by_label('ACOMPANHANDO').locator('option')
        expect(options.filter(has_text='Nina Aurora')).to_have_count(1)
        assert not {'Theo Nuvem', 'Lia Sol', new_name}.intersection(options.all_text_contents())
        page.get_by_label('ACOMPANHANDO').select_option(label='Nina Aurora')
        ok(f'{tag}: responsável só enxerga a própria criança')
        expect(page.get_by_text('Como está hoje?').first).to_be_visible()
        no_horizontal_scroll(page, 'família'); page.screenshot(path=OUT / f'{tag}-familia-painel.png', full_page=True)
        page.goto(BASE + '/familia/rotina')
        page.get_by_role('button', name='200 ml').click()
        page.get_by_role('button', name='Registrar água').click()
        expect(page.get_by_text(re.compile('Salvo no servidor'))).to_be_visible()
        page.get_by_label('O que comeu?').fill(f'Lanche demo {tag} {RUN}')
        page.get_by_role('button', name='Registrar refeição').click()
        expect(page.get_by_text(f'Lanche demo {tag} {RUN}')).to_be_visible()
        no_horizontal_scroll(page, 'rotina')
        page.goto(BASE + '/familia/humor')
        page.locator('.mood-option', has_text='Neutro').click()
        page.get_by_role('button', name='Salvar relato').click()
        expect(page.get_by_text('Relato da família salvo no servidor.')).to_be_visible()
        ok(f'{tag}: família registra água, refeição e humor')

        # 08 Criança: mundo, mascote, check-in
        page.goto(BASE + '/familia')
        page.get_by_role('link', name='Entrar no mundo da criança').click()
        expect(page).to_have_url(re.compile(r'/crianca/\d+$'))
        expect(page.get_by_role('button', name='Chamar adulto')).to_be_visible()
        no_horizontal_scroll(page, 'criança'); page.screenshot(path=OUT / f'{tag}-crianca-home.png', full_page=True)
        page.get_by_role('link', name=re.compile('Trocar companheiro')).click()
        expect(page.locator('.kid-mascot-card')).to_have_count(4)
        page.get_by_role('button', name='Homem-Aranha: em desenvolvimento').click()
        expect(page.get_by_role('heading', name='Em desenvolvimento')).to_be_visible()
        page.screenshot(path=OUT / f'{tag}-crianca-mascotes.png', full_page=True)
        page.get_by_role('button', name='Entendi').click()
        for name in ('Mickey', 'Minnie'):
            page.get_by_role('button', name=f'{name}: em desenvolvimento').click()
            expect(page.get_by_text(f'{name} ainda está em desenvolvimento')).to_be_visible()
            page.get_by_role('button', name='Entendi').click()
        page.get_by_role('button', name='Pronto!').click()
        page.get_by_role('link', name=re.compile('Como estou hoje')).click()
        page.locator('.mood-option', has_text='Feliz').first.click()
        no_horizontal_scroll(page, 'check-in'); page.screenshot(path=OUT / f'{tag}-crianca-checkin.png', full_page=True)
        page.get_by_role('button', name='Contar').click()
        expect(page.get_by_text('Guardado para o seu adulto ver.')).to_be_visible()
        page.get_by_role('button', name='Voltar ao meu mundo').click()
        page.get_by_role('button', name='Chamar adulto').click()
        expect(page.get_by_role('heading', name='Vamos chamar um adulto')).to_be_visible()
        page.get_by_role('button', name='Continuar aqui').click()
        ok(f'{tag}: Pandi ativo, personagens novos avisam "Em desenvolvimento", check-in e chamar adulto')

        # 09 Jogos por toque, com sessão salva
        page.get_by_role('link', name=re.compile('Vela tranquila')).click()
        page.get_by_role('button', name=re.compile('Tocar na tela')).click()
        for _ in range(4):
            page.get_by_role('button', name='Soprar').click()
        expect(page.get_by_text(re.compile('A vela apagou'))).to_be_visible()
        page.screenshot(path=OUT / f'{tag}-jogo-vela.png', full_page=True)
        page.wait_for_timeout(1100)
        page.get_by_role('button', name='Terminar').click()
        expect(page.get_by_text('Sessão registrada no servidor.')).to_be_visible()
        page.get_by_role('button', name='Voltar às aventuras').click()
        page.get_by_role('link', name=re.compile('Voo nas nuvens')).click()
        page.get_by_role('button', name=re.compile('Tocar na tela')).click()
        page.get_by_role('button', name='Subir').click()
        page.wait_for_timeout(600)
        no_horizontal_scroll(page, 'voo'); page.screenshot(path=OUT / f'{tag}-jogo-passaro.png', full_page=True)
        page.get_by_role('button', name='Pausar').first.click()
        expect(page.get_by_text('Pausado. Descanse o quanto quiser.')).to_be_visible()
        page.get_by_role('button', name='Terminar').click()
        expect(page.get_by_text('Sessão registrada no servidor.')).to_be_visible()
        page.get_by_role('button', name='Voltar às aventuras').click()
        page.get_by_role('link', name=re.compile('Estrela ao alcance')).click()
        page.get_by_role('button', name=re.compile('Jogar com toque')).click()
        page.get_by_role('button', name=re.compile('Pegar a estrela')).click()
        expect(page.get_by_text(re.compile('Estrelas pegas: 1'))).to_be_visible()
        page.screenshot(path=OUT / f'{tag}-jogo-estrela.png', full_page=True)
        page.get_by_role('button', name='Terminar').click()
        expect(page.get_by_text('Sessão registrada no servidor.')).to_be_visible()
        ok(f'{tag}: três jogos jogáveis por toque e sessões salvas')
        page.locator('.kid-topbar').get_by_role('button', name='Sair').click()
        expect(page).to_have_url(re.compile(r'/familia$'))
        logout(page)

        # Médico enxerga o relato da família
        login(page, 'profissional', 'Médico(a) demo')
        expect(page.get_by_text(re.compile(f'Refeição relatada: Lanche demo {tag} {RUN}'))).to_be_visible()
        ok(f'{tag}: relato da família aparece para o médico')
        logout(page)

        # Assistente e dev
        login(page, 'profissional', 'Assistente demo')
        expect(page.get_by_text(re.compile('Perfil assistente'))).to_be_visible()
        logout(page)
        login(page, 'dev', 'Dev demo')
        expect(page).to_have_url(re.compile(r'/dev$'))
        expect(page.get_by_role('heading', name=re.compile('Saúde do ambiente'))).to_be_visible()
        page.goto(BASE + '/familia')
        expect(page).to_have_url(re.compile(r'/dev$'))
        ok(f'{tag}: assistente sem dados clínicos; dev só vê ambiente')
        context.close()
    browser.close()

relevant = [e for e in console_errors if 'favicon' not in e]
print(f'\n{len(results)} verificações passaram. Erros de console: {len(relevant)}')
for error in relevant[:20]:
    print('  ', error)
