"""Falha sem imprimir credenciais caso encontre segredo em fonte ou build público."""
import os
from pathlib import Path
import re
import subprocess
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
env = dotenv_values(ROOT / 'backend' / '.env')
secrets = [value.encode() for name in ('BARO_API_KEY', 'AI_API_KEY', 'JWT_SECRET') if (value := env.get(name) or os.getenv(name)) and len(value) >= 20]
paths = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
files = {ROOT / path for path in paths if path}
files.update((ROOT / 'frontend' / 'dist').rglob('*'))
violations = []
for path in files:
    if not path.is_file():
        continue
    content = path.read_bytes()
    if any(secret in content for secret in secrets) or re.search(rb'\bbaro_[A-Za-z0-9_-]{24,}', content):
        violations.append(str(path.relative_to(ROOT)))
if violations:
    print('FALHOU: possível segredo em arquivos públicos:', ', '.join(violations))
    raise SystemExit(1)
print('PASSOU: nenhuma chave local ou token Baro em arquivos versionados ou no build público.')
