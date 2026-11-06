import { Moon, Sun, X } from 'lucide-react'
import { toggleDark, toggleNarrator, usePreferences } from '../../lib/preferences'

export function PreferencesControls() {
  const { narrator, dark } = usePreferences()
  return <div className="preferences-controls" role="group" aria-label="Preferências do sistema">
    <button type="button" className="preference-button" aria-label={narrator ? 'Desligar narrador' : 'Ligar narrador'} aria-pressed={narrator} title={narrator ? 'Narrador ligado · clique para desligar' : 'Narrador desligado · clique para ligar'} onClick={toggleNarrator}>
      <span className="narrator-symbol" aria-hidden="true">🗣️{!narrator && <X className="narrator-off" size={20}/>}</span><span className="preference-label">Narrador {narrator ? 'ligado' : 'desligado'}</span>
    </button>
    <button type="button" className="preference-button" aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'} aria-pressed={dark} title={dark ? 'Modo claro' : 'Modo escuro'} onClick={toggleDark}>{dark ? <Sun size={20}/> : <Moon size={20}/>}<span className="preference-label">{dark ? 'Claro' : 'Escuro'}</span></button>
  </div>
}
