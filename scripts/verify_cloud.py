"""Valida HTTPS, CORS, contas, vinculos, escrita e IA nas URLs publicadas.

Usa somente contas e registros ficticios. Nao imprime tokens ou credenciais.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--api-url', default='https://pendi-demo-api.onrender.com')
    parser.add_argument('--frontend-url', default='https://hackatongamifica-o.vercel.app')
    parser.add_argument('--with-ai', action='store_true')
    args = parser.parse_args()
    results = []

    def ok(label):
        results.append({'test': label, 'status': 'PASSOU'})
        print('PASSOU:', label, flush=True)

    def payload(response, status=200):
        assert response.status_code == status, f'HTTP {response.status_code}: {response.request.method} {response.request.url.path}'
        return response.json()

    with httpx.Client(base_url=args.api_url, timeout=110, trust_env=False) as api:
        assert payload(api.get('/api/health')) == {'status': 'ok', 'demo': True}
        ok('Render HTTPS: /api/health 200')
        preflight = api.options('/api/patients', headers={'Origin': args.frontend_url,
            'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'authorization,content-type'})
        assert preflight.headers.get('access-control-allow-origin') == args.frontend_url
        blocked = api.options('/api/patients', headers={'Origin': 'https://origin-invalida.example',
            'Access-Control-Request-Method': 'GET'})
        assert 'access-control-allow-origin' not in blocked.headers
        assert api.get('/api/patients').status_code == 401
        ok('CORS aceita a Vercel; origem externa e acesso sem token bloqueados')
        sessions = {}
        for label, email in [('clinician', 'medico'), ('guardian', 'responsavel'), ('theo', 'responsavel.theo'),
                            ('lia', 'responsavel.lia'), ('assistant', 'assistente'), ('developer', 'dev')]:
            login = payload(api.post('/api/auth/login', json={'email': email + '@superped.demo', 'password': 'Demo2026!'}))
            sessions[label] = {'Authorization': 'Bearer ' + login['access_token']}
        ok('Seis contas ficticias autenticam com JWT')
        children = {}
        for label, expected in [('guardian', 'Nina Aurora'), ('theo', 'Theo Nuvem'), ('lia', 'Lia Sol')]:
            rows = payload(api.get('/api/patients', headers=sessions[label]))
            children[label] = next(row['id'] for row in rows if row['name'] == expected)
            assert not {'Nina Aurora', 'Theo Nuvem', 'Lia Sol'}.difference({expected}).intersection(row['name'] for row in rows)
        nina, theo = children['guardian'], children['theo']
        for path in ('', '/dashboard', '/messages', '/moods', '/games', '/medications'):
            assert api.get(f'/api/patients/{theo}{path}', headers=sessions['guardian']).status_code == 403
        assert api.post(f'/api/ai/child/{theo}/chat', headers=sessions['guardian'], json={'question': 'Ola'}).status_code == 403
        assert api.get('/api/patients', headers=sessions['developer']).status_code == 403
        ok('Cada responsavel ve seus vinculos; URLs de outra crianca e IA infantil retornam 403')
        marker = 'Teste cloud ' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')
        mood = payload(api.post(f'/api/patients/{nina}/moods', headers=sessions['guardian'],
            json={'score': 4, 'source': 'GUARDIAN', 'note': marker}), 201)
        moods = payload(api.get(f'/api/patients/{nina}/moods', headers=sessions['guardian']))
        assert any(row['id'] == mood['id'] for row in moods)
        ok('Relato ficticio escrito e relido pelo backend no PostgreSQL Neon')
        previous_notices = {row['id'] for row in payload(api.get('/api/notifications', headers=sessions['guardian']))['items']}
        message = payload(api.post(f'/api/patients/{nina}/messages', headers=sessions['clinician'], json={'body': marker}), 201)
        messages = payload(api.get(f'/api/patients/{nina}/messages', headers=sessions['guardian']))
        assert any(row['id'] == message['id'] for row in messages)
        notices = payload(api.get('/api/notifications', headers=sessions['guardian']))['items']
        assert any(row['id'] not in previous_notices and row['patient_id'] == nina and row['kind'] == 'message' for row in notices)
        assert not any(row['patient_id'] == nina for row in payload(api.get('/api/notifications', headers=sessions['theo']))['items'])
        ok('Mensagem medico-familia persiste e notifica apenas o responsavel vinculado')
        guarded = payload(api.post(f'/api/ai/child/{nina}/chat', headers=sessions['guardian'], json={'question': 'Qual dose devo tomar?'}))
        assert guarded['escalate'] and not guarded['is_ai']
        ok('Protecao infantil encaminha pergunta clinica ao adulto')
        speech = payload(api.get('/api/speech/status', headers=sessions['guardian']))
        results.append({'test': 'Whisper no Render', 'available': speech['available'],
                        'note': 'Sem modelo no servidor, a interface usa reconhecimento do navegador quando disponivel.'})
        if args.with_ai:
            for label, audience, path, question in [
                ('guardian', 'guardian', '/api/ai/chat', 'Como registro agua e refeicoes no Pendi?'),
                ('clinician', 'clinician', '/api/ai/chat', 'Como uso os vinculos e as mensagens no sistema Pendi?'),
                ('guardian', 'child', f'/api/ai/child/{nina}/chat', 'Vamos imaginar uma estrela e uma nuvem com o Pandi?'),
            ]:
                answer = payload(api.post(path, headers=sessions[label], json={'question': question}))
                assert answer['is_ai'] and answer['answer'] and answer['audience'] == audience
                assert answer['citations'] and all(c['id'].startswith(audience + '-') for c in answer['citations'])
                ok('Gemma real + RAG isolado por perfil: ' + audience)
    with httpx.Client(timeout=30, trust_env=False) as web:
        for path, expected_type in [('/', 'text/html'), ('/familia', 'text/html'), ('/login', 'text/html'),
                                    ('/mascote/pandi-principal.png', 'image/png'), ('/sw.js', 'javascript')]:
            response = web.get(args.frontend_url + path)
            assert response.status_code == 200 and expected_type in response.headers.get('content-type', '')
        ok('Vercel publica sem autenticacao da hospedagem: SPA, rotas internas, PNG e service worker')
    report = ROOT / '.runtime' / 'cloud-api-checks.json'
    report.write_text(json.dumps({'checked_at': datetime.now(timezone.utc).isoformat(),
        'api_url': args.api_url, 'frontend_url': args.frontend_url, 'results': results}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Relatorio: .runtime/cloud-api-checks.json')


if __name__ == '__main__':
    main()
