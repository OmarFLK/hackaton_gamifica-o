"""Prepara ambientes privados a partir do Neon; nunca imprime valores secretos."""
import argparse
from datetime import datetime
from pathlib import Path
import secrets
from urllib.parse import urlsplit

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]


def write_env(path, values):
    from json import dumps
    path.write_text(''.join(f'{key}={dumps(str(value), ensure_ascii=True)}\n' for key, value in values.items()), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--frontend-url', default='https://hackatongamifica-o.vercel.app')
    parser.add_argument('--api-url')
    args = parser.parse_args()
    neon = dotenv_values(ROOT / '.env.local')
    url = neon.get('DATABASE_URL') or ''
    if urlsplit(url).hostname != 'ep-tiny-breeze-be7cwhq0-pooler.c-9.us-east-2.aws.neon.tech':
        raise SystemExit('O Neon vinculado nao corresponde ao endpoint fornecido. Nenhum ambiente alterado.')
    if urlsplit(args.frontend_url).scheme != 'https':
        raise SystemExit('Use a origem HTTPS real do frontend.')
    backend_file = ROOT / 'backend' / '.env'
    local = {k: v for k, v in dotenv_values(backend_file).items() if v is not None}
    production_file = ROOT / 'backend' / '.env.render'
    previous = dotenv_values(production_file) if production_file.exists() else {}
    backup_dir = ROOT / '.runtime' / 'backups'
    backup_dir.mkdir(parents=True, exist_ok=True)
    if backend_file.exists() and local.get('DATABASE_URL') != url:
        backup = backup_dir / ('backend-before-cloud-' + datetime.now().strftime('%Y%m%d-%H%M%S') + '.env')
        backup.write_bytes(backend_file.read_bytes())
    production = {
        'PYTHON_VERSION': '3.13.6', 'DEMO_MODE': 'true', 'DATABASE_URL': url,
        'DATABASE_URL_UNPOOLED': neon.get('DATABASE_URL_UNPOOLED', ''),
        'JWT_SECRET': previous.get('JWT_SECRET') or secrets.token_urlsafe(48),
        'JWT_EXPIRE_MINUTES': '120', 'FRONTEND_URL': args.frontend_url.rstrip('/'),
        'ALLOW_DB_RESET': 'false', 'AI_API_URL': 'https://ia.maua.br/api/v1',
        'BARO_API_KEY': local.get('BARO_API_KEY') or local.get('AI_API_KEY', ''),
        'AI_PROVIDER_LABEL': 'Pendi', 'AI_API_MODEL': local.get('AI_API_MODEL', 'google/gemma-3-27b'),
        'AI_ALLOWED_HOSTS': 'ia.maua.br', 'AI_ALLOW_HTTP': 'false',
    }
    write_env(production_file, production)
    local.update(DATABASE_URL=url, DATABASE_URL_UNPOOLED=production['DATABASE_URL_UNPOOLED'])
    origins = [args.frontend_url.rstrip('/'), 'http://localhost:5173', 'http://127.0.0.1:5173',
               'http://localhost:5174', 'http://127.0.0.1:5174']
    local['FRONTEND_URL'] = ','.join(origins)
    write_env(backend_file, local)
    print('Preparados: backend/.env (Neon + teste local), backend/.env.render (importacao privada no Render).')
    if args.api_url:
        parsed = urlsplit(args.api_url)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.path not in ('', '/'):
            raise SystemExit('Use a origem HTTPS real da API, sem /api no final.')
        frontend = {'VITE_API_URL': args.api_url.rstrip('/'), 'VITE_DEMO_MODE': 'true'}
        write_env(ROOT / 'frontend' / '.env.vercel', frontend)
        write_env(ROOT / 'frontend' / '.env.production.local', frontend)
        print('Preparados: frontend/.env.vercel e frontend/.env.production.local (somente configuracao publica).')


if __name__ == '__main__':
    main()
