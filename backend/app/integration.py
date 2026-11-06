"""Único adaptador a trocar pelos modelos/dependências da fundação 02/04/05.

Routers 10–13 não dependem de portais nem criam sessões/autores fornecidos pelo cliente.
"""
from .demo_support import (MedicationEvent, MedicationSchedule, Message, User,
                           authorize_patient, current_user, get_db)

__all__ = ['MedicationEvent', 'MedicationSchedule', 'Message', 'User',
           'authorize_patient', 'current_user', 'get_db']
