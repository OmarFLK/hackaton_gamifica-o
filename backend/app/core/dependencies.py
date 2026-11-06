"""Dependências de autenticação e autorização. Toda checagem de vínculo acontece AQUI,
no servidor; esconder botões no React é apenas UX.

- 401: sem token, token inválido/expirado ou usuário inativo.
- 403: perfil sem permissão ou paciente fora do vínculo.
"""
from collections.abc import Iterable

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.entities import ClinicianDelegate, Patient, PatientGuardian, User

bearer = HTTPBearer(auto_error=False)
PATIENT_ROLES = ('CLINICIAN', 'CLINICAL_ASSISTANT', 'GUARDIAN')


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    try:
        if not credentials:
            raise ValueError('sem token')
        payload = decode_token(credentials.credentials)
        user = db.get(User, int(payload['sub']))
        if not user or not user.active:
            raise ValueError('usuário inativo')
        return user
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(401, 'Sessão inválida ou expirada', headers={'WWW-Authenticate': 'Bearer'})


# Nome usado pelos routers 10–13 (adaptador app.integration).
current_user = get_current_user


def require_role(*roles: str):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, 'Perfil sem permissão')
        return user
    return dependency


def delegated_clinician_ids(db: Session, assistant: User) -> list[int]:
    return list(db.scalars(select(ClinicianDelegate.clinician_id).where(ClinicianDelegate.assistant_user_id == assistant.id)))


def is_linked(db: Session, user: User, patient: Patient) -> bool:
    if user.role == 'CLINICIAN':
        return patient.clinician_id == user.id
    if user.role == 'GUARDIAN':
        return db.scalar(select(PatientGuardian.id).where(
            PatientGuardian.patient_id == patient.id, PatientGuardian.guardian_user_id == user.id)) is not None
    if user.role == 'CLINICAL_ASSISTANT':
        return patient.clinician_id in delegated_clinician_ids(db, user)
    return False


def authorize_patient(db: Session, user: User, patient_id: int, roles: Iterable[str] = ('CLINICIAN', 'GUARDIAN')) -> Patient:
    """Assinatura usada pelos routers 10–13. Paciente inexistente também retorna 403
    para não revelar quais IDs existem."""
    if user.role not in tuple(roles):
        raise HTTPException(403, 'Perfil sem permissão')
    patient = db.get(Patient, patient_id)
    if not patient or not is_linked(db, user, patient):
        raise HTTPException(403, 'Paciente fora do seu vínculo')
    return patient


def require_patient_access(*roles: str):
    """Dependência FastAPI: lê `patient_id` da rota e devolve o Patient autorizado."""
    allowed = roles or PATIENT_ROLES

    def dependency(patient_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Patient:
        return authorize_patient(db, user, patient_id, allowed)
    return dependency
