import { createContext, useContext, useMemo } from 'react'
import { mascotById, type Mascot } from './mascots'

/**
 * Companheiro ativo da criança. Hoje só existe o Pandi; o provider continua existindo
 * para que novos personagens entrem sem mudar as telas (tema por variáveis CSS).
 */
interface AvatarState { mascot: Mascot }
const AvatarContext = createContext<AvatarState | null>(null)

export function AvatarProvider({ initial, children }: { patientId?: number; initial: string; children: React.ReactNode }) {
  const value = useMemo(() => ({ mascot: mascotById(initial) }), [initial])
  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
}

export function useAvatar() {
  const state = useContext(AvatarContext)
  if (!state) throw new Error('AvatarProvider ausente')
  return state
}

/** Apoio sonoro opcional com voz sintética genérica do navegador (sem clonagem). */
export function speakText(text: string) {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'; utterance.rate = 0.92
  const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'pt-BR')
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
  return true
}
