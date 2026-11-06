"""Fluxos reais de cadastro, medidas, notas, rolagem, narrador e tema.

Somente dados ficticios. Tokens permanecem em memoria; nenhuma chave e impressa.
"""
import argparse
from datetime import datetime
import json
from pathlib import Path
import re
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.runtime' / 'family-updates'
OUT.mkdir(parents=True, exist_ok=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:5174')
    parser.add_argument('--api-url', default='http://127.0.0.1:8001')
    args = parser.parse_args()
    run = datetime.now().strftime('%Y%m%d%H%M%S')
    email = f'familia.{run}@pendi.demo'
    password = 'FamiliaTeste2026!'
    child_name = f'Estrela Teste {run}'
    parent_name = f'Familia Teste {run}'
    note = f'Anotacao geral de teste {run}: dormiu bem e gostou da brincadeira.'
    results = []

    def ok(label):
        results.append({'test': label, 'status': 'PASSOU'})
        print('PASSOU:', label, flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, locale='pt-BR', timezone_id='America/Sao_Paulo', color_scheme='light')
        context.add_init_script('''
          window.__tts = { speaks: 0, cancels: 0 };
          if (window.speechSynthesis) {
            speechSynthesis.speak = () => { window.__tts.speaks++; };
            speechSynthesis.cancel = () => { window.__tts.cancels++; };
          }
        ''')
        page = context.new_page(); page.set_default_timeout(20000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def login(account, secret):
            page.goto(args.base + '/login')
            page.get_by_label('E-mail', exact=True).fill(account)
            page.locator('#login-password').fill(secret)
            page.get_by_role('button', name='Entrar', exact=True).click()
            expect(page).to_have_url(re.compile('/(medico|familia)$'))

        def logout():
            menu = page.get_by_role('button', name='Abrir menu', exact=True)
            if menu.is_visible(): menu.click()
            page.get_by_role('button', name='Sair da conta').click()
            expect(page).to_have_url(re.compile('/login'))

        login('medico@superped.demo', 'Demo2026!')
        expect(page.get_by_role('button', name='Ligar narrador', exact=True)).to_be_visible()
        page.get_by_role('button', name='Ativar modo escuro').click()
        expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
        page.reload()
        expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
        ok('Narrador inicia desligado; tema escuro persiste ao recarregar')

        page.goto(args.base + '/medico/pacientes/novo')
        page.get_by_label('Nome fictício da criança').fill(child_name)
        page.get_by_label('Data de nascimento (fictícia)').fill('2018-04-05')
        page.get_by_role('button', name='Continuar', exact=True).click()
        page.get_by_role('button', name='Cadastrar novo responsável', exact=True).click()
        dialog = page.get_by_role('dialog')
        dialog.get_by_label('Nome do responsável', exact=True).fill(parent_name)
        dialog.get_by_label('E-mail do responsável', exact=True).fill(email)
        dialog.get_by_label('Senha de acesso do responsável', exact=True).fill(password)
        dialog.get_by_label('Confirmar senha do responsável', exact=True).fill(password)
        dialog.get_by_role('button', name='Criar conta do responsável').click()
        expect(dialog).not_to_be_visible()
        expect(page.get_by_label('Convidar familiar (responsável demo existente)')).to_contain_text(parent_name)
        page.get_by_label('Peso da criança (kg)').fill('25.7')
        page.get_by_label('Altura da criança (cm)').fill('125.5')
        page.screenshot(path=str(OUT / 'doctor-create-dark.png'), full_page=True)
        page.get_by_role('button', name='Continuar', exact=True).click()
        page.get_by_role('button', name='Cadastrar no servidor').click()
        expect(page).to_have_url(re.compile('/medico/pacientes/[0-9]+$'))
        pid = int(page.url.rsplit('/', 1)[1])
        expect(page.get_by_role('heading', name=re.compile(child_name))).to_be_visible()
        ok('Medico cria responsavel no cadastro e vincula a crianca com peso e altura')
        page.get_by_role('tab', name='Revisão clínica', exact=True).click()
        expect(page.get_by_label('Peso da criança (kg)')).to_have_value('25.7')
        expect(page.get_by_label('Altura da criança (cm)')).to_have_value('125.5')
        page.get_by_label('Peso da criança (kg)').fill('26.4')
        page.get_by_role('button', name='Salvar revisão').click()
        expect(page.get_by_text('Revisão salva no servidor.')).to_be_visible()
        page.reload(); page.get_by_role('tab', name='Revisão clínica', exact=True).click()
        expect(page.get_by_label('Peso da criança (kg)')).to_have_value('26.4')
        expect(page.get_by_label('Altura da criança (cm)')).to_have_value('125.5')
        ok('Medidas editadas pelo medico persistem apos recarregar a ficha')

        logout(); login(email, password)
        expect(page.get_by_label('ACOMPANHANDO').locator('option')).to_have_text([child_name])
        page.goto(args.base + '/familia/rotina')
        page.get_by_label('Anotação da família', exact=True).fill(note)
        page.get_by_role('button', name='Salvar anotação', exact=True).click()
        expect(page.get_by_text(note, exact=True)).to_be_visible()
        headers = {'Authorization': 'Bearer ' + page.evaluate('sessionStorage.getItem("superped.token")')}
        for _ in range(10):
            response = context.request.post(f'{args.api_url}/api/patients/{pid}/routines', headers=headers,
                                            data={'kind': 'water', 'quantity': 100, 'unit': 'ml'})
            assert response.status == 201
        page.reload(); expect(page.get_by_text(note, exact=True)).to_be_visible()
        region = page.get_by_role('region', name='Registros recentes de rotina')
        region.scroll_into_view_if_needed()
        sizes = region.evaluate('(e)=>({scroll:e.scrollHeight,box:e.clientHeight})')
        assert sizes['scroll'] > sizes['box'] and sizes['box'] <= 321
        initial_scroll = page.evaluate('scrollY')
        region.hover(); page.mouse.wheel(0, 250)
        page.wait_for_function('document.querySelector(".routine-history-scroll").scrollTop > 0')
        assert abs(page.evaluate('scrollY') - initial_scroll) < 2
        ok('Nova familia acessa somente seu vinculo; anotacao persiste e historico rola dentro do bloco')
        page.screenshot(path=str(OUT / 'family-routine-dark.png'), full_page=True)

        page.goto(args.base + f'/crianca/{pid}')
        page.get_by_role('button', name='Ligar narrador', exact=True).click()
        page.get_by_role('button', name='Ouvir', exact=True).click()
        assert page.evaluate('window.__tts.speaks') > 0
        page.get_by_role('button', name='Desligar narrador', exact=True).click()
        count = page.evaluate('window.__tts.speaks')
        page.get_by_role('button', name='Ouvir', exact=True).click()
        assert page.evaluate('window.__tts.speaks') == count
        assert page.evaluate('window.__tts.cancels') > 0
        page.reload()
        expect(page.get_by_role('button', name='Ligar narrador', exact=True)).to_be_visible()
        page.get_by_role('button', name='Ouvir', exact=True).click()
        assert page.evaluate('window.__tts.speaks') == 0
        ok('Narrador fala quando ligado, cancela ao desligar e permanece mudo apos reload')
        page.set_viewport_size({'width': 375, 'height': 812})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        expect(page.get_by_role('button', name='Ligar narrador', exact=True)).to_be_visible()
        contrasts = page.locator('.kid-tile').evaluate_all('''tiles => {
          const luminance = color => {
            const values = color.match(/[\\d.]+/g).slice(0,3).map(Number).map(v => {
              v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
            });
            return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
          };
          return tiles.map(tile => {
            const bg = luminance(getComputedStyle(tile).backgroundColor);
            const fg = luminance(getComputedStyle(tile.querySelector('strong')).color);
            return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);
          });
        }''')
        assert contrasts and min(contrasts) >= 4.5, contrasts
        ok('Cartoes infantis no tema escuro mantem contraste de texto de pelo menos 4.5:1')
        page.screenshot(path=str(OUT / 'child-mobile-dark.png'), full_page=True)
        page.goto(args.base + '/familia/rotina')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.get_by_role('button', name='Ativar modo claro').click()
        expect(page.locator('html')).to_have_attribute('data-theme', 'light')
        page.get_by_role('button', name='Ativar modo escuro').click()
        page.screenshot(path=str(OUT / 'family-mobile-dark.png'), full_page=True)
        ok('Cabecalhos e novos formularios cabem em 375px; temas claro e escuro alternam')

        page.set_viewport_size({'width': 1440, 'height': 1000})
        logout(); login('medico@superped.demo', 'Demo2026!')
        page.goto(args.base + f'/medico/pacientes/{pid}')
        expect(page.get_by_text(note, exact=True)).to_be_visible()
        page.goto(args.base + '/medico/responsaveis/novo')
        expect(page.get_by_role('heading', name='Cadastrar responsável', exact=False)).to_be_visible()
        assert not errors, errors
        ok('Medico le anotacao da familia e acessa pagina dedicada de cadastro; nenhum erro JS')
        browser.close()
    report = {'base': args.base, 'results': results}
    (OUT / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
