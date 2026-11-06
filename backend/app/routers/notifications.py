from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import authorize_patient, require_role
from app.models.entities import Notification, Patient, User, now_iso
from app.services.notifications import own_notifications, queue_notifications

router = APIRouter(prefix='/api', tags=['Notificações pessoais'])
allowed = require_role('CLINICIAN', 'GUARDIAN')


class NotificationOut(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    actor_name: str
    kind: str
    title: str
    body: str
    created_at: datetime
    read_at: datetime | None
    target_url: str


class NotificationList(BaseModel):
    items: list[NotificationOut]
    unread_count: int


class NoticeInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    title: str = Field(min_length=1, max_length=100)
    body: str = Field(min_length=1, max_length=1000)

    @field_validator('title', 'body')
    @classmethod
    def nonempty(cls, value):
        if not value.strip():
            raise ValueError('Preencha o aviso')
        return value.strip()


@router.get('/notifications', response_model=NotificationList)
def list_notifications(limit: int = Query(default=50, ge=1, le=100), user: User = Depends(allowed), db: Session = Depends(get_db)):
    query = own_notifications(user)
    unread = db.scalar(select(func.count()).select_from(query.where(Notification.read_at.is_(None)).subquery())) or 0
    rows = db.execute(query.add_columns(Patient.name, User.name).join(Patient, Patient.id == Notification.patient_id)
                      .join(User, User.id == Notification.actor_user_id).order_by(Notification.id.desc()).limit(limit))
    base = '/medico' if user.role == 'CLINICIAN' else '/familia'
    return NotificationList(items=[NotificationOut(id=n.id, patient_id=n.patient_id, patient_name=patient_name,
        actor_name=actor_name, kind=n.kind, title=n.title, body=n.body, created_at=n.created_at, read_at=n.read_at,
        target_url=f'{base}/mensagens?paciente={n.patient_id}') for n, patient_name, actor_name in rows], unread_count=unread)


@router.post('/notifications/read-all')
def read_all(user: User = Depends(allowed), db: Session = Depends(get_db)):
    items = db.scalars(own_notifications(user).where(Notification.read_at.is_(None)))
    count, timestamp = 0, now_iso()
    for item in items:
        item.read_at = timestamp; count += 1
    db.commit()
    return {'marked_read': count}


@router.post('/notifications/{notification_id}/read')
def read_notification(notification_id: int, user: User = Depends(allowed), db: Session = Depends(get_db)):
    item = db.scalar(own_notifications(user).where(Notification.id == notification_id))
    if not item:
        raise HTTPException(403, 'Notificação fora do seu acesso')
    item.read_at = item.read_at or now_iso()
    db.commit()
    return {'id': item.id, 'read_at': item.read_at}


@router.post('/patients/{patient_id}/notices', status_code=201)
def send_notice(patient_id: int, data: NoticeInput, user: User = Depends(allowed), db: Session = Depends(get_db)):
    patient = authorize_patient(db, user, patient_id)
    count = queue_notifications(db, patient, user, kind='notice', title=data.title, body=data.body)
    if not count:
        raise HTTPException(422, 'Nenhum destinatário ativo vinculado para receber o aviso')
    db.commit()
    return {'delivered_to': count}
