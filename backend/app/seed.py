"""Seed idempotente de dados 100% fictícios.

Uso: `python -m app.seed` (exige DEMO_MODE=true).
Reset local: `ALLOW_DB_RESET=true python -m app.seed --reset` (somente SQLite).
Datas são relativas ao dia atual, para os gráficos de 7 dias terem conteúdo.
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import select

from app.core import database
from app.core.config import demo_mode
from app.core.security import hash_password
from app.models.entities import (ClinicianDelegate, GameSession, MedicationSchedule, MoodEntry, Patient,
                                 PatientGuardian, RoutineEntry, User)

SEED_FILE = Path(__file__).resolve().parent / 'demo_seed.json'


def _when(days_ago: int, hour: int) -> str:
    moment = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return moment.replace(hour=hour, minute=0, second=0, microsecond=0).isoformat()


def run_seed() -> dict:
    if not demo_mode():
        raise RuntimeError('Seed de demonstração disponível somente com DEMO_MODE=true.')
    database.init_db()
    data = json.loads(SEED_FILE.read_text(encoding='utf-8'))
    created = {'users': 0, 'patients': 0}
    with database.SessionLocal() as db:
        users = {}
        for account in data['accounts']:
            user = db.scalar(select(User).where(User.email == account['email']))
            if not user:
                user = User(name=account['name'], email=account['email'], role=account['role'],
                            password_hash=hash_password(account['password']))
                db.add(user)
                created['users'] += 1
            users[account['email']] = user
        db.flush()

        for item in data.get('delegations', []):
            clinician, assistant = users[item['clinician_email']], users[item['assistant_email']]
            if not db.scalar(select(ClinicianDelegate).where(ClinicianDelegate.clinician_id == clinician.id,
                                                             ClinicianDelegate.assistant_user_id == assistant.id)):
                db.add(ClinicianDelegate(clinician_id=clinician.id, assistant_user_id=assistant.id))

        clinical = {item['patient']: item for item in data.get('clinical_demo', [])}
        patients, fresh = {}, set()
        for item in data['patients']:
            patient = db.scalar(select(Patient).where(Patient.name == item['name']))
            if not patient:
                extra = clinical.get(item['name'], {})
                patient = Patient(name=item['name'], birth_date=item['birth_date'], chosen_avatar=item['chosen_avatar'],
                                  clinician_id=users[item['clinician_email']].id,
                                  cancer_type_demo=extra.get('cancer_type_demo'),
                                  clinical_stage_demo=extra.get('clinical_stage_demo'),
                                  clinical_notes=extra.get('clinical_notes'))
                db.add(patient)
                db.flush()
                db.add(PatientGuardian(patient_id=patient.id, guardian_user_id=users[item['guardian_email']].id))
                fresh.add(item['name'])
                created['patients'] += 1
            patients[item['name']] = patient
        db.flush()

        guardian = users.get('responsavel@superped.demo')
        for item in data.get('medications', []):
            patient = patients[item['patient']]
            if not db.scalar(select(MedicationSchedule).where(MedicationSchedule.patient_id == patient.id,
                                                              MedicationSchedule.label == item['label'])):
                db.add(MedicationSchedule(patient_id=patient.id, label=item['label'], times_json=item['times_json'],
                                          clinician_id=patient.clinician_id))
        # Históricos só na primeira criação do paciente: rodar 2x não duplica.
        for index, item in enumerate(data.get('mood_demo', [])):
            if item['patient'] in fresh:
                db.add(MoodEntry(patient_id=patients[item['patient']].id, score=item['score'], source=item['source'],
                                 recorded_at=_when(item.get('days_ago', 0), 12 + index % 6),
                                 reporter_user_id=guardian.id if guardian else None))
        for index, item in enumerate(data.get('routines_demo', [])):
            if item['patient'] in fresh:
                db.add(RoutineEntry(patient_id=patients[item['patient']].id, kind=item['kind'],
                                    quantity=item.get('quantity'), unit=item.get('unit'),
                                    description=item.get('description'), source='GUARDIAN',
                                    recorded_at=_when(item.get('days_ago', 0), 11 + index % 8),
                                    reporter_user_id=guardian.id if guardian else None))
        for item in data.get('games_demo', []):
            if item['patient'] in fresh:
                db.add(GameSession(patient_id=patients[item['patient']].id, game=item['game'], mode=item['mode'],
                                   duration_seconds=item['duration_seconds'],
                                   created_at=_when(item.get('days_ago', 0), 16),
                                   reporter_user_id=guardian.id if guardian else None))
        db.commit()
    return created


def reset_local_db():
    if os.getenv('ALLOW_DB_RESET', 'false').lower() != 'true' or not str(database.engine.url).startswith('sqlite'):
        raise RuntimeError('Reset permitido apenas em SQLite local com ALLOW_DB_RESET=true.')
    from app.core.database import Base
    database.init_db()
    Base.metadata.drop_all(database.engine)


if __name__ == '__main__':
    if '--reset' in sys.argv:
        reset_local_db()
        print('Banco local apagado.')
    print('Seed DEMO:', run_seed())
