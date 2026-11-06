import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HandHeart, Heart, SkipForward } from 'lucide-react'
import { errorText, post } from '../../lib/api'
import { OFFLINE_SAVE_LABEL } from '../../lib/demo'
import type { MoodEntry } from '../../lib/types'
import { requestAdult } from '../../components/layouts/ChildLayout'
import { MOODS, PandiPoseImage } from './mascots'
import { MoodPicker } from './MoodPicker'
import { speakText, useAvatar } from './AvatarProvider'
import type { ChildProfile } from './ChildArea'

type Result = { kind: 'saved' } | { kind: 'local' } | { kind: 'error'; text: string }

/** Check-in de 7 rostinhos com o mascote escolhido. Sem certo/errado, sem contagem, sem punição. */
export function EmotionCheckinPage({ child, offline }: { child: ChildProfile; offline: boolean }) {
  const { mascot } = useAvatar()
  const navigate = useNavigate()
  const [score, setScore] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const send = async () => {
    if (!score) return
    if (offline) { setResult({ kind: 'local' }); return }
    setBusy(true)
    try { await post<MoodEntry>(`/api/patients/${child.id}/moods`, { score, source: 'CHILD' }); setResult({ kind: 'saved' }) }
    catch (err) { setResult({ kind: 'error', text: errorText(err) }) } finally { setBusy(false) }
  }

  if (result && result.kind !== 'error') {
    const label = MOODS.find(m => m.score === score)?.label ?? ''
    const thanks = `Obrigado por me contar, ${child.firstName}. Todo jeito de sentir vale.`
    return <div className="kid-thanks" role="status">
      {/* Resposta acolhedora: comemora humor bom; Pandi calmo e carinhoso nos demais. */}
      <PandiPoseImage pose={score && score >= 5 ? 'comemorando' : 'calmo'} size={170}/>
      <h1 className="kid-page-title">{thanks}</h1>
      <p>Você escolheu: <strong>{label}</strong>{score && score <= 3 ? '. Que tal chamar um adulto para ficar com você?' : ''}</p>
      <p className="kid-note">{result.kind === 'saved' ? 'Guardado para o seu adulto ver.' : OFFLINE_SAVE_LABEL}</p>
      <div className="kid-row">
        {score && score <= 3 && <button className="kid-big-button call" onClick={requestAdult}><HandHeart size={24}/>Chamar adulto</button>}
        <button className="kid-big-button" onClick={() => navigate('..')}><Heart size={24}/>Voltar ao meu mundo</button>
      </div>
    </div>
  }

  return <div className="kid-checkin">
    <h1 className="kid-page-title">Como você está hoje?</h1>
    <p className="kid-subtitle">Escolha o rostinho que parece com você agora. Qualquer resposta está tudo bem.</p>
    <MoodPicker mascot={mascot} value={score} onChange={setScore} large withAudio/>
    {result?.kind === 'error' && <p className="kid-error-text" role="alert">Não deu para guardar agora ({result.text}). Você pode tentar de novo ou chamar um adulto.</p>}
    <div className="kid-row">
      <button className="kid-big-button" onClick={send} disabled={!score || busy}><Heart size={24}/>{busy ? 'Guardando…' : 'Contar'}</button>
      <button className="kid-big-button ghost" onClick={() => { speakText('Tudo bem, podemos fazer isso outra hora.'); navigate('..') }}><SkipForward size={24}/>Pular</button>
      <button className="kid-big-button call" onClick={requestAdult}><HandHeart size={24}/>Quero chamar um adulto</button>
    </div>
  </div>
}
