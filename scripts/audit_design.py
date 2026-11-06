"""Auditoria visual automática: todas as rotas × claro/escuro × 375px/1440px.

Mede, sem depender de olho humano:
- contraste de texto abaixo de 4.5:1 (3:1 para texto grande) contra o fundo efetivo;
- colisão entre itens de barras/cabeçalhos (retângulos que se sobrepõem);
- rolagem horizontal da página.
Uso (API e frontend rodando):
  AUDIT_BASE=http://127.0.0.1:5173 .venv/Scripts/python scripts/audit_design.py
Capturas e relatório JSON em .runtime/design-audit/. Somente contas e dados fictícios.
"""
import json
import os
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.runtime' / 'design-audit'
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.getenv('AUDIT_BASE', 'http://127.0.0.1:5173')
SHOTS = os.getenv('AUDIT_SHOTS', '1') == '1'

PUBLIC = ['/', '/login?perfil=profissional', '/login?perfil=responsavel', '/rota-que-nao-existe']
DOCTOR = ['/medico', '/medico/pacientes', '/medico/pacientes/1', '/medico/pacientes/novo', '/medico/responsaveis/novo',
          '/medico/ajuda', '/medico/mensagens', '/medico/notificacoes', '/medico/ia']
GUARDIAN = ['/familia', '/familia/rotina', '/familia/humor', '/familia/medicamentos', '/familia/mensagens',
            '/familia/notificacoes', '/familia/ia', '/familia/ajuda']
CHILD = ['/crianca/1', '/crianca/1/mascote', '/crianca/1/sentimentos', '/crianca/1/conversar',
         '/crianca/1/jogos/candle', '/crianca/1/jogos/bird', '/crianca/1/jogos/star']
DEV = ['/dev']

AUDIT_JS = r"""
() => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } }
  const firstGradientColor = img => { const m = img.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/i); if (!m) return null; if (m[0][0] !== '#') return parse(m[0]); let h = m[0].slice(1); if (h.length <= 4) h = [...h].map(x => x + x).join(''); return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16), a: h.length >= 8 ? parseInt(h.slice(6,8),16)/255 : 1 } }
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b) }
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05) }
  const blend = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 })
  function background(el) {
    const layers = []
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const s = getComputedStyle(node)
      let c = parse(s.backgroundColor)
      if ((!c || c.a < .05) && s.backgroundImage.includes('gradient')) c = firstGradientColor(s.backgroundImage)
      if (c && c.a >= .05) { layers.push(c); if (c.a >= .95) break }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 }
    const root = parse(getComputedStyle(document.documentElement).backgroundColor); if (root && root.a > .5) base = root
    return layers.reverse().reduce((under, top) => blend(top, under), base)
  }
  const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && r.bottom > 0 && r.right > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .1 && !el.closest('[aria-hidden="true"], .sr-only, dialog:not([open]), .recharts-wrapper') }
  const contrast = []
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || ['SCRIPT','STYLE','SVG','PATH','OPTION'].includes(el.tagName.toUpperCase())) continue
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ')
    if (!own) continue
    const s = getComputedStyle(el); const fg = parse(s.color); if (!fg) continue
    const bg = background(el); const value = ratio(blend(fg, bg), bg)
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700)
    if (el.disabled || el.closest('button:disabled')) continue
    if (value < (large ? 3 : 4.5)) contrast.push({ text: own.slice(0, 60), ratio: +value.toFixed(2), cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 60), tag: el.tagName.toLowerCase() })
  }
  const groups = ['.topbar', '.kid-topbar', '.landing-header', '.login-preferences', '.game-header', '.patient-switcher', '.page-heading', '.section-heading', '.child-world-cta']
  const overlaps = []
  for (const sel of groups) for (const g of document.querySelectorAll(sel)) {
    if (!visible(g)) continue
    const items = [...g.querySelectorAll('button, a, select, .demo-badge, .connection, .breadcrumb, .fiction-label, .patient-initial, h1, h2, .eyebrow, label > span')].filter(visible)
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j]; if (a.contains(b) || b.contains(a)) continue
      const p = a.getBoundingClientRect(), q = b.getBoundingClientRect()
      const w = Math.min(p.right, q.right) - Math.max(p.left, q.left), h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)
      if (w > 3 && h > 3) overlaps.push(`${sel}: "${(a.textContent || a.getAttribute('aria-label') || a.className).trim().slice(0, 25)}" × "${(b.textContent || b.getAttribute('aria-label') || b.className).trim().slice(0, 25)}"`)
    }
  }
  // Cabeçalhos que crescem além da altura fixa invadem o conteúdo seguinte.
  for (const h of document.querySelectorAll('.topbar, .kid-topbar')) if (visible(h) && h.scrollHeight > h.clientHeight + 2) overlaps.push(`${h.className}: conteúdo maior que a altura (${h.scrollHeight}>${h.clientHeight})`)
  const doc = document.documentElement
  return { contrast, overlaps: [...new Set(overlaps)], hscroll: doc.scrollWidth > doc.clientWidth + 1 ? doc.scrollWidth - doc.clientWidth : 0 }
}
"""


