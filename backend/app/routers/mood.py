"""Humor 1–7 = opinião da criança ou relato da família. NUNCA estadiamento ou previsão.

source=CHILD é registrado pela criança dentro da sessão do responsável vinculado.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_patient_access
from app.models.entities import MoodEntry, Patient, User
from app.models.schemas import MoodInput, MoodOut

router = APIRouter(prefix='/api/patients/{patient_id}/moods', tags=['Humor relatado'])


@router.get('', response_model=list[MoodOut])
def list_moods(patient: Patient = Depends(require_patient_access('CLINICIAN', 'GUARDIAN')), db: Session = Depends(get_db)):
    return list(db.scalars(select(MoodEntry).where(MoodEntry.patient_id == patient.id)
                           .order_by(MoodEntry.recorded_at.desc(), MoodEntry.id.desc()).limit(200)))


@router.post('', response_model=MoodOut, status_code=201)
def create_mood(data: MoodInput, patient: Patient = Depends(require_patient_access('GUARDIAN')),
                user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = MoodEntry(patient_id=patient.id, score=data.score, source=data.source,
                      note=(data.note or '').strip() or None, reporter_user_id=user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
