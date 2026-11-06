"""Auth, permissões e endpoints dos módulos 04–09."""
import pytest

from app.core import database
from app.core.security import hash_password
from app.models import entities

TODAY_CHILD = '2018-03-04'


def me(client, headers):
    return client.get('/api/auth/me', headers=headers).json()


def test_login_contract_shape(client):
    body = client.post('/api/auth/login', json={'email': 'medico@superped.demo', 'password': 'Demo2026!'}).json()
    assert body['token_type'] == 'bearer'
    assert body['user']['role'] == 'CLINICIAN' and body['user']['name'] == 'Dra. Marina Demo'
    assert 'password_hash' not in body['user']


def test_unknown_email_is_401(client):
    assert client.post('/api/auth/login', json={'email': 'ninguem@superped.demo', 'password': 'Demo2026!'}).status_code == 401


def test_patient_scopes(client, tokens):
    assert len(client.get('/api/patients', headers=tokens['clinician']).json()) == 3
    assert len(client.get('/api/patients', headers=tokens['guardian']).json()) == 3
    # Assistente: somente pacientes de médicos que o delegaram explicitamente (seed).
    assert len(client.get('/api/patients', headers=tokens['assistant']).json()) == 3
    assert client.get('/api/patients', headers=tokens['developer']).status_code == 403
    assert client.get('/api/patients').status_code == 401


def test_clinical_fields_only_for_clinician(client, tokens):
    clinician = client.get('/api/patients/1', headers=tokens['clinician']).json()
    assert clinician['cancer_type_demo'] and clinician['guardians'][0]['name'] == 'Rafa Responsável'
    for role in ('guardian', 'assistant'):
        detail = client.get('/api/patients/1', headers=tokens[role])
        assert detail.status_code == 200
        assert not {'clinical_notes', 'cancer_type_demo', 'clinical_stage_demo'} & set(detail.json())
    assert client.get('/api/patients/1', headers=tokens['developer']).status_code == 403


def test_clinician_creates_patient_and_guardian_sees_it(client, tokens):
    guardian_id = me(client, tokens['guardian'])['id']
    created = client.post('/api/patients', headers=tokens['clinician'], json={
        'name': 'Bia Estrela', 'birth_date': TODAY_CHILD, 'chosen_avatar': 'faisca', 'guardian_user_id': guardian_id,
        'cancer_type_demo': 'Tipo fictício (demo)'})
    assert created.status_code == 201, created.text
    pid = created.json()['id']
    assert pid in [p['id'] for p in client.get('/api/patients', headers=tokens['guardian']).json()]
    assert client.get(f'/api/patients/{pid}/dashboard', headers=tokens['guardian']).status_code == 200


def test_assistant_creates_administrative_only(client, tokens):
    options = client.get('/api/patients/form-options', headers=tokens['assistant']).json()
    clinician_id = options['clinicians'][0]['id']
    base = {'name': 'Caio Lua', 'birth_date': TODAY_CHILD, 'clinician_id': clinician_id}
    assert client.post('/api/patients', headers=tokens['assistant'], json={**base, 'clinical_stage_demo': 'X'}).status_code == 403
    assert client.post('/api/patients', headers=tokens['assistant'], json={**base, 'clinician_id': 999}).status_code == 403
    created = client.post('/api/patients', headers=tokens['assistant'], json=base)
    assert created.status_code == 201
    pid = created.json()['id']
    assert client.put(f'/api/patients/{pid}/clinical-review', headers=tokens['assistant'], json={'clinical_stage_demo': 'X'}).status_code == 403
    assert client.post(f'/api/patients/{pid}/medications', headers=tokens['assistant'], json={'label': 'Medicamento A', 'times_json': ['08:00']}).status_code == 403
    guardian_id = me(client, tokens['guardian'])['id']
    assert client.post(f'/api/patients/{pid}/guardians', headers=tokens['assistant'], json={'guardian_user_id': guardian_id}).status_code == 201


@pytest.mark.parametrize('role', ['guardian', 'developer'])
def test_family_and_dev_cannot_create_patient(client, tokens, role):
    assert client.post('/api/patients', headers=tokens[role], json={'name': 'Teste', 'birth_date': TODAY_CHILD}).status_code == 403
    assert client.post('/api/patients/1/guardians', headers=tokens[role], json={'guardian_user_id': 2}).status_code == 403


def test_guardian_link_requires_guardian_role(client, tokens):
    clinician_id = me(client, tokens['clinician'])['id']
    assert client.post('/api/patients/1/guardians', headers=tokens['clinician'], json={'guardian_user_id': clinician_id}).status_code == 422


def test_clinical_review_by_clinician(client, tokens):
    response = client.put('/api/patients/1/clinical-review', headers=tokens['clinician'], json={'clinical_stage_demo': 'Estágio fictício revisado'})
    assert response.status_code == 200 and response.json()['clinical_stage_demo'] == 'Estágio fictício revisado'


