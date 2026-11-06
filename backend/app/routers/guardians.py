"""Cadastro de responsaveis exclusivamente por medico autenticado."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.security import hash_password
from app.models.entities import User
from app.models.schemas import GuardianCreate, GuardianOption

router = APIRouter(prefix='/api/guardians', tags=['Cadastro de responsaveis'])


@router.post('', status_code=201, response_model=GuardianOption)
def create_guardian(data: GuardianCreate, user: User = Depends(require_role('CLINICIAN')),
                    db: Session = Depends(get_db)):
    if db.scalar(select(User.id).where(User.email == data.email)):
        raise HTTPException(409, 'Este email ja esta cadastrado. Selecione o responsavel existente.')
    guardian = User(name=data.name, email=data.email, password_hash=hash_password(data.password), role='GUARDIAN')
    db.add(guardian)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'Este email ja esta cadastrado.')
    db.refresh(guardian)
    return guardian
