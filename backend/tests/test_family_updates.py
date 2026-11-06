from app.core import database
from app.models.entities import User

ACCOUNT = {'name': 'Responsavel Novo', 'email': ' NOVO@FAMILIA.DEMO ', 'password': 'SenhaFicticia2026!'}


def test_clinician_creates_guardian_and_can_link_patient(client, tokens):
    response = client.post('/api/guardians', headers=tokens['clinician'], json=ACCOUNT)
    assert response.status_code == 201
    guardian = response.json()
    assert guardian['email'] == 'novo@familia.demo'
    assert set(guardian) == {'id', 'name', 'email'}
    login = client.post('/api/auth/login', json={'email': guardian['email'], 'password': ACCOUNT['password']})
    assert login.status_code == 200 and login.json()['user']['role'] == 'GUARDIAN'
    headers = {'Authorization': 'Bearer ' + login.json()['access_token']}
    assert client.get('/api/patients', headers=headers).json() == []
    assert client.post('/api/patients/1/guardians', headers=tokens['clinician'], json={'guardian_user_id': guardian['id']}).status_code == 201
    assert [p['id'] for p in client.get('/api/patients', headers=headers).json()] == [1]
    with database.SessionLocal() as db:
        user = db.get(User, guardian['id'])
        assert user.password_hash.startswith('$argon2') and user.password_hash != ACCOUNT['password']


def test_guardian_creation_requires_clinician_and_rejects_role_injection(client, tokens):
    for role in ('guardian', 'assistant', 'developer'):
        assert client.post('/api/guardians', headers=tokens[role], json=ACCOUNT).status_code == 403
    assert client.post('/api/guardians', json=ACCOUNT).status_code == 401
    assert client.post('/api/guardians', headers=tokens['clinician'], json={**ACCOUNT, 'role': 'CLINICIAN'}).status_code == 422


def test_guardian_creation_validates_password_email_and_duplicate(client, tokens):
    for changes in ({'password': 'short'}, {'email': 'invalido'}, {'name': '  '}):
        assert client.post('/api/guardians', headers=tokens['clinician'], json={**ACCOUNT, **changes}).status_code == 422
    assert client.post('/api/guardians', headers=tokens['clinician'], json=ACCOUNT).status_code == 201
    assert client.post('/api/guardians', headers=tokens['clinician'], json={**ACCOUNT, 'email': 'novo@familia.demo'}).status_code == 409


def test_measurements_saved_edited_and_clinician_only(client, tokens):
    response = client.post('/api/patients', headers=tokens['clinician'], json={'name': 'Medidas Demo', 'birth_date': '2018-04-05', 'weight_kg': 27.5, 'height_cm': 125.2})
    assert response.status_code == 201
    pid = response.json()['id']
    detail = client.get(f'/api/patients/{pid}', headers=tokens['clinician']).json()
    assert detail['weight_kg'] == 27.5 and detail['height_cm'] == 125.2
    updated = client.put(f'/api/patients/{pid}/clinical-review', headers=tokens['clinician'], json={'weight_kg': 28.1}).json()
    assert updated['weight_kg'] == 28.1 and updated['height_cm'] == 125.2
    for role in ('guardian', 'assistant'):
        assert client.put('/api/patients/1/clinical-review', headers=tokens[role], json={'weight_kg': 20}).status_code == 403
    assert client.post('/api/patients', headers=tokens['assistant'], json={'name': 'Sem permissao', 'birth_date': '2018-04-05', 'clinician_id': 1, 'weight_kg': 20}).status_code == 403
    assert 'weight_kg' not in client.get('/api/patients/1', headers=tokens['guardian']).json()


def test_measurements_reject_invalid_numbers(client, tokens):
    for data in ({'weight_kg': 0}, {'weight_kg': -1}, {'weight_kg': 501}, {'height_cm': 251}, {'height_cm': -20}):
        assert client.put('/api/patients/1/clinical-review', headers=tokens['clinician'], json=data).status_code == 422


def test_general_notes_persist_to_doctor_dashboard_with_scope_and_author(client, tokens):
    response = client.post('/api/patients/1/routines', headers=tokens['guardian'], json={'kind': 'note', 'description': '  Dormiu bem.\nBrincou de estrela.  '})
    assert response.status_code == 201
    note = response.json()
    assert note['description'] == 'Dormiu bem.\nBrincou de estrela.' and note['source'] == 'GUARDIAN'
    me = client.get('/api/auth/me', headers=tokens['guardian']).json()
    assert note['reporter_user_id'] == me['id']
    dashboard = client.get('/api/patients/1/dashboard', headers=tokens['clinician']).json()
    assert any(n['id'] == note['id'] for n in dashboard['general_notes'])
    assert note['id'] not in [n['id'] for n in dashboard['meal_entries']]
    for role in ('clinician', 'assistant'):
        assert client.post('/api/patients/1/routines', headers=tokens[role], json={'kind': 'note', 'description': 'Teste'}).status_code == 403
    assert client.post('/api/patients/2/routines', headers=tokens['guardian'], json={'kind': 'note', 'description': 'Outro paciente'}).status_code == 403
    assert client.post('/api/patients/1/routines', headers=tokens['guardian'], json={'kind': 'note', 'description': '   '}).status_code == 422
