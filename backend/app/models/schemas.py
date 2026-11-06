"""Schemas de leitura/escrita. Nenhum expõe password_hash.

Campos clínicos fictícios aparecem apenas em `PatientClinical` (perfil CLINICIAN).
Entradas usam extra='forbid': autor, fonte de servidor e IDs não vêm do formulário.
"""
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Somente Pandi está disponível; novos companheiros estão em desenvolvimento.
Avatar = Literal['pandi']
Role = Literal['CLINICIAN', 'CLINICAL_ASSISTANT', 'GUARDIAN', 'DEVELOPER']


class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid')


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Auth ----------
class LoginInput(Strict):
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=1, max_length=200)


class UserOut(ORM):
    id: int
    name: str
    email: str
    role: Role


class TokenOut(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserOut


class GuardianOption(ORM):
    id: int
    name: str
    email: str


# ---------- Pacientes ----------
class PatientSummary(ORM):
    id: int
    name: str
    birth_date: str
    chosen_avatar: str
    clinician_id: int


class LinkedGuardian(ORM):
    id: int
    name: str


class PatientDetail(PatientSummary):
    clinician_name: str | None = None
    guardians: list[LinkedGuardian] = []


class PatientClinical(PatientDetail):
    clinical_notes: str | None = None
    cancer_type_demo: str | None = None
    clinical_stage_demo: str | None = None


class PatientCreate(Strict):
    name: str = Field(min_length=2, max_length=120)
    birth_date: date
    chosen_avatar: Avatar = 'pandi'
    clinician_id: int | None = None
    guardian_user_id: int | None = None
    clinical_notes: str | None = Field(default=None, max_length=2000)
    cancer_type_demo: str | None = Field(default=None, max_length=120)
    clinical_stage_demo: str | None = Field(default=None, max_length=60)

    @field_validator('name')
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError('Informe um nome fictício')
        return value

    @field_validator('birth_date')
    @classmethod
    def plausible_child(cls, value: date) -> date:
        today = date.today()
        if value > today or value.year < today.year - 21:
            raise ValueError('Data de nascimento fora do intervalo pediátrico da demo')
        return value


class GuardianLinkInput(Strict):
    guardian_user_id: int


class ClinicalReviewInput(Strict):
    clinical_notes: str | None = Field(default=None, max_length=2000)
    cancer_type_demo: str | None = Field(default=None, max_length=120)
    clinical_stage_demo: str | None = Field(default=None, max_length=60)


# ---------- Humor ----------
class MoodInput(Strict):
    score: int = Field(ge=1, le=7)
    source: Literal['CHILD', 'GUARDIAN']
    note: str | None = Field(default=None, max_length=500)


class MoodOut(ORM):
    id: int
    patient_id: int
    score: int
    source: str
    recorded_at: str
    note: str | None
    reporter_user_id: int | None


# ---------- Rotina ----------
class RoutineInput(Strict):
    kind: Literal['water', 'meal']
    quantity: int | None = Field(default=None, ge=0, le=5000)
    unit: Literal['ml'] | None = None
    description: str | None = Field(default=None, max_length=300)

    @field_validator('description')
    @classmethod
    def strip_description(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class RoutineOut(ORM):
    id: int
    patient_id: int
    kind: str
    quantity: int | None
    unit: str | None
    description: str | None
    recorded_at: str
    source: str
    reporter_user_id: int | None


# ---------- Jogos ----------
class GameInput(Strict):
    game: Literal['candle', 'bird', 'star']
    mode: Literal['touch', 'microphone', 'camera']
    duration_seconds: int = Field(ge=0, le=3600)


class GameOut(ORM):
    id: int
    patient_id: int
    game: str
    mode: str
    duration_seconds: int
    created_at: str


# ---------- Dashboard ----------
class UpcomingMedication(BaseModel):
    schedule_id: int
    label: str
    time: str


class Dashboard(BaseModel):
    patient: PatientDetail
    mood_last_7_days: list[MoodOut]
    water_entries: list[RoutineOut]
    meal_entries: list[RoutineOut]
    game_sessions_count: int
    upcoming_medications: list[UpcomingMedication]
    disclaimer: str = 'Indicadores de rotina relatados, não evolução clínica. DEMONSTRAÇÃO.'

