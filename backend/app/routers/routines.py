"""Água e refeições RELATADAS pela família. Não são indicadores de evolução clínica."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_patient_access
from app.models.entities import Patient, RoutineEntry, User
from app.models.schemas import RoutineInput, RoutineOut

router = APIRouter(prefix='/api/patients/{patient_id}/routines', tags=['Rotina relatada'])


@router.get('', response_model=list[RoutineOut])
def list_routines(patient: Patient = Depends(require_patient_access('CLINICIAN', 'GUARDIAN')), db: Session = Depends(get_db)):
    return list(db.scalars(select(RoutineEntry).where(RoutineEntry.patient_id == patient.id)
                           .order_by(RoutineEntry.recorded_at.desc(), RoutineEntry.id.desc()).limit(200)))


@router.post('', response_model=RoutineOut, status_code=201)
def create_routine(data: RoutineInput, patient: Patient = Depends(require_patient_access('GUARDIAN')),
                   user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.kind == 'water':
        if data.quantity is None:
            raise HTTPException(422, 'Informe a quantidade de água em ml')
        entry = RoutineEntry(patient_id=patient.id, kind='water', quantity=data.quantity, unit='ml')
    else:
        if not data.description:
            raise HTTPException(422, 'Descreva a refeição')
        entry = RoutineEntry(patient_id=patient.id, kind='meal', description=data.description)
    # Autor e fonte vêm da sessão, nunca do formulário.
    entry.source, entry.reporter_user_id = 'GUARDIAN', user.id
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
