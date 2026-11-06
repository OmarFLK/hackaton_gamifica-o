from sqlalchemy import func, select

from app import seed
from app.core import database
from app.models import entities


def count(db, model):
    return db.scalar(select(func.count()).select_from(model))


def test_seed_twice_does_not_duplicate_anything(client):
    with database.SessionLocal() as db:
        before = {m.__name__: count(db, m) for m in (entities.User, entities.Patient, entities.PatientGuardian,
                                                      entities.MoodEntry, entities.RoutineEntry, entities.GameSession,
                                                      entities.ClinicianDelegate)}
    assert seed.run_seed() == {'users': 0, 'patients': 0}
    with database.SessionLocal() as db:
        after = {m.__name__: count(db, m) for m in (entities.User, entities.Patient, entities.PatientGuardian,
                                                     entities.MoodEntry, entities.RoutineEntry, entities.GameSession,
                                                     entities.ClinicianDelegate)}
    assert before == after
    assert after['User'] == 6 and after['Patient'] == 3 and after['PatientGuardian'] == 3
    assert after['MoodEntry'] > 0 and after['RoutineEntry'] > 0


def test_relationships_and_no_plaintext(client):
    with database.SessionLocal() as db:
        nina = db.scalar(select(entities.Patient).where(entities.Patient.name == 'Nina Aurora'))
        clinician = db.get(entities.User, nina.clinician_id)
        assert clinician.email == 'medico@superped.demo'
        assert db.scalar(select(func.count()).select_from(entities.PatientGuardian)
                         .where(entities.PatientGuardian.patient_id == nina.id)) == 1
        for user in db.scalars(select(entities.User)):
            assert 'Demo2026!' not in user.password_hash
        assert nina.cancer_type_demo and 'demo' in nina.cancer_type_demo.lower()


def test_seed_repairs_legacy_shared_guardian_links(client):
    """Bancos de seeds antigos tinham um responsável ligado a todas as crianças."""
    with database.SessionLocal() as db:
        rafa = db.scalar(select(entities.User).where(entities.User.email == 'responsavel@superped.demo'))
        for name in ('Theo Nuvem', 'Lia Sol'):
            patient = db.scalar(select(entities.Patient).where(entities.Patient.name == name))
            db.add(entities.PatientGuardian(patient_id=patient.id, guardian_user_id=rafa.id))
        db.commit()
    seed.run_seed()
    with database.SessionLocal() as db:
        rafa = db.scalar(select(entities.User).where(entities.User.email == 'responsavel@superped.demo'))
        linked = db.scalars(select(entities.PatientGuardian.patient_id).where(entities.PatientGuardian.guardian_user_id == rafa.id)).all()
        nina = db.scalar(select(entities.Patient.id).where(entities.Patient.name == 'Nina Aurora'))
        assert linked == [nina]
