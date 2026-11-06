"""Sessões de brincadeira. Duração é registro de uso, não mensuração respiratória ou motora."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_patient_access
from app.models.entities import GameSession, Patient, User
from app.models.schemas import GameInput, GameOut

router = APIRouter(prefix='/api/patients/{patient_id}/games', tags=['Jogos'])


@router.get('', response_model=list[GameOut])
def list_games(patient: Patient = Depends(require_patient_access('CLINICIAN', 'GUARDIAN')), db: Session = Depends(get_db)):
    return list(db.scalars(select(GameSession).where(GameSession.patient_id == patient.id)
                           .order_by(GameSession.id.desc()).limit(100)))


@router.post('', response_model=GameOut, status_code=201)
def save_game(data: GameInput, patient: Patient = Depends(require_patient_access('GUARDIAN')),
              user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = GameSession(patient_id=patient.id, reporter_user_id=user.id, **data.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
