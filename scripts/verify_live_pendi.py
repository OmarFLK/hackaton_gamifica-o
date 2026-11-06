"""Verifica integração real sem imprimir chave, token ou cabeçalhos."""
import json
from pathlib import Path
from time import perf_counter
import httpx
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
secret = dotenv_values(ROOT / 'backend' / '.env').get('BARO_API_KEY', '')
results = []
with httpx.Client(base_url='http://127.0.0.1:8000', timeout=120) as client:
    headers = {}
    for name, account in [('guardian', 'responsavel'), ('clinician', 'medico')]:
        login = client.post('/api/auth/login', json={'email': account + '@superped.demo', 'password': 'Demo2026!'})
        login.raise_for_status()
        headers[name] = {'Authorization': 'Bearer ' + login.json()['access_token']}
    for audience, route, question in [
        ('guardian', '/api/ai/chat', 'Como posso conversar com a equipe pelo Pendi?'),
        ('clinician', '/api/ai/chat', 'Como consulto as conversas dos pacientes vinculados?'),
        ('child', '/api/ai/child/1/chat', 'Podemos imaginar uma aventura nas estrelas?'),
    ]:
        started = perf_counter()
        response = client.post(route, headers=headers['guardian' if audience == 'child' else audience], json={'question': question})
        if response.status_code != 200:
            print(f'{audience}: integração respondeu HTTP {response.status_code}, sem exibir credenciais.')
            raise SystemExit(1)
        body = response.json()
        if secret and secret in json.dumps(body):
            raise SystemExit('Falha de proteção detectada; resposta não exibida.')
        assert body['audience'] == audience and body['is_ai']
        assert body['citations'] and all(item['id'].startswith(audience + '-') for item in body['citations'])
        result = {'audience': audience, 'model': 'google/gemma-3-27b', 'answer': body['answer'], 'citations': body['citations'], 'seconds': round(perf_counter() - started, 2)}
        results.append(result)
        print(f'PASSOU: Pendi / {audience} / RAG isolado / {result["seconds"]}s', flush=True)
    audio = ROOT / '.runtime' / 'pendi-speech-test.wav'
    if audio.exists():
        with audio.open('rb') as file:
            response = client.post('/api/speech/transcribe', headers=headers['guardian'], data={'patient_id': '1'}, files={'audio': ('frase-sintetica.wav', file, 'audio/wav')})
        assert response.status_code == 200, f'Transcrição HTTP {response.status_code}'
        body = response.json()
        assert body['review_required'] and 'brincar' in body['text'].lower()
        results.append({'speech': 'Portuguese synthetic sample', 'text': body['text'], 'review_required': True})
        print('PASSOU: voz sintética em português transcrita e marcada para revisão.', flush=True)
out = ROOT / '.runtime' / 'pendi-live-results.json'
out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
print('Resultados de demonstração salvos sem segredos.')
