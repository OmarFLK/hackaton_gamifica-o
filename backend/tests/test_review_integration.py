"""Regressões encontradas durante a revisão do PR #1."""
import jwt
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import inspect, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.core import database
from app.core.config import jwt_secret
from app.models.entities import Patient, PatientGuardian, User


def test_legacy_file_upgrade_keeps_records_and_is_idempotent(tmp_path, monkeypatch):
    engine = database.make_engine(f'sqlite:///{tmp_path / "legacy.db"}')
    with engine.begin() as connection:
        connection.execute(text('CREATE TABLE users (id INTEGER PRIMARY KEY, name VARCHAR(120), email VARCHAR(200), password_hash TEXT, role VARCHAR(32), active BOOLEAN)'))
        connection.execute(text("INSERT INTO users VALUES (1, 'Medico demo', 'demo@example.test', 'hash-demo', 'CLINICIAN', 1)"))
        connection.execute(text('CREATE TABLE patients (id INTEGER PRIMARY KEY, name VARCHAR(120), birth_date VARCHAR(10), chosen_avatar VARCHAR(30), clinician_id INTEGER REFERENCES users(id))'))
        connection.execute(text("INSERT INTO patients VALUES (99, 'Paciente preservado', '2018-01-01', 'pandi', 1)"))
    monkeypatch.setattr(database, 'engine', engine)
    database.init_db()
    database.init_db()
    with sessionmaker(engine)() as db:
        patient = db.get(Patient, 99)
        assert patient.name == 'Paciente preservado' and patient.chosen_avatar == 'pandi'
        assert patient.clinical_notes is None
        patient.clinical_notes = 'Nota ficticia apos migracao'
        db.commit()
    engine.dispose()
    # Nova conexão no mesmo arquivo: dados sobrevivem ao reinício.
    restarted = database.make_engine(f'sqlite:///{tmp_path / "legacy.db"}')
    with sessionmaker(restarted)() as db:
        assert db.get(Patient, 99).clinical_notes == 'Nota ficticia apos migracao'
    assert {'mood_entries', 'routine_entries', 'game_sessions', 'medication_events', 'messages'} <= set(inspect(restarted).get_table_names())
    restarted.dispose()


def test_sqlite_rejects_orphan_guardian_link(tmp_path, monkeypatch):
    engine = database.make_engine(f'sqlite:///{tmp_path / "foreign-keys.db"}')
    monkeypatch.setattr(database, 'engine', engine)
    database.init_db()
    with sessionmaker(engine)() as db:
        db.add(PatientGuardian(patient_id=99999, guardian_user_id=99999))
        with pytest.raises(IntegrityError):
            db.commit()
    engine.dispose()


@pytest.mark.parametrize('resource,body', [
    ('routines', {'kind': 'water', 'quantity': 50, 'unit': 'ml'}),
    ('moods', {'score': 4, 'source': 'CHILD'}),
    ('games', {'game': 'star', 'mode': 'touch', 'duration_seconds': 2}),
    ('guardians', {'guardian_user_id': 2}),
])
def test_cannot_write_patient_outside_link(client, tokens, resource, body):
    with database.SessionLocal() as db:
        outsider = User(name='Outro demo', email='isolado@example.test', password_hash='unused', role='CLINICIAN')
        db.add(outsider); db.flush()
        patient = Patient(name='Paciente isolado', birth_date='2018-01-01', clinician_id=outsider.id)
        db.add(patient); db.commit(); pid = patient.id
    assert client.post(f'/api/patients/{pid}/{resource}', headers=tokens['guardian'], json=body).status_code == 403


def test_invalid_guardian_does_not_leave_partial_patient(client, tokens):
    before = len(client.get('/api/patients', headers=tokens['clinician']).json())
    response = client.post('/api/patients', headers=tokens['clinician'], json={'name': 'Nao deve persistir', 'birth_date': '2018-01-01', 'guardian_user_id': 99999})
    assert response.status_code == 422
    assert len(client.get('/api/patients', headers=tokens['clinician']).json()) == before


def test_token_claim_cannot_promote_guardian(client, tokens):
    user = client.get('/api/auth/me', headers=tokens['guardian']).json()
    token = jwt.encode({'sub': str(user['id']), 'role': 'CLINICIAN', 'exp': datetime.now(timezone.utc) + timedelta(minutes=5)}, jwt_secret(), algorithm='HS256')
    response = client.post('/api/patients', headers={'Authorization': f'Bearer {token}'}, json={'name': 'Bloqueado', 'birth_date': '2018-01-01'})
    assert response.status_code == 403


def test_guardian_dashboard_never_serializes_clinical_notes(client, tokens):
    body = client.get('/api/patients/1/dashboard', headers=tokens['guardian']).json()
    assert not {'clinical_notes', 'clinical_stage_demo', 'cancer_type_demo'} & set(body['patient'])


def test_game_author_cannot_be_forged(client, tokens):
    body = {'game': 'candle', 'mode': 'touch', 'duration_seconds': 3, 'reporter_user_id': 1}
    assert client.post('/api/patients/1/games', headers=tokens['guardian'], json=body).status_code == 422
