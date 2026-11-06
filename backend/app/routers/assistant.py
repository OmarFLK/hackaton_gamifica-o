import re
import unicodedata
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field
from app.integration import User, current_user

router = APIRouter(prefix='/api/assistant', tags=['FAQ demonstrativa'])
SOURCE = 'FAQ SuperPed — demonstração'


def normalize(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn')


FAQ = [
    (('horario', 'agenda', 'agendamento'), 'Abra Medicamentos para consultar os horários fictícios definidos pela equipe. O responsável registra apenas seu relato.'),
    (('alerta', 'lembrete', 'notificacao'), 'O lembrete funciona com a página aberta. Receber um alerta não confirma administração; o relato precisa ser registrado separadamente.'),
    (('agua', 'refeicao'), 'O registro de água ou refeição pertence à área de rotina familiar, módulo 07. São relatos, não indicadores de evolução clínica.'),
    (('jogo', 'brincar', 'pausar'), 'As brincadeiras são voluntárias e possuem opção por toque. Você pode pausar e chamar um adulto. Jogos pertencem ao módulo 09.'),
    (('privacidade', 'dados', 'seguranca'), 'Esta demonstração usa somente dados fictícios. O acesso depende do perfil e do vínculo verificado no servidor.'),
    (('acesso', 'login', 'senha'), 'Entre com uma conta fictícia de demonstração. A criança acessa com acompanhamento do responsável; não possui senha própria.'),
    (('mensagem', 'chat', 'equipe'), 'Abra Mensagens para conversar com a equipe vinculada. O chat não é canal de emergência e não garante tempo de resposta.'),
    (('administrado', 'confirmacao', 'registro'), 'Na agenda, escolha uma ocorrência e registre administrado, não administrado ou adiado. O histórico mostra um relato com autor e horário.'),
]


class Question(BaseModel):
    model_config = ConfigDict(extra='forbid')
    question: str = Field(min_length=1, max_length=1000)


class Answer(BaseModel):
    answer: str
    source: str = SOURCE
    escalate: bool
    is_demo: bool = True


def answer_question(question: str):
    text = normalize(question)
    clinical = r'\b(dose\w*|dosagem|mg|ml|remedio\w*|sintoma\w*|febre|dor|dores|sangr\w*|vomit\w*|enjoo|falta de ar|respirar|desmai\w*|convuls\w*|emergencia|urgencia|prognostico|cura|sobrevida|cancer|quimio\w*|tratamento|seguro|posso tomar|devo tomar|dobrar|aumentar|diminuir|interromper|suspender)\b'
    if re.search(clinical, text):
        return Answer(answer='Não posso avaliar sintomas, doses ou tratamento individual. Fale com a equipe de saúde responsável. Em situação de urgência, procure o serviço de emergência local; não aguarde resposta deste chat.', escalate=True)
    for keywords, answer in FAQ:
        if any(word in text for word in keywords):
            return Answer(answer=answer, escalate=False)
    return Answer(answer='Posso explicar acesso, agenda, lembretes, registros, jogos, mensagens e privacidade. Para dúvidas pessoais de saúde, procure a equipe responsável.', escalate=True)


@router.post('/ask', response_model=Answer)
def ask(data: Question, user: User = Depends(current_user)):
    return answer_question(data.question)
