export const phrases = [
  { question: 'Pode brincar comigo?', answer: 'Podemos brincar no seu tempo. Você pode escolher uma aventura quando quiser e parar quando preferir.' },
  { question: 'Quero descansar', answer: 'Tudo bem fazer uma pausa. Eu espero por você. Se quiser companhia, chame um adulto de confiança.' },
  { question: 'Quero falar com adulto', answer: 'Vamos chamar um adulto de confiança para ficar com você. Use o botão Chamar adulto.' },
] as const
export const welcome = 'Oi! Estou aqui para fazer companhia. Podemos conversar por estes botões, ouvir uma mensagem ou fazer uma pausa.'
export function safeVoiceAnswer(text: string): string {
  const normalized = text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/adulto|ajuda|mae|pai/.test(normalized)) return phrases[2].answer
  if (/descans|pausa|parar/.test(normalized)) return phrases[1].answer
  if (/brinc|jog/.test(normalized)) return phrases[0].answer
  return 'Posso conversar sobre brincar, descansar ou chamar um adulto. Escolha um dos botões. Para falar sobre como está se sentindo, chame um adulto de confiança.'
}
