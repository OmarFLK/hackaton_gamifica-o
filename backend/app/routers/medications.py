from datetime import datetime, timezone
from typing import Literal
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.integration import MedicationEvent, MedicationSchedule, User, authorize_patient, current_user, get_db

router = APIRouter(prefix='/api/patients/{patient_id}', tags=['Medicamentos'])


class ScheduleInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    label: Literal['Medicamento A', 'Medicamento B']
    times_json: list[str] = Field(min_length=1, max_length=24)

    @field_validator('times_json')
    @classmethod
    def validate_times(cls, times):
        if any(not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d', time) for time in times):
            raise ValueError('Use horários HH:MM válidos')
        return sorted(set(times))


class ScheduleOut(ScheduleInput):
    model_config = ConfigDict(from_attributes=True)
    id: int
    patient_id: int
    active: bool
    clinician_id: int


class EventInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    schedule_id: int
    scheduled_for: datetime
    status: Literal['given', 'not_given', 'postponed']
    note: str | None = Field(default=None, max_length=1000)

    @field_validator('scheduled_for')
    @classmethod
    def require_timezone(cls, value):
        if value.tzinfo is None:
            raise ValueError('Inclua o fuso horário em scheduled_for')
        return value


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    schedule_id: int
    scheduled_for: datetime
    status: str
    reported_at: datetime
    reporter_user_id: int
    note: str | None


@router.get('/medications', response_model=list[ScheduleOut])
def schedules(patient_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id)
    return list(db.scalars(select(MedicationSchedule).where(MedicationSchedule.patient_id == patient_id).order_by(MedicationSchedule.id)))


@router.post('/medications', response_model=ScheduleOut, status_code=201)
def create_schedule(patient_id: int, data: ScheduleInput, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id, ('CLINICIAN',))
    schedule = MedicationSchedule(**data.model_dump(), patient_id=patient_id, clinician_id=user.id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.put('/medications/{schedule_id}', response_model=ScheduleOut)
def update_schedule(patient_id: int, schedule_id: int, data: ScheduleInput, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id, ('CLINICIAN',))
    schedule = db.get(MedicationSchedule, schedule_id)
    if not schedule or schedule.patient_id != patient_id:
        raise HTTPException(403, 'Agenda fora do vínculo')
    schedule.label, schedule.times_json = data.label, data.times_json
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get('/medication-events', response_model=list[EventOut])
def events(patient_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id)
    return list(db.scalars(select(MedicationEvent).join(MedicationSchedule).where(MedicationSchedule.patient_id == patient_id).order_by(MedicationEvent.id.desc())))


@router.post('/medication-events', response_model=EventOut, status_code=201)
def report_event(patient_id: int, data: EventInput, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id)
    schedule = db.get(MedicationSchedule, data.schedule_id)
    if not schedule or schedule.patient_id != patient_id or not schedule.active:
        raise HTTPException(403, 'Agenda fora do vínculo ou inativa')
    # O navegador envia a ocorrência local com offset. Nunca usar data sem fuso.
    if data.scheduled_for.strftime('%H:%M') not in schedule.times_json:
        raise HTTPException(422, 'Ocorrência não corresponde aos horários da agenda')
    event = MedicationEvent(schedule_id=data.schedule_id, scheduled_for=data.scheduled_for.astimezone(timezone.utc).isoformat(),
                            status=data.status, note=data.note, reporter_user_id=user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
