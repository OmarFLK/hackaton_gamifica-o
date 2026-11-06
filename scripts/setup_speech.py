"""Baixa apenas o modelo público de transcrição, para uso local sem API paga."""
import os
from pathlib import Path
from huggingface_hub import snapshot_download

os.environ['HF_HUB_DISABLE_PROGRESS_BARS'] = '1'
ROOT = Path(__file__).resolve().parents[1]
target = ROOT / '.runtime' / 'models' / 'whisper-base'
target.mkdir(parents=True, exist_ok=True)
snapshot_download(repo_id='Systran/faster-whisper-base', local_dir=str(target), token=False,
                  allow_patterns=['config.json', 'model.bin', 'tokenizer.json', 'vocabulary.*', 'preprocessor_config.json'])
print('Modelo de transcrição local preparado. Nenhum áudio foi enviado.')
