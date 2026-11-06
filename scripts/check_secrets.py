"""Falha sem imprimir credenciais caso encontre segredo em fonte ou build público."""
import os
from pathlib import Path
import re
import subprocess
from dotenv import dotenv_values
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
secrets = []
private_envs = [path for directory in (ROOT, ROOT / 'backend', ROOT / 'frontend')
                for path in directory.glob('.env*') if path.is_file() and not path.name.endswith('.example')]
for path in private_envs:
    for name, value in dotenv_values(path).items():
        if not value:
            continue
        if re.search(r'(?:KEY|TOKEN|SECRET|PASSWORD|DATABASE_URL)', name) and len(value) >= 20:
            secrets.append(value.encode())
        if name.startswith('DATABASE_URL'):
            password = urlsplit(value).password
            if password and len(password) >= 12:
                secrets.append(password.encode())
for name in ('BARO_API_KEY', 'AI_API_KEY', 'JWT_SECRET'):
    if (value := os.getenv(name)) and len(value) >= 20:
        secrets.append(value.encode())
paths = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
files = {ROOT / path for path in paths if path}
files.update((ROOT / 'frontend' / 'dist').rglob('*'))
violations = []
for path in files:
    if not path.is_file():
        continue
    content = path.read_bytes()
    if any(secret in content for secret in secrets) or re.search(rb'\b(?:baro_[A-Za-z0-9_-]{24,}|npg_[A-Za-z0-9]{12,})', content):
        violations.append(str(path.relative_to(ROOT)))
if violations:
    print('FALHOU: possível segredo em arquivos públicos:', ', '.join(violations))
    raise SystemExit(1)
print('PASSOU: nenhum segredo dos ambientes privados, token Baro ou senha Neon no Git ou build publico.')
