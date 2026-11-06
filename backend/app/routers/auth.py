from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, verify_password
from app.models.entities import User
from app.models.schemas import LoginInput, TokenOut, UserOut

router = APIRouter(prefix='/api/auth', tags=['Autenticação'])


@router.post('/login', response_model=TokenOut)
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.strip().lower()))
    if not verify_password(data.password, user.password_hash if user else None) or not user or not user.active:
        raise HTTPException(401, 'E-mail ou senha inválidos')
    return TokenOut(access_token=create_access_token(user.id, user.role), user=UserOut.model_validate(user))


@router.get('/me', response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
