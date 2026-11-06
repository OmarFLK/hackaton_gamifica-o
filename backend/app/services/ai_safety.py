import os
import re
import threading
from collections import defaultdict, deque
from time import monotonic
from fastapi import HTTPException
from app.routers.assistant import is_clinical_question

_lock = threading.Lock()
_hits = defaultdict(deque)


def reset_limits():
    with _lock:
        _hits.clear()


def limit_request(user_id, bucket, limit=12):
    now = monotonic()
    with _lock:
        events = _hits[(user_id, bucket)]
        while events and events[0] < now - 60:
            events.popleft()
        if len(events) >= limit:
            raise HTTPException(429, 'Muitas solicitações em sequência. Aguarde um pouco antes de tentar novamente.', headers={'Retry-After': '60'})
        events.append(now)


def redact(text):
    for name in ('BARO_API_KEY', 'AI_API_KEY', 'JWT_SECRET'):
        secret = os.getenv(name, '')
        if len(secret) >= 8:
            text = text.replace(secret, '[informação protegida]')
    return re.sub(r'\bbaro_[A-Za-z0-9_-]+', '[informação protegida]', text, flags=re.I)


def safe_reply(question, audience):
    normalized = question.lower()
    secret_attempt = re.search(r'(api.?key|chave.{0,20}api|token.{0,15}(?:acesso|secreto)|senha|system prompt|prompt.{0,12}sistema|instru[çc][oõ]es internas|ignore.{0,25}(?:instru|regras)|reveal.{0,20}(?:key|secret))', normalized)
    if secret_attempt:
        return 'Não compartilho senhas, chaves ou instruções internas. Posso ajudar a usar o Pendi.' if audience != 'child' else 'Segredos e senhas ficam protegidos. Vamos escolher uma brincadeira ou chamar um adulto?'
    danger = re.search(r'(quero (?:morrer|me matar)|me machucar|me matar|estou em perigo|sangrando|sem ar|abuso)', normalized)
    if audience == 'child' and re.search(r'(pornograf|conte[uú]do sexual|fotos? (?:nu|pelad)|como fazer.{0,20}(?:bomba|arma)|como me matar)', normalized):
        return 'Vamos conversar sobre uma brincadeira, uma história ou como você está se sentindo? Para esse assunto, chame um adulto de confiança perto de você.'
    if audience == 'child' and (is_clinical_question(question) or danger):
        return 'Chame agora um adulto de confiança que esteja com você e conte o que está acontecendo. Eu sou o Pendi, um amigo virtual, e não consigo cuidar disso sozinho.'
    if audience != 'child' and is_clinical_question(question):
        return 'Não posso avaliar sintomas, diagnóstico, doses ou tratamento individual. Converse com a equipe responsável. Em urgência, procure o serviço local e não aguarde resposta deste chat.'
    return None
