from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.entities import Message, Notification, Patient, User
from app.routers.messages import MessageOut, serialize
from app.services.notifications import scoped_patient_ids

router = APIRouter(prefix='/api/conversations', tags=['Conversas médico-família'])


class ConversationOut(BaseModel):
    patient_id: int
    patient_name: str
    chosen_avatar: str
    last_message: MessageOut | None
    unread_count: int


@router.get('', response_model=list[ConversationOut])
def conversations(user: User = Depends(require_role('CLINICIAN', 'GUARDIAN')), db: Session = Depends(get_db)):
    patients = db.scalars(select(Patient).where(Patient.id.in_(scoped_patient_ids(user))).order_by(Patient.name))
    result = []
    for patient in patients:
        last = db.execute(select(Message, User).join(User, User.id == Message.sender_user_id)
            .where(Message.patient_id == patient.id).order_by(Message.id.desc()).limit(1)).first()
        unread = db.scalar(select(func.count()).select_from(Notification).where(Notification.patient_id == patient.id,
            Notification.user_id == user.id, Notification.kind == 'message', Notification.read_at.is_(None))) or 0
        result.append(ConversationOut(patient_id=patient.id, patient_name=patient.name, chosen_avatar=patient.chosen_avatar,
            last_message=serialize(*last) if last else None, unread_count=unread))
    return sorted(result, key=lambda item: item.last_message.id if item.last_message else 0, reverse=True)
