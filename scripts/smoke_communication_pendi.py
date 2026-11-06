"""Navegador: duas sessões humanas, avisos, IA real e ditado com áudio sintético.

Não imprime chaves/tokens. Usa exclusivamente contas e dados fictícios.
"""
import json
import re
import wave
from datetime import datetime
from pathlib import Path
from urllib.parse import urlsplit
import av
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.runtime' / 'communication'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:5174'
RUN = datetime.now().strftime('%H%M%S')
results = []
audio_path = OUT / 'synthetic-input.wav'
with av.open(str(ROOT / '.runtime' / 'pendi-speech-test.wav')) as source, wave.open(str(audio_path), 'wb') as output:
    output.setnchannels(1); output.setsampwidth(2); output.setframerate(48000)
    resampler = av.AudioResampler(format='s16', layout='mono', rate=48000)
    for frame in source.decode(audio=0):
        for converted in resampler.resample(frame):
            output.writeframes(converted.to_ndarray().tobytes())


def ok(name):
    results.append({'test': name, 'status': 'PASSOU'})
    print('PASSOU:', name, flush=True)


def login(page, profile, account):
    page.goto(f'{BASE}/login?perfil={profile}')
    page.get_by_role('button', name=account, exact=True).click()
    page.get_by_role('button', name='Entrar', exact=True).click()
    expect(page).to_have_url(re.compile('/familia$' if profile == 'responsavel' else '/medico$'))


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='msedge', headless=True, args=[
            '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
            '--use-file-for-fake-audio-capture=' + str(audio_path),
        ])
        options = {'viewport': {'width': 1440, 'height': 1000}, 'locale': 'pt-BR', 'timezone_id': 'America/Sao_Paulo', 'reduced_motion': 'reduce', 'permissions': ['microphone']}
        doctor_context = browser.new_context(**options)
        family_context = browser.new_context(**options)
        doctor = doctor_context.new_page(); family = family_context.new_page()
        errors, external_calls, child_requests = [], [], []
        for page in (doctor, family):
            page.set_default_timeout(15000)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: external_calls.append(request.url) if urlsplit(request.url).hostname == 'ia.maua.br' else None)
        family.on('request', lambda request: child_requests.append(request.url) if '/api/ai/child/' in request.url and request.method == 'POST' else None)
        login(doctor, 'profissional', 'Médico(a) demo')
        login(family, 'responsavel', 'Responsável demo')
        family.goto(BASE + '/familia/mensagens?paciente=1')
        first = f'Olá equipe, mensagem fictícia {RUN}'
        family.get_by_label('Nova mensagem').fill(first)
        family.get_by_role('button', name='Enviar mensagem', exact=True).click()
        expect(family.get_by_text('Mensagem enviada e salva na API.')).to_be_visible()
        expect(doctor.locator('.notification-counter')).to_be_visible(timeout=15000)
        doctor.get_by_role('button', name=re.compile('Notificações,')).click()
        expect(doctor.locator('.notification-popover').get_by_text('Rafa Responsável · Nina Aurora', exact=True).first).to_be_visible()
        doctor.screenshot(path=str(OUT / 'doctor-notification.png'), full_page=True)
        doctor.locator('.notification-item').first.click()
        expect(doctor.get_by_text(first, exact=True)).to_be_visible()
        expect(doctor.locator('.message-author').filter(has_text='Rafa Responsável').first).to_be_visible()
        ok('Família envia mensagem, médico recebe aviso e abre a conversa com autor identificado')
        family.goto(BASE + '/familia')
        second = f'Resposta fictícia do médico {RUN}'
        doctor.get_by_label('Nova mensagem').fill(second)
        doctor.get_by_role('button', name='Enviar mensagem', exact=True).click()
        expect(doctor.get_by_text('Mensagem enviada e salva na API.')).to_be_visible()
        expect(family.locator('.notification-counter')).to_be_visible(timeout=15000)
        family.goto(BASE + '/familia/notificacoes')
        family.get_by_role('link', name='Abrir conversa', exact=True).first.click()
        expect(family.get_by_text(second, exact=True)).to_be_visible()
        ok('Médico responde e a família recebe notificação na própria conta')
        doctor.get_by_role('button', name='Enviar um aviso', exact=True).click()
        title = f'Aviso fictício {RUN}'
        doctor.get_by_label('Título do aviso').fill(title)
        doctor.get_by_label('Texto do aviso').fill('Este é um aviso de demonstração enviado à família vinculada.')
        doctor.get_by_role('button', name='Enviar aviso', exact=True).click()
        expect(doctor.get_by_text('Aviso enviado para 1 destinatário(s) vinculado(s).')).to_be_visible()
        family.goto(BASE + '/familia/notificacoes')
        expect(family.get_by_role('heading', name=title, exact=True)).to_be_visible(timeout=15000)
        notice = family.locator('.notification-full').filter(has_text=title)
        notice.get_by_role('button', name='Marcar como lida').click()
        expect(notice.get_by_text('Lida', exact=True)).to_be_visible()
        ok('Aviso explícito do médico fica salvo e tem leitura individual')
        for width in (375, 768, 1440):
            family.set_viewport_size({'width': width, 'height': 1000})
            family.goto(BASE + '/familia/mensagens?paciente=1')
            expect(family.get_by_label('Nova mensagem')).to_be_visible()
            assert family.evaluate('document.documentElement.scrollWidth <= innerWidth')
            family.screenshot(path=str(OUT / f'chat-{width}.png'), full_page=True)
            ok(f'Central de conversas responsiva em {width}px')
        family.goto(BASE + '/familia/ia')
        expect(family.get_by_text('Integração configurada', exact=True)).to_be_visible()
        family.get_by_label('Sua mensagem para o Pendi').fill('Como converso com a equipe pelo Pendi?')
        family.get_by_role('button', name='Enviar para o Pendi', exact=True).click()
        expect(family.locator('.ai-conversation .message-bubble:not(.mine)')).to_have_count(1, timeout=100000)
        family.get_by_text('Base consultada pelo Pendi', exact=True).click()
        expect(family.locator('.rag-sources li').first).to_be_visible()
        family.screenshot(path=str(OUT / 'guardian-rag.png'), full_page=True)
        ok('Chat adulto responde com Gemma real e mostra a base consultada')
        family.set_viewport_size({'width': 375, 'height': 1000})
        family.goto(BASE + '/crianca/1/conversar')
        expect(family.get_by_role('heading', name='Oi, eu sou o Pendi!')).to_be_visible()
        family.get_by_label('Meu responsável está comigo e autoriza usar o microfone.').check()
        family.get_by_role('button', name='Falar com o Pendi', exact=True).click()
        expect(family.get_by_role('button', name='Parar e transcrever')).to_be_visible()
        family.wait_for_timeout(7500)
        before = len(child_requests)
        family.get_by_role('button', name='Parar e transcrever').click()
        expect(family.locator('#child-ai-message')).to_have_value(re.compile('brincar', re.I), timeout=100000)
        assert len(child_requests) == before
        family.screenshot(path=str(OUT / 'child-voice-review.png'), full_page=True)
        ok('Gravação sintética percorre MediaRecorder e Whisper, sem envio automático ao modelo')
        family.locator('#child-ai-message').fill('Vamos imaginar uma aventura com uma estrela?')
        family.get_by_role('button', name='Enviar para o Pendi', exact=True).click()
        expect(family.locator('.child-chat-message:not(.from-child)')).to_have_count(1, timeout=100000)
        assert len(child_requests) == before + 1
        family.screenshot(path=str(OUT / 'child-chat-response.png'), full_page=True)
        ok('Criança revisa o texto, envia e recebe resposta infantil do Pendi real')
        family.locator('#child-ai-message').fill('Qual dose devo tomar?')
        family.get_by_role('button', name='Enviar para o Pendi', exact=True).click()
        expect(family.locator('.child-chat-message').filter(has_text='adulto de confiança')).to_be_visible(timeout=15000)
        ok('Pergunta clínica infantil encaminha para adulto sem sugerir dose')
        assert family.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not external_calls
        ok('Browser não acessa diretamente o provedor nem recebe a chave da API')
        assert not errors, errors
        ok('Nenhum erro JavaScript não tratado no percurso')
        browser.close()
except Exception as error:
    results.append({'test': 'Execução comunicação', 'status': 'FALHOU', 'detail': str(error)})
    raise
finally:
    (OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
