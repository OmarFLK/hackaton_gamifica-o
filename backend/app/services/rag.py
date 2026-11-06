"""RAG lexical local BM25. Filtra a base por perfil antes de recuperar trechos.
Não consulta prontuários nem mensagens; sem embeddings ou serviços externos.
"""
from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
from math import log
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1] / 'knowledge'
AUDIENCES = ('guardian', 'clinician', 'child')
STOP = set('a o as os um uma de da do das dos e em no na nos nas para por com que como eu meu minha me voce se pode posso quero qual isso esta este tem sobre'.split())


@dataclass(frozen=True)
class Document:
    id: str
    audience: str
    title: str
    text: str


def tokens(text):
    normalized = ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn')
    return [word for word in re.findall(r'[a-z0-9]+', normalized) if word not in STOP and len(word) > 2]


@lru_cache(maxsize=3)
def corpus(audience):
    if audience not in AUDIENCES:
        raise ValueError('Audiência inválida')
    content = (ROOT / f'{audience}.md').read_text(encoding='utf-8')
    docs = []
    for index, section in enumerate(content.split('\n## ')[1:], 1):
        title, _, body = section.partition('\n')
        docs.append(Document(f'{audience}-{index}', audience, title.strip(), body.strip()[:1600]))
    return tuple(docs)


def retrieve(question, audience, limit=3):
    docs = corpus(audience)
    query = set(tokens(question))
    counters = [Counter(tokens(doc.title + ' ' + doc.text)) for doc in docs]
    average = sum(sum(c.values()) for c in counters) / max(len(docs), 1)
    scores = []
    for doc, counter in zip(docs, counters):
        length, score = sum(counter.values()), 0.0
        for term in query:
            frequency = counter[term]
            if frequency:
                count = sum(term in other for other in counters)
                idf = log(1 + (len(docs) - count + .5) / (count + .5))
                score += idf * frequency * 2.2 / (frequency + 1.2 * (.25 + .75 * length / max(average, 1)))
        scores.append((score, doc))
    ranked = [doc for score, doc in sorted(scores, key=lambda item: item[0], reverse=True) if score > 0]
    return ranked[:limit] or list(docs[:1])