def test_routines_and_moods_flow(client, tokens):
    water = client.post('/api/patients/1/routines', headers=tokens['guardian'], json={'kind': 'water', 'quantity': 180, 'unit': 'ml'})
    meal = client.post('/api/patients/1/routines', headers=tokens['guardian'], json={'kind': 'meal', 'description': 'Almoço relatado'})
    assert water.status_code == meal.status_code == 201
    assert water.json()['reporter_user_id'] == me(client, tokens['guardian'])['id'] and water.json()['source'] == 'GUARDIAN'
    mood = client.post('/api/patients/1/moods', headers=tokens['guardian'], json={'score': 4, 'source': 'CHILD'})
    assert mood.status_code == 201
    dash = client.get('/api/patients/1/dashboard', headers=tokens['clinician']).json()
    assert water.json()['id'] in [w['id'] for w in dash['water_entries']]
    assert mood.json()['id'] in [m['id'] for m in dash['mood_last_7_days']]
    assert dash['upcoming_medications'][0]['time'] == '08:00'
    assert 'não evolução clínica' in dash['disclaimer']


@pytest.mark.parametrize('body', [
    {'kind': 'water', 'quantity': -1, 'unit': 'ml'}, {'kind': 'water'}, {'kind': 'meal'},
    {'kind': 'meal', 'description': 'x' * 301}, {'kind': 'soda', 'quantity': 1},
    {'kind': 'water', 'quantity': 100, 'unit': 'ml', 'reporter_user_id': 1}])
def test_invalid_routines(client, tokens, body):
    assert client.post('/api/patients/1/routines', headers=tokens['guardian'], json=body).status_code == 422


@pytest.mark.parametrize('body', [{'score': 0, 'source': 'CHILD'}, {'score': 8, 'source': 'CHILD'},
                                  {'score': 4, 'source': 'CLINICIAN'}, {'score': 4, 'source': 'CHILD', 'reporter_user_id': 1}])
def test_invalid_moods(client, tokens, body):
    assert client.post('/api/patients/1/moods', headers=tokens['guardian'], json=body).status_code == 422


def test_only_guardian_writes_routine_mood_games(client, tokens):
    for role in ('clinician', 'assistant', 'developer'):
        assert client.post('/api/patients/1/moods', headers=tokens[role], json={'score': 4, 'source': 'CHILD'}).status_code == 403
        assert client.post('/api/patients/1/routines', headers=tokens[role], json={'kind': 'water', 'quantity': 1, 'unit': 'ml'}).status_code == 403
        assert client.post('/api/patients/1/games', headers=tokens[role], json={'game': 'bird', 'mode': 'touch', 'duration_seconds': 3}).status_code == 403


def test_games_save_and_validate(client, tokens):
    saved = client.post('/api/patients/1/games', headers=tokens['guardian'], json={'game': 'bird', 'mode': 'touch', 'duration_seconds': 25})
    assert saved.status_code == 201 and saved.json()['game'] == 'bird'
    assert client.post('/api/patients/1/games', headers=tokens['guardian'], json={'game': 'chess', 'mode': 'touch', 'duration_seconds': 1}).status_code == 422
    assert client.post('/api/patients/1/games', headers=tokens['guardian'], json={'game': 'star', 'mode': 'camera', 'duration_seconds': -1}).status_code == 422
    assert any(g['id'] == saved.json()['id'] for g in client.get('/api/patients/1/games', headers=tokens['clinician']).json())


def test_idor_new_resources(client, tokens):
    with database.SessionLocal() as db:
        outsider = entities.User(name='Outro médico', email='outro2@superped.demo', password_hash=hash_password('x'), role='CLINICIAN')
        db.add(outsider); db.flush()
        patient = entities.Patient(name='Sem vínculo', birth_date='2018-01-01', clinician_id=outsider.id)
        db.add(patient); db.commit(); pid = patient.id
    for role in ('clinician', 'guardian', 'assistant'):
        for path in ('', '/dashboard', '/moods', '/routines', '/games'):
            assert client.get(f'/api/patients/{pid}{path}', headers=tokens[role]).status_code == 403, (role, path)
    assert client.post(f'/api/patients/{pid}/moods', headers=tokens['guardian'], json={'score': 4, 'source': 'CHILD'}).status_code == 403
    assert client.get('/api/patients/99999', headers=tokens['clinician']).status_code == 403


def test_inactive_user_token_rejected(client, tokens):
    with database.SessionLocal() as db:
        user = db.get(entities.User, me(client, tokens['guardian'])['id'])
        user.active = False; db.commit()
    assert client.get('/api/auth/me', headers=tokens['guardian']).status_code == 401
