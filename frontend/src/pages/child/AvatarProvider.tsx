import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AvatarId } from '../../lib/types'
import { mascotById, type Mascot } from './mascots'

/**
 * Mascote escolhido. O contrato não possui endpoint de atualização de avatar, então a escolha
 * fica APENAS neste dispositivo (localStorage) — a interface rotula isso para a família.
 * Valor inicial: `chosen_avatar` do paciente, definido no cadastro.
 */
interface AvatarState { mascot: Mascot; scarf: boolean; choose: (id: AvatarId) => void; setScarf: (value: boolean) => void; storedLocally: boolean }
const AvatarContext = createContext<AvatarState | null>(null)
const key = (patientId: number) => `superped.avatar.${patientId}`

function readStored(patientId: number): { id: AvatarId; scarf: boolean } | null {
  try { const raw = localStorage.getItem(key(patientId)); return raw ? JSON.parse(raw) : null } catch { return null }
}

export function AvatarProvider({ patientId, initial, children }: { patientId: number; initial: string; children: React.ReactNode }) {
  const stored = readStored(patientId)
  const [id, setId] = useState<string>(stored?.id ?? initial)
  const [scarf, setScarfState] = useState(stored?.scarf ?? false)
  const [storedLocally, setStoredLocally] = useState(!!stored)
  const persist = useCallback((next: { id: string; scarf: boolean }) => {
    try { localStorage.setItem(key(patientId), JSON.stringify(next)); setStoredLocally(true) } catch { /* armazenamento indisponível: vale só nesta visita */ }
  }, [patientId])
  const choose = useCallback((next: AvatarId) => { setId(next); persist({ id: next, scarf }) }, [persist, scarf])
  const setScarf = useCallback((value: boolean) => { setScarfState(value); persist({ id, scarf: value }) }, [persist, id])
  const value = useMemo(() => ({ mascot: mascotById(id), scarf, choose, setScarf, storedLocally }), [id, scarf, choose, setScarf, storedLocally])
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
