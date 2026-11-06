"""Transcrição CPU local, em memória. Não salva gravações e não chama o provedor LLM."""
from functools import lru_cache
from io import BytesIO
import os
from pathlib import Path
import threading

from fastapi import HTTPException

_speech_lock = threading.Lock()


def model_path():
    return Path(os.getenv('WHISPER_MODEL_PATH') or Path(__file__).resolve().parents[3] / '.runtime' / 'models' / 'whisper-base')


def available():
    return (model_path() / 'model.bin').is_file()


@lru_cache(maxsize=1)
def get_model():
    if not available():
        raise HTTPException(503, 'A transcrição local ainda não está preparada. Use digitação ou peça ao responsável para executar o setup de voz.')
    from faster_whisper import WhisperModel
    return WhisperModel(str(model_path()), device='cpu', compute_type='int8', cpu_threads=min(os.cpu_count() or 2, 4),
                        num_workers=1, local_files_only=True)


def transcribe_audio(content):
    import av
    import numpy as np
    chunks, samples = [], 0
    try:
        with av.open(BytesIO(content)) as container:
            resampler = av.AudioResampler(format='s16', layout='mono', rate=16000)
            for frame in container.decode(audio=0):
                for audio in resampler.resample(frame):
                    chunk = audio.to_ndarray().reshape(-1)
                    samples += len(chunk)
                    if samples > 45 * 16000:
                        raise HTTPException(413, 'Grave uma mensagem de até 30 segundos por vez.')
                    chunks.append(chunk)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422, 'Não foi possível ler a gravação. Tente gravar novamente ou digite sua mensagem.')
    if not chunks or samples < 1600:
        raise HTTPException(422, 'A gravação está muito curta. Fale uma frase e tente novamente.')
    audio = np.concatenate(chunks).astype(np.float32) / 32768.0
    if float(np.max(np.abs(audio))) < 0.002:
        raise HTTPException(422, 'Não ouvi uma fala na gravação. Aproxime o microfone e tente novamente.')
    if not _speech_lock.acquire(blocking=False):
        raise HTTPException(429, 'Outra gravação está sendo transcrita. Aguarde alguns instantes.')
    try:
        segments, _ = get_model().transcribe(audio, language='pt', beam_size=3, vad_filter=True,
            condition_on_previous_text=False, initial_prompt='Conversa em português com o assistente Pendi. Brincadeiras, sentimentos e companhia.')
        text = ' '.join(segment.text.strip() for segment in segments).strip()[:1500]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, 'A transcrição está indisponível agora. Você pode digitar e tentar gravar depois.')
    finally:
        _speech_lock.release()
    if not text:
        raise HTTPException(422, 'Não identifiquei palavras. Tente uma frase curta ou digite.')
    return text
