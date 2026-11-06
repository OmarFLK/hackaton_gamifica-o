"""Hash Argon2 (pwdlib) e JWT HS256 (pyjwt) com expiração curta."""
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import jwt_expire_minutes, jwt_secret

password_hash = PasswordHash.recommended()
# Usado quando o e-mail não existe, para que o tempo de resposta não revele contas.
_DUMMY_HASH = password_hash.hash('conta-inexistente-demo')


def hash_password(raw: str) -> str:
    return password_hash.hash(raw)


def verify_password(raw: str, hashed: str | None) -> bool:
    if not hashed:
        password_hash.verify(raw, _DUMMY_HASH)
        return False
    return password_hash.verify(raw, hashed)


def create_access_token(user_id: int, role: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=jwt_expire_minutes())
    return jwt.encode({'sub': str(user_id), 'role': role, 'exp': expires}, jwt_secret(), algorithm='HS256')


def decode_token(token: str) -> dict:
    return jwt.decode(token, jwt_secret(), algorithms=['HS256'], options={'require': ['exp', 'sub']})
