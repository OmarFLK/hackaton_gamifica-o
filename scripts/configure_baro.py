"""Configura a chave via entrada oculta, sem argumentos, logs ou Git."""
import getpass
import json
import os
import secrets
import subprocess
from pathlib import Path

import httpx
from dotenv import set_key

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'backend' / '.env'
if not path.exists():
    example = (ROOT / 'backend' / '.env.example').read_text(encoding='utf-8')
    path.write_text(example.replace('SUBSTITUA_POR_UM_SEGREDO_ALEATORIO_COM_32_CARACTERES_OU_MAIS', secrets.token_urlsafe(48)), encoding='utf-8')
key = getpass.getpass('Chave Baro (entrada oculta): ').strip()
if not key:
    raise SystemExit('Chave vazia; nenhuma alteração realizada.')
set_key(str(path), 'BARO_API_KEY', key)
set_key(str(path), 'AI_API_URL', 'https://ia.maua.br/api/v1')
set_key(str(path), 'AI_PROVIDER_LABEL', 'Pendi')
set_key(str(path), 'AI_API_FORMAT', 'chat_completions')
if os.name == 'nt':
    account = subprocess.check_output(['whoami']).decode().strip()
    subprocess.run(['icacls', str(path), '/inheritance:r', '/grant:r', f'{account}:(F)', '*S-1-5-18:(F)'],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
else:
    os.chmod(path, 0o600)
try:
    response = httpx.get('https://ia.maua.br/api/v1/models', headers={'Authorization': f'Bearer {key}'}, timeout=30, follow_redirects=False)
    response.raise_for_status()
    ids = [item['id'] for item in response.json().get('data', []) if isinstance(item, dict) and isinstance(item.get('id'), str)]
    # Não substituir o Gemma solicitado por outro modelo silenciosamente.
    matches = [model for model in ids if 'gemma' in model.lower() and '27b' in model.lower()]
    if matches:
        selected = next((model for model in matches if 'it' in model.lower()), matches[0])
        set_key(str(path), 'AI_API_MODEL', selected)
        print('Modelo Gemma 27B encontrado:', selected)
    else:
        print('Gemma 27B não encontrado na listagem. Modelos anunciados:', json.dumps(ids, ensure_ascii=False))
    print('Configuração gravada somente em backend/.env; chave não exibida.')
except (httpx.HTTPError, ValueError, KeyError):
    print('Configuração local salva. Listagem dos modelos indisponível; chave e detalhes de conexão não foram exibidos.')
