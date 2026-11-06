"""Pacientes: listagem por escopo, cadastro, ficha, vínculo familiar e dashboard.

Escopo: médico vê os seus; assistente vê os dos médicos que o delegaram
explicitamente (ClinicianDelegate); responsável vê só os vinculados; DEV nunca.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import delegated_clinician_ids, get_current_user, require_patient_access, require_role
from app.models.entities import (GameSession, MedicationSchedule, MoodEntry, Patient, PatientGuardian, RoutineEntry,
                                 User)
from app.models.schemas import (ClinicalReviewInput, Dashboard, GuardianLinkInput, GuardianOption, LinkedGuardian,
                                MoodOut, PatientClinical, PatientCreate, PatientDetail, PatientSummary, RoutineOut,
                                UpcomingMedication)

router = APIRouter(prefix='/api/patients', tags=['Pacientes'])
CLINICAL_FIELDS = ('clinical_notes', 'cancer_type_demo', 'clinical_stage_demo', 'weight_kg', 'height_cm')


def scoped_query(db: Session, user: User):
    if user.role == 'CLINICIAN':
        return select(Patient).where(Patient.clinician_id == user.id)
    if user.role == 'GUARDIAN':
        return select(Patient).join(PatientGuardian, PatientGuardian.patient_id == Patient.id).where(
            PatientGuardian.guardian_user_id == user.id)
    if user.role == 'CLINICAL_ASSISTANT':
        return select(Patient).where(Patient.clinician_id.in_(delegated_clinician_ids(db, user)))
    raise HTTPException(403, 'Perfil sem acesso a pacientes')


def detail_for(db: Session, user: User, patient: Patient) -> PatientDetail:
    guardians = db.scalars(select(User).join(PatientGuardian, PatientGuardian.guardian_user_id == User.id).where(
        PatientGuardian.patient_id == patient.id).order_by(User.name))
    clinician = db.get(User, patient.clinician_id)
    base = dict(PatientSummary.model_validate(patient).model_dump(), clinician_name=clinician.name if clinician else None,
                guardians=[LinkedGuardian.model_validate(g) for g in guardians])
    if user.role == 'CLINICIAN':
        return PatientClinical(**base, **{field: getattr(patient, field) for field in CLINICAL_FIELDS})
    return PatientDetail(**base)


@router.get('', response_model=list[PatientSummary])
def list_patients(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(scoped_query(db, user).order_by(Patient.name)))


@router.get('/form-options')
def form_options(user: User = Depends(require_role('CLINICIAN', 'CLINICAL_ASSISTANT')), db: Session = Depends(get_db)):
    """Opções do cadastro: médicos que o usuário pode representar e responsáveis demo existentes."""
    clinician_ids = [user.id] if user.role == 'CLINICIAN' else delegated_clinician_ids(db, user)
    clinicians = db.scalars(select(User).where(User.id.in_(clinician_ids)).order_by(User.name))
    guardians = db.scalars(select(User).where(User.role == 'GUARDIAN', User.active.is_(True)).order_by(User.name))
    return {'clinicians': [GuardianOption.model_validate(c) for c in clinicians],
            'guardians': [GuardianOption.model_validate(g) for g in guardians]}


def link_guardian(db: Session, patient_id: int, guardian_user_id: int):
    guardian = db.get(User, guardian_user_id)
    if not guardian or guardian.role != 'GUARDIAN' or not guardian.active:
        raise HTTPException(422, 'Selecione uma conta de responsável válida')
    exists = db.scalar(select(PatientGuardian.id).where(PatientGuardian.patient_id == patient_id,
                                                        PatientGuardian.guardian_user_id == guardian_user_id))
    if not exists:
        db.add(PatientGuardian(patient_id=patient_id, guardian_user_id=guardian_user_id))


@router.post('', response_model=PatientSummary, status_code=201)
def create_patient(data: PatientCreate, user: User = Depends(require_role('CLINICIAN', 'CLINICAL_ASSISTANT')),
                   db: Session = Depends(get_db)):
    if user.role == 'CLINICIAN':
        if data.clinician_id not in (None, user.id):
            raise HTTPException(403, 'O médico só cadastra pacientes sob sua responsabilidade')
        clinician_id = user.id
    else:
        if any(getattr(data, field) for field in CLINICAL_FIELDS):
            raise HTTPException(403, 'Assistente não registra diagnóstico, estágio ou notas clínicas')
        if data.clinician_id is None or data.clinician_id not in delegated_clinician_ids(db, user):
            raise HTTPException(403, 'Selecione um médico que delegou o cadastro a você')
        clinician_id = data.clinician_id
    fields = data.model_dump(exclude={'guardian_user_id', 'clinician_id', 'birth_date'})
    patient = Patient(**fields, birth_date=data.birth_date.isoformat(), clinician_id=clinician_id)
    db.add(patient)
    db.flush()
    if data.guardian_user_id is not None:
        link_guardian(db, patient.id, data.guardian_user_id)
    db.commit()
    db.refresh(patient)
    return patient


@router.get('/{patient_id}')
def get_patient(patient: Patient = Depends(require_patient_access()), user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    return detail_for(db, user, patient)


@router.post('/{patient_id}/guardians', status_code=201)
def add_guardian(data: GuardianLinkInput, patient: Patient = Depends(require_patient_access('CLINICIAN', 'CLINICAL_ASSISTANT')),
                 db: Session = Depends(get_db)):
    link_guardian(db, patient.id, data.guardian_user_id)
    db.commit()
    return {'patient_id': patient.id, 'guardian_user_id': data.guardian_user_id}


@router.put('/{patient_id}/clinical-review', response_model=PatientClinical)
def clinical_review(data: ClinicalReviewInput, patient: Patient = Depends(require_patient_access('CLINICIAN')),
                    user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Revisão manual de campos fictícios pelo médico. Nunca alterada por jogo, humor ou IA."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, field, (value.strip() or None) if isinstance(value, str) else value)
    db.commit()
    return detail_for(db, user, patient)


@router.get('/{patient_id}/dashboard', response_model=Dashboard)
def dashboard(patient: Patient = Depends(require_patient_access('CLINICIAN', 'GUARDIAN')),
              user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    moods = db.scalars(select(MoodEntry).where(MoodEntry.patient_id == patient.id, MoodEntry.recorded_at >= since)
                       .order_by(MoodEntry.recorded_at))
    routines = list(db.scalars(select(RoutineEntry).where(RoutineEntry.patient_id == patient.id,
                                                          RoutineEntry.recorded_at >= since)
                               .order_by(RoutineEntry.recorded_at.desc())))
    games = db.scalar(select(func.count()).select_from(GameSession).where(GameSession.patient_id == patient.id)) or 0
    schedules = db.scalars(select(MedicationSchedule).where(MedicationSchedule.patient_id == patient.id,
                                                            MedicationSchedule.active.is_(True)))
    upcoming = sorted((UpcomingMedication(schedule_id=s.id, label=s.label, time=t) for s in schedules for t in s.times_json),
                      key=lambda item: item.time)
    return Dashboard(patient=detail_for(db, user, patient),
                     mood_last_7_days=[MoodOut.model_validate(m) for m in moods],
                     water_entries=[RoutineOut.model_validate(r) for r in routines if r.kind == 'water'],
                     meal_entries=[RoutineOut.model_validate(r) for r in routines if r.kind == 'meal'],
                     general_notes=[RoutineOut.model_validate(r) for r in routines if r.kind == 'note'],
                     game_sessions_count=games, upcoming_medications=upcoming)
