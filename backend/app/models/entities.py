"""Entidades do CONTRATO_MVP_4H. Datas guardadas como ISO 8601 com fuso (UTC).

Extensões documentadas em docs/INTEGRATION_NOTES.md:
- `ClinicianDelegate`: delegação explícita médico -> assistente (matriz de permissões).
- `reporter_user_id` em MoodEntry/RoutineEntry/GameSession: autor vindo do token.
Os tipos de MedicationEvent/Message são os mesmos usados pelos routers 10–11.
"""
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(32))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class ClinicianDelegate(Base):
    __tablename__ = 'clinician_delegates'
    __table_args__ = (UniqueConstraint('clinician_id', 'assistant_user_id'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    clinician_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    assistant_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)


class Patient(Base):
    __tablename__ = 'patients'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    birth_date: Mapped[str] = mapped_column(String(10))
    clinical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancer_type_demo: Mapped[str | None] = mapped_column(String(120), nullable=True)
    clinical_stage_demo: Mapped[str | None] = mapped_column(String(60), nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    chosen_avatar: Mapped[str] = mapped_column(String(30), default='pandi')
    clinician_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)


class PatientGuardian(Base):
    __tablename__ = 'patient_guardians'
    __table_args__ = (UniqueConstraint('patient_id', 'guardian_user_id'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    guardian_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)


class MoodEntry(Base):
    __tablename__ = 'mood_entries'
    __table_args__ = (Index('ix_mood_patient_recorded', 'patient_id', 'recorded_at'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    score: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(16))
    recorded_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reporter_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)


class RoutineEntry(Base):
    __tablename__ = 'routine_entries'
    __table_args__ = (Index('ix_routine_patient_recorded', 'patient_id', 'recorded_at'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    kind: Mapped[str] = mapped_column(String(10))
    quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(10), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    source: Mapped[str] = mapped_column(String(16), default='GUARDIAN')
    reporter_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)


class MedicationSchedule(Base):
    __tablename__ = 'medication_schedules'
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    label: Mapped[str] = mapped_column(String(80))
    times_json: Mapped[list] = mapped_column(JSON)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    clinician_id: Mapped[int] = mapped_column(ForeignKey('users.id'))


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


class Notification(Base):
    __tablename__ = 'notifications'
    __table_args__ = (Index('ix_notification_recipient_unread', 'user_id', 'read_at'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    actor_user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    message_id: Mapped[int | None] = mapped_column(ForeignKey('messages.id'), nullable=True, index=True)
    kind: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(100))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    read_at: Mapped[str | None] = mapped_column(String(40), nullable=True)


class GameSession(Base):
    __tablename__ = 'game_sessions'
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('patients.id'), index=True)
    game: Mapped[str] = mapped_column(String(10))
    mode: Mapped[str] = mapped_column(String(12))
    duration_seconds: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso, index=True)
    reporter_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
