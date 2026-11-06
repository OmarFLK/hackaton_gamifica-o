"""Adaptador dos routers 10–13 para a fundação 02/04/05.

Antes apontava para a bancada temporária `demo_support`; agora usa os modelos
(app.models.entities) e dependências (app.core.dependencies) definitivos.
"""
from app.core.database import get_db
from app.core.dependencies import authorize_patient, current_user
from app.models.entities import MedicationEvent, MedicationSchedule, Message, User

__all__ = ['MedicationEvent', 'MedicationSchedule', 'Message', 'User',
           'authorize_patient', 'current_user', 'get_db']