def login(page, profile, account):
    page.goto(f'{BASE}/login?perfil={profile}')
    page.get_by_role('button', name=account, exact=True).click()
    page.get_by_role('button', name='Entrar', exact=True).click()
    page.wait_for_url(re.compile(r'/(medico|familia|dev)'))


def audit(page, route, tag, report, prepare=None):
    page.goto(BASE + route)
    page.wait_for_load_state('networkidle')
    if prepare:
        prepare(page)
    page.wait_for_timeout(700)  # animações de entrada terminam
    result = page.evaluate(AUDIT_JS)
    key = f'{tag} {route}' + (' (jogando)' if prepare else '')
    report[key] = result
    if SHOTS:
        name = re.sub(r'[^a-z0-9]+', '-', key.lower()).strip('-')
        page.screenshot(path=OUT / f'{name}.png', full_page=True)
    flag = len(result['contrast']) + len(result['overlaps']) + (1 if result['hscroll'] else 0)
    print(f"{'OK ' if not flag else 'ERR'} {key}: contraste={len(result['contrast'])} colisões={len(result['overlaps'])} hscroll={result['hscroll']}", flush=True)


def start_game(page):
    page.get_by_role('button', name=re.compile('Tocar na tela')).click()


report = {}
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel='msedge', headless=True)
    for width, height, size in [(375, 812, 'mobile'), (1440, 900, 'desktop')]:
        for dark in (False, True):
            tag = f"{size}-{'escuro' if dark else 'claro'}"
            context = browser.new_context(viewport={'width': width, 'height': height}, locale='pt-BR', reduced_motion='reduce')
            context.add_init_script(f"localStorage.setItem('pendi.preferences.v1', JSON.stringify({{narrator:false,dark:{'true' if dark else 'false'}}}))")
            page = context.new_page(); page.set_default_timeout(15000)
            for route in PUBLIC:
                audit(page, route, tag, report)
            login(page, 'profissional', 'Médico(a) demo')
            for route in DOCTOR:
                audit(page, route, tag, report)
            context.clear_cookies(); page.evaluate('sessionStorage.clear()')
            login(page, 'responsavel', 'Responsável demo')
            for route in GUARDIAN + CHILD:
                audit(page, route, tag, report)
            for game in ('candle', 'bird', 'star'):
                audit(page, f'/crianca/1/jogos/{game}', tag, report, start_game)
            page.evaluate('sessionStorage.clear()')
            login(page, 'dev', 'Dev demo')
            for route in DEV:
                audit(page, route, tag, report)
            context.close()
    browser.close()

(OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding='utf-8')
problems = {k: v for k, v in report.items() if v['contrast'] or v['overlaps'] or v['hscroll']}
print(f'\n{len(report)} telas auditadas; {len(problems)} com problemas. Relatório: {OUT / "report.json"}')
