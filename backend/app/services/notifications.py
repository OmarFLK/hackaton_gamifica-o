from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Notification, Patient, PatientGuardian, User


def scoped_patient_ids(user: User):
    if user.role == 'CLINICIAN':
        return select(Patient.id).where(Patient.clinician_id == user.id).correlate(None)
    return select(PatientGuardian.patient_id).where(PatientGuardian.guardian_user_id == user.id).correlate(None)


def own_notifications(user: User):
    return select(Notification).where(Notification.user_id == user.id, Notification.patient_id.in_(scoped_patient_ids(user)))


def recipients(db: Session, patient: Patient, sender: User):
    if sender.role == 'GUARDIAN':
        clinician = db.get(User, patient.clinician_id)
        return [clinician] if clinician and clinician.active and clinician.role == 'CLINICIAN' else []
    return list(db.scalars(select(User).join(PatientGuardian, PatientGuardian.guardian_user_id == User.id).where(
        PatientGuardian.patient_id == patient.id, User.active.is_(True), User.role == 'GUARDIAN', User.id != sender.id)).unique())


def queue_notifications(db: Session, patient: Patient, sender: User, *, kind: str, title: str, body: str, message_id: int | None = None):
    targets = recipients(db, patient, sender)
    for target in targets:
        db.add(Notification(user_id=target.id, patient_id=patient.id, actor_user_id=sender.id,
                            message_id=message_id, kind=kind, title=title, body=body))
    return len(targets)
