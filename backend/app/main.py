from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import demo_mode, frontend_origins, jwt_secret
from app.core.database import init_db
from app.routers import (assistant, auth, developer, games, medications, messages, mood, patients, routines)
from app.seed import run_seed
from app.routers import conversations, notifications, ai, speech, guardians


@asynccontextmanager
async def lifespan(app):
    jwt_secret()  # falha cedo se o segredo não estiver configurado
    init_db()
    if demo_mode():
        run_seed()  # idempotente; fora de DEMO_MODE nenhuma conta fictícia é criada
    yield


app = FastAPI(title='Pendi (SuperPed) — API DEMONSTRAÇÃO', version='0.2.0', lifespan=lifespan,
              description='Demonstração acadêmica com dados 100% fictícios. Não validado para uso clínico.')
app.add_middleware(CORSMiddleware, allow_origins=frontend_origins(), allow_credentials=False,
                   allow_methods=['GET', 'POST', 'PUT'], allow_headers=['Authorization', 'Content-Type'])


@app.middleware('http')
async def security_headers(request, call_next):
    limit = 6 * 1024 * 1024 if request.url.path == '/api/speech/transcribe' else 64 * 1024
    length = request.headers.get('content-length')
    try:
        if length and int(length) > limit:
            return JSONResponse(status_code=413, content={'detail': 'Solicitação maior que o limite permitido.'})
    except ValueError:
        return JSONResponse(status_code=400, content={'detail': 'Tamanho de solicitação inválido.'})
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    if request.url.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
    return response

for router in (auth.router, patients.router, routines.router, mood.router, games.router,
               medications.router, messages.router, assistant.router, developer.router,
               conversations.router, notifications.router, ai.router, speech.router, guardians.router):
    app.include_router(router)


@app.get('/api/health')
def health():
    return {'status': 'ok', 'demo': demo_mode()}
