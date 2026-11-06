import { Volume2 } from 'lucide-react'
import { MascotFace, MOODS, type Mascot } from './mascots'
import { speakText } from './AvatarProvider'

/** Sete estados com o rosto do mascote. Rádio nativo: teclado (setas) e toque funcionam. */
export function MoodPicker({ mascot, value, onChange, large, withAudio }: { mascot: Mascot; value: number | null; onChange: (score: number) => void; large?: boolean; withAudio?: boolean }) {
  return <fieldset className={`mood-picker ${large ? 'large' : ''}`}>
    <legend className="sr-only">Escolha como está se sentindo</legend>
    {MOODS.map(mood => <label key={mood.score} className={`mood-option ${value === mood.score ? 'selected' : ''}`}>
      <input type="radio" name="mood" className="sr-only" value={mood.score} checked={value === mood.score} onChange={() => { onChange(mood.score); if (withAudio) speakText(mood.label) }}/>
      <MascotFace mascot={mascot} score={mood.score} size={large ? 96 : 72}/>
      <span>{mood.label}</span>
    </label>)}
    {withAudio && <button type="button" className="kid-audio" onClick={() => speakText(`Como você está hoje? ${MOODS.map(m => m.label).join(', ')}.`)}><Volume2 size={20}/>Ouvir as opções</button>}
  </fieldset>
}
