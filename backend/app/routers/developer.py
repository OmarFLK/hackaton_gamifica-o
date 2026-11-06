from fastapi import APIRouter, Depends, HTTPException
from app.integration import User, current_user

router = APIRouter(prefix='/api/developer', tags=['Telemetria sintética'])


@router.get('/status')
def status(user: User = Depends(current_user)):
    if user.role != 'DEVELOPER':
        raise HTTPException(403, 'Acesso exclusivo do desenvolvedor')
    return {'api': 'ok', 'demo': True, 'modules': ['medications', 'messages', 'assistant', 'child-voice', 'developer'], 'version': '0.1.0'}
