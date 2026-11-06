import os
os.environ['DEMO_MODE'] = 'true'
os.environ['JWT_SECRET'] = 'tests-only-random-placeholder-0123456789abcdef'

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app import demo_support as support
from app.main import app


@pytest.fixture
def client(monkeypatch):
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    factory = sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(support, 'engine', engine)
    monkeypatch.setattr(support, 'SessionLocal', factory)
    with TestClient(app) as client:
        yield client
    engine.dispose()


@pytest.fixture
def tokens(client):
    result = {}
    for role, email in [('clinician', 'medico'), ('guardian', 'responsavel'), ('assistant', 'assistente'), ('developer', 'dev')]:
        response = client.post('/api/auth/login', json={'email': f'{email}@superped.demo', 'password': 'Demo2026!'})
        assert response.status_code == 200
        result[role] = {'Authorization': f"Bearer {response.json()['access_token']}"}
    return result
