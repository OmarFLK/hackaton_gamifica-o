import { useNavigate } from 'react-router-dom'
import { Check, Volume2 } from 'lucide-react'
import { MASCOTS, MascotFace } from './mascots'
import { speakText, useAvatar } from './AvatarProvider'
import type { ChildProfile } from './ChildArea'

export function AvatarPickerPage({ child }: { child: ChildProfile }) {
  const { mascot, choose, scarf, setScarf, storedLocally } = useAvatar()
  const navigate = useNavigate()
  return <div className="kid-picker">
    <h1 className="kid-page-title">Quem vai brincar com você, {child.firstName}?</h1>
    <div className="kid-mascot-grid" role="radiogroup" aria-label="Companheiros">
      {MASCOTS.map(m => <button key={m.id} role="radio" aria-checked={mascot.id === m.id} className={`kid-mascot-card ${mascot.id === m.id ? 'selected' : ''}`}
        style={{ background: m.theme.background }} onClick={() => { choose(m.id); speakText(`${m.name}. ${m.description}`) }}>
        {mascot.id === m.id && <span className="kid-check"><Check size={18}/></span>}
        <MascotFace mascot={m} size={96} scarf={m.id === 'niva' && scarf}/>
        <strong>{m.name}</strong><span>{m.world}</span>
      </button>)}
    </div>
    <section className="kid-mascot-detail" aria-live="polite">
      <MascotFace mascot={mascot} size={80} scarf={scarf}/>
      <div><h2>{mascot.name}</h2><p>{mascot.description}</p>
        {mascot.id === 'niva' && <label className="kid-toggle"><input type="checkbox" checked={scarf} onChange={e => setScarf(e.target.checked)}/>Usar lenço</label>}
      </div>
      <button className="kid-audio" onClick={() => speakText(`${mascot.name}. ${mascot.description}`)}><Volume2 size={20}/>Ouvir</button>
    </section>
    <p className="kid-note">{storedLocally ? 'Preferência guardada neste dispositivo.' : 'A escolha fica guardada só neste dispositivo.'}</p>
    <button className="kid-big-button" onClick={() => navigate('..')}><Check size={24}/>Pronto!</button>
  </div>
}
