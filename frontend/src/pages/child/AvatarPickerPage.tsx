import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Hammer, Volume2 } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { COMING_SOON, PANDI, PandiAvatar, PandiPoseImage } from './mascots'
import { speakText } from './AvatarProvider'
import type { ChildProfile } from './ChildArea'

export function AvatarPickerPage({ child }: { child: ChildProfile }) {
  const navigate = useNavigate()
  const [pending, setPending] = useState<string | null>(null)
  const openSoon = (name: string) => { setPending(name); speakText(`${name} está em desenvolvimento.`) }
  return <div className="kid-picker">
    <h1 className="kid-page-title">Quem vai brincar com você, {child.firstName}?</h1>
    <div className="kid-mascot-grid">
      <button className="kid-mascot-card selected" style={{ background: PANDI.theme.background }} aria-pressed="true" onClick={() => speakText(`${PANDI.name}. ${PANDI.description}`)}>
        <span className="kid-check"><Check size={18}/></span>
        <PandiPoseImage pose="frontal" size={110}/>
        <strong>{PANDI.name}</strong><span>{PANDI.world}</span>
      </button>
      {COMING_SOON.map(character => <button key={character.id} className="kid-mascot-card soon" onClick={() => openSoon(character.name)} aria-label={`${character.name}: em desenvolvimento`}>
        <span className="soon-icon" aria-hidden="true"><Hammer size={34}/></span>
        <strong>{character.name}</strong><span className="soon-tag">Em desenvolvimento</span>
      </button>)}
    </div>
    <section className="kid-mascot-detail" aria-live="polite">
      <PandiAvatar size={80}/>
      <div><h2>{PANDI.name}</h2><p>{PANDI.description}</p></div>
      <button className="kid-audio" onClick={() => speakText(`${PANDI.name}. ${PANDI.description}`)}><Volume2 size={20}/>Ouvir</button>
    </section>
    <button className="kid-big-button" onClick={() => navigate('..')}><Check size={24}/>Pronto!</button>
    <Modal open={pending !== null} title="Em desenvolvimento" onClose={() => setPending(null)}>
      <p className="kid-modal-text">{pending} ainda está em desenvolvimento. Logo, logo vai poder brincar com você! Por enquanto, o Pandi faz companhia.</p>
      <div className="form-actions"><button className="button primary" onClick={() => setPending(null)}>Entendi</button></div>
    </Modal>
  </div>
}
