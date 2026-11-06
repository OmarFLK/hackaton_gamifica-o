from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import demo_support
from app.routers import assistant, developer, medications, messages


@asynccontextmanager
async def lifespan(app):
    demo_support.initialize_demo()
    yield


app = FastAPI(title='SuperPed — DEMONSTRAÇÃO módulos 10–18', version='0.1.0', lifespan=lifespan)
origins = [value.strip() for value in os.getenv('FRONTEND_URL', 'http://localhost:5173,http://127.0.0.1:5173').split(',') if value.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=['GET', 'POST', 'PUT'], allow_headers=['Authorization', 'Content-Type'])
for router in (demo_support.router, medications.router, messages.router, assistant.router, developer.router):
    app.include_router(router)


@app.get('/api/health')
def health():
    return {'status': 'ok', 'demo': demo_support.DEMO}
