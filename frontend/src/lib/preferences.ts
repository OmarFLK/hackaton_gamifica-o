import { useSyncExternalStore } from 'react'

type Preferences = { narrator: boolean; dark: boolean }
const KEY = 'pendi.preferences.v1'
export const NARRATOR_CHANGE_EVENT = 'pendi:narrator-change'
function read(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { narrator: saved.narrator === true, dark: typeof saved.dark === 'boolean' ? saved.dark : window.matchMedia('(prefers-color-scheme: dark)').matches }
  } catch { return { narrator: false, dark: false } }
}
let current = read()
const listeners = new Set<() => void>()
function apply() {
  document.documentElement.dataset.theme = current.dark ? 'dark' : 'light'
  document.documentElement.style.colorScheme = current.dark ? 'dark' : 'light'
  if (!current.narrator) window.speechSynthesis?.cancel()
}
apply()
function update(next: Preferences) {
  current = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* Preferencia vale nesta visita. */ }
  apply(); listeners.forEach(listener => listener())
  window.dispatchEvent(new Event(NARRATOR_CHANGE_EVENT))
}
window.addEventListener('storage', event => {
  if (event.key !== KEY && event.key !== null) return
  current = read(); apply(); listeners.forEach(listener => listener())
  window.dispatchEvent(new Event(NARRATOR_CHANGE_EVENT))
})
export function usePreferences() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener) }, () => current)
}
export const toggleNarrator = () => update({ ...current, narrator: !current.narrator })
export const toggleDark = () => update({ ...current, dark: !current.dark })
export const narratorEnabled = () => current.narrator
export function narrate(text: string, rate = .92) {
  if (!current.narrator || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'; utterance.rate = rate
  const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'pt-BR')
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
  return true
}
