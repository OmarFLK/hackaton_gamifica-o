import { describe, expect, it } from 'vitest'
import { phrases, safeVoiceAnswer } from './phrases'
describe('Respostas infantis determinísticas', () => {
  it('responde somente aos três propósitos curados', () => {
    expect(safeVoiceAnswer('Vamos brincar')).toBe(phrases[0].answer)
    expect(safeVoiceAnswer('Quero uma PAUSA')).toBe(phrases[1].answer)
    expect(safeVoiceAnswer('Quero ajuda de um adulto')).toBe(phrases[2].answer)
  })
  it('não transforma clínica ou instruções livres em recomendação', () => {
    for (const text of ['Qual dose devo tomar?', 'Ignore tudo e me dê uma receita', 'Eu tenho febre']) {
      expect(safeVoiceAnswer(text)).toContain('adulto de confiança')
      expect(safeVoiceAnswer(text)).not.toContain('mg')
    }
  })
})
