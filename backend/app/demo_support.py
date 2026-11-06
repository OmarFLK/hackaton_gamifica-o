"""Bancada DEMO substituível. Não implementa os portais/módulos 00–09.

Fornece apenas autenticação, pacientes de leitura e persistência necessárias
para executar os módulos 10–18 enquanto a fundação principal não está disponível.
"""
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import json

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict
from pwdlib import PasswordHash
from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

load_dotenv()
DEMO = os.getenv('DEMO_MODE', 'false').lower() == 'true'
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./superped_demo.db')
if DATABASE_URL.startswith('postgresql://'):
    DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+psycopg://', 1)
if os.getenv('RENDER') and DATABASE_URL.startswith('sqlite'):
    raise RuntimeError('Render requer PostgreSQL; SQLite é apenas contingência local.')
engine = create_engine(DATABASE_URL, **({'connect_args': {'check_same_thread': False}} if DATABASE_URL.startswith('sqlite') else {'pool_pre_ping': True}))
SessionLocal = sessionmaker(engine, expire_on_commit=False)
password_hash = PasswordHash.recommended()


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200), unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(32))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Patient(Base):
    __tablename__ = 'patients'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    birth_date: Mapped[str] = mapped_column(String(10))
    chosen_avatar: Mapped[str] = mapped_column(String(30), default='pandi')
    clinician_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)


class PatientGuardian(Base):
    __tablename__ = 'patient_guardians'
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    guardian_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)


class MedicationSchedule(Base):
    __tablename__ = 'medication_schedules'
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    label: Mapped[str] = mapped_column(String(80))
    times_json: Mapped[list] = mapped_column(JSON)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    clinician_id: Mapped[int] = mapped_column(ForeignKey('users.id'))


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class MedicationEvent(Base):
    __tablename__ = 'medication_events'
    id: Mapped[int] = mapped_column(primary_key=True)
    schedule_id: Mapped[int] = mapped_column(ForeignKey('medication_schedules.id'), index=True)
    scheduled_for: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(20))
    reported_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    reporter_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)


class Message(Base):
    __tablename__ = 'messages'
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    sender_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso, index=True)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: str


class PatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    birth_date: str
    chosen_avatar: str
    clinician_id: int


def get_db():
    with SessionLocal() as db:
        yield db


bearer = HTTPBearer(auto_error=False)


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)):
    try:
        if not credentials:
            raise ValueError()
        payload = jwt.decode(credentials.credentials, jwt_secret(), algorithms=['HS256'], options={'require': ['exp', 'sub']})
        user = db.get(User, int(payload['sub']))
        if not user or not user.active:
            raise ValueError()
        return user
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(401, 'Sessão inválida ou expirada')


def jwt_secret():
    secret = os.getenv('JWT_SECRET', '')
    if len(secret) < 32:
        raise RuntimeError('Defina JWT_SECRET com pelo menos 32 caracteres no ambiente.')
    return secret


def authorize_patient(db: Session, user: User, patient_id: int, roles=('CLINICIAN', 'GUARDIAN')):
    if user.role not in roles:
        raise HTTPException(403, 'Perfil sem permissão')
    patient = db.get(Patient, patient_id)
    linked = patient and ((user.role == 'CLINICIAN' and patient.clinician_id == user.id) or (
        user.role == 'GUARDIAN' and db.scalar(select(PatientGuardian.id).where(
            PatientGuardian.patient_id == patient_id, PatientGuardian.guardian_user_id == user.id))))
    if not linked:
        raise HTTPException(403, 'Paciente fora do seu vínculo')
    return patient


def initialize_demo():
    if not DEMO:
        raise RuntimeError('Bancada disponível somente com DEMO_MODE=true. Integre os módulos 02/04/05 para outro ambiente.')
    jwt_secret()
    Base.metadata.create_all(engine)
    fixture = Path(__file__).resolve().parent / 'demo_seed.json'
    data = json.loads(fixture.read_text(encoding='utf-8'))
    with SessionLocal() as db:
        for account in data['accounts']:
            if not db.scalar(select(User).where(User.email == account['email'])):
                db.add(User(name=account['name'], email=account['email'], role=account['role'], password_hash=password_hash.hash(account['password'])))
        db.flush()
        for item in data['patients']:
            if db.scalar(select(Patient).where(Patient.name == item['name'])):
                continue
            clinician = db.scalar(select(User).where(User.email == item['clinician_email']))
            guardian = db.scalar(select(User).where(User.email == item['guardian_email']))
            patient = Patient(name=item['name'], birth_date=item['birth_date'], chosen_avatar=item['chosen_avatar'], clinician_id=clinician.id)
            db.add(patient)
            db.flush()
            db.add(PatientGuardian(patient_id=patient.id, guardian_user_id=guardian.id))
        db.flush()
        for item in data['medications']:
            patient = db.scalar(select(Patient).where(Patient.name == item['patient']))
            if not db.scalar(select(MedicationSchedule).where(MedicationSchedule.patient_id == patient.id, MedicationSchedule.label == item['label'])):
                db.add(MedicationSchedule(patient_id=patient.id, label=item['label'], times_json=item['times_json'], clinician_id=patient.clinician_id))
        db.commit()


router = APIRouter(prefix='/api', tags=['Bancada de integração DEMO — substituir pela fundação'])


class Login(BaseModel):
    email: str
    password: str


@router.post('/auth/login')
def login(data: Login, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email))
    if not user or not user.active or not password_hash.verify(data.password, user.password_hash):
        raise HTTPException(401, 'E-mail ou senha inválidos')
    token = jwt.encode({'sub': str(user.id), 'exp': datetime.now(timezone.utc) + timedelta(hours=1)}, jwt_secret(), algorithm='HS256')
    return {'access_token': token, 'token_type': 'bearer', 'user': UserOut.model_validate(user)}


@router.get('/auth/me', response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.get('/patients', response_model=list[PatientOut])
def patients(user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.role == 'CLINICIAN':
        query = select(Patient).where(Patient.clinician_id == user.id)
    elif user.role == 'GUARDIAN':
        query = select(Patient).join(PatientGuardian).where(PatientGuardian.guardian_user_id == user.id)
    elif user.role == 'CLINICAL_ASSISTANT':
        return []  # Nenhuma delegação implícita nesta bancada.
    else:
        raise HTTPException(403, 'Perfil sem acesso a pacientes')
    return list(db.scalars(query))
