from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import authorize_patient, require_role
from app.models.entities import User
from app.services.ai_safety import limit_request, redact
from app.services.speech import available, transcribe_audio

router = APIRouter(prefix='/api/speech', tags=['Voz para texto — processamento local'])


def get_transcriber():
    return transcribe_audio


@router.get('/status')
def status(user: User = Depends(require_role('GUARDIAN'))):
    return {'available': available(), 'engine': 'local-whisper', 'max_seconds': 30}


@router.post('/transcribe')
async def transcribe(patient_id: int = Form(...), audio: UploadFile = File(...),
    user: User = Depends(require_role('GUARDIAN')), db: Session = Depends(get_db), transcriber=Depends(get_transcriber)):
    authorize_patient(db, user, patient_id, ('GUARDIAN',))
    limit_request(user.id, 'speech', limit=6)
    try:
        content = await audio.read(5 * 1024 * 1024 + 1)
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(413, 'A gravação é grande demais. Use uma frase curta.')
        if not content:
            raise HTTPException(422, 'Gravação vazia. Tente novamente.')
        text = await run_in_threadpool(transcriber, content)
    finally:
        await audio.close()
    return {'text': redact(text), 'language': 'pt', 'engine': 'local-whisper', 'review_required': True}
