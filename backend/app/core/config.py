"""Configuração lida exclusivamente do ambiente (.env local ou variáveis do Render).

Nenhum segredo é versionado. DEMO_MODE controla a criação de contas fictícias.
"""
import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'


def demo_mode() -> bool:
    return os.getenv('DEMO_MODE', 'false').lower() == 'true'


def database_url() -> str:
    url = os.getenv('DATABASE_URL', '').strip() or 'sqlite:///./superped_demo.db'
    # Neon entrega "postgresql://"; o driver instalado é psycopg 3.
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql+psycopg://', 1)
    elif url.startswith('postgresql://'):
        url = url.replace('postgresql://', 'postgresql+psycopg://', 1)
    if os.getenv('RENDER') and url.startswith('sqlite'):
        raise RuntimeError('Render não tem disco persistente: configure DATABASE_URL (Neon). SQLite é só contingência local.')
    return url


def jwt_secret() -> str:
    secret = os.getenv('JWT_SECRET', '')
    if len(secret) < 32:
        raise RuntimeError('Defina JWT_SECRET com pelo menos 32 caracteres no ambiente.')
    return secret


def jwt_expire_minutes() -> int:
    return int(os.getenv('JWT_EXPIRE_MINUTES', '60'))


def frontend_origins() -> list[str]:
    return [value.strip() for value in os.getenv('FRONTEND_URL', DEFAULT_ORIGINS).split(',') if value.strip()]
