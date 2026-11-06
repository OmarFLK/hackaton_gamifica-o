from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.integration import Message, User, authorize_patient, current_user, get_db
from app.models.entities import Notification, now_iso
from app.services.notifications import queue_notifications

router = APIRouter(prefix='/api/patients/{patient_id}/messages', tags=['Mensagens'])


class MessageInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    body: str = Field(min_length=1, max_length=2000)

    @field_validator('body')
    @classmethod
    def strip_body(cls, body):
        if not body.strip():
            raise ValueError('Escreva uma mensagem')
        return body.strip()


class MessageOut(MessageInput):
    model_config = ConfigDict(from_attributes=True)
    id: int
    patient_id: int
    sender_user_id: int
    created_at: datetime
    sender_name: str = ''
    sender_role: str = ''


def serialize(message, sender):
    return {**MessageOut.model_validate(message).model_dump(), 'sender_name': sender.name, 'sender_role': sender.role}


@router.get('', response_model=list[MessageOut])
def list_messages(patient_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id)
    rows = db.execute(select(Message, User).join(User, User.id == Message.sender_user_id)
                      .where(Message.patient_id == patient_id).order_by(Message.id))
    return [serialize(message, sender) for message, sender in rows]


@router.post('', response_model=MessageOut, status_code=201)
def send_message(patient_id: int, data: MessageInput, user: User = Depends(current_user), db: Session = Depends(get_db)):
    patient = authorize_patient(db, user, patient_id)
    message = Message(patient_id=patient_id, sender_user_id=user.id, body=data.body)
    db.add(message)
    db.flush()
    queue_notifications(db, patient, user, kind='message', title='Nova mensagem no Pendi',
                        body='Uma nova mensagem aguarda na conversa com a família e a equipe.', message_id=message.id)
    db.commit()
    db.refresh(message)
    return serialize(message, user)


class ReadInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    through_message_id: int = Field(ge=1)


@router.post('/read')
def read_messages(patient_id: int, data: ReadInput, user: User = Depends(current_user), db: Session = Depends(get_db)):
    authorize_patient(db, user, patient_id)
    message = db.get(Message, data.through_message_id)
    if not message or message.patient_id != patient_id:
        raise HTTPException(403, 'Mensagem fora da conversa')
    items = db.scalars(select(Notification).where(Notification.user_id == user.id, Notification.patient_id == patient_id,
        Notification.kind == 'message', Notification.message_id <= message.id, Notification.read_at.is_(None)))
    count, timestamp = 0, now_iso()
    for item in items:
        item.read_at = timestamp; count += 1
    db.commit()
    return {'marked_read': count}
