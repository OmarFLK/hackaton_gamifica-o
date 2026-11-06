import type { ReactNode } from 'react'
import type { AvatarId } from '../../lib/types'
import type { ChildTheme } from '../../components/layouts/ChildLayout'

/**
 * Sete companheiros ORIGINAIS desenhados em SVG simples. Não remetem a personagens
 * protegidos. Cada um define só tokens infantis secundários; os institucionais ficam intactos.
 */
export interface Mascot {
  id: AvatarId; name: string; world: string; description: string; speech: string
  body: string; ink: string; theme: ChildTheme
}

export const MASCOTS: Mascot[] = [
  { id: 'arco', name: 'Arco', world: 'Céu e constelações', description: 'Conhece todas as estrelas e adora apontar desenhos no céu.', speech: 'Vamos olhar o céu juntos?', body: '#7E9BDB', ink: '#132653',
    theme: { background: 'linear-gradient(160deg,#e8eefc 0%,#d5e0f7 100%)', accent: '#2F55A4', soft: '#eef3fd', ink: '#132653' } },
  { id: 'guarda-lua', name: 'Guarda-Lua', world: 'Luz da noite', description: 'Carrega uma luzinha calma para as noites ficarem tranquilas.', speech: 'Minha luz fica acesa com você.', body: '#F2E2A0', ink: '#3d3410',
    theme: { background: 'linear-gradient(160deg,#fbf6e3 0%,#efe4bd 100%)', accent: '#7A5C00', soft: '#fdf9ec', ink: '#2c2508' } },
  { id: 'faisca', name: 'Faísca', world: 'Energia', description: 'Cheia de ideias, mas sabe que descansar também é importante.', speech: 'Bora ter uma ideia divertida?', body: '#F5A25D', ink: '#3b1c05',
    theme: { background: 'linear-gradient(160deg,#fff1e4 0%,#fbdcc0 100%)', accent: '#A8480B', soft: '#fff6ee', ink: '#341804' } },
  { id: 'pinta', name: 'Pinta', world: 'Jardim', description: 'Cuida das flores e conta as pintinhas do caminho.', speech: 'Hoje o jardim está bonito!', body: '#93C48B', ink: '#123015',
    theme: { background: 'linear-gradient(160deg,#ecf7e8 0%,#d3ebcc 100%)', accent: '#2F7A3B', soft: '#f3faf1', ink: '#10290f' } },
  { id: 'pipo', name: 'Pipo', world: 'Bichinho amigo', description: 'Orelhas grandes para escutar tudo o que você quiser contar.', speech: 'Estou ouvindo você.', body: '#C9946A', ink: '#2e1806',
    theme: { background: 'linear-gradient(160deg,#f8efe7 0%,#ead6c3 100%)', accent: '#86522A', soft: '#fbf5ef', ink: '#2a1606' } },
  { id: 'niva', name: 'Niva', world: 'Neve', description: 'Adora flocos de neve. Pode usar um lenço, se quiser.', speech: 'Que tal um momento fresquinho?', body: '#E6F0FA', ink: '#0f2a40',
    theme: { background: 'linear-gradient(160deg,#eef6fd 0%,#d6e8f7 100%)', accent: '#2C6690', soft: '#f4f9fe', ink: '#0d2537' } },
  { id: 'pandi', name: 'Pandi', world: 'Bambuzal tranquilo', description: 'Um panda calmo que gosta de fazer companhia sem pressa.', speech: 'Vamos no seu tempo.', body: '#FFFFFF', ink: '#101521',
    theme: { background: 'linear-gradient(160deg,#f1f4fa 0%,#dfe5f1 100%)', accent: '#203774', soft: '#f6f8fc', ink: '#101521' } },
]

export const mascotById = (id: string | null | undefined): Mascot => MASCOTS.find(m => m.id === id) ?? MASCOTS[6]

export const MOODS = [
  { score: 7, label: 'Radiante' }, { score: 6, label: 'Muito feliz' }, { score: 5, label: 'Feliz' },
  { score: 4, label: 'Neutro' }, { score: 3, label: 'Não tão bem' }, { score: 2, label: 'Muito mal' }, { score: 1, label: 'Muito triste' },
] as const

function Accessory({ mascot, scarf }: { mascot: Mascot; scarf: boolean }): ReactNode {
  switch (mascot.id) {
    case 'arco': return <g><path d="M22 40 Q60 -4 98 40" fill="none" stroke="#203774" strokeWidth="6" strokeLinecap="round"/><path d="M30 42 Q60 8 90 42" fill="none" stroke="#B9CBF2" strokeWidth="5" strokeLinecap="round"/>{[[34, 24], [60, 10], [86, 24]].map(([x, y]) => <path key={x} d={`M${x} ${y - 5} L${x + 1.6} ${y - 1.6} L${x + 5} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 5} L${x - 1.6} ${y + 1.6} L${x - 5} ${y} L${x - 1.6} ${y - 1.6} Z`} fill="#F5D776"/>)}</g>
    case 'guarda-lua': return <g><circle cx="60" cy="64" r="50" fill="#FFF6C9" opacity=".55"/><path d="M78 10 a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24 Z" fill="#E9C84A"/></g>
    case 'faisca': return <path d="M58 4 L44 34 L58 32 L50 52 L76 22 L61 24 L70 4 Z" fill="#FFD23F" stroke="#C77A12" strokeWidth="2" strokeLinejoin="round"/>
    case 'pinta': return <g>{[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cx="60" cy="16" rx="6" ry="9" fill="#F4A7B9" transform={`rotate(${angle} 60 26)`}/>)}<circle cx="60" cy="26" r="5" fill="#F7D35C"/></g>
    case 'pipo': return <g><ellipse cx="24" cy="62" rx="11" ry="22" fill="#7B4A26" transform="rotate(18 24 62)"/><ellipse cx="96" cy="62" rx="11" ry="22" fill="#7B4A26" transform="rotate(-18 96 62)"/></g>
    case 'niva': return <g><g stroke="#7DB3DE" strokeWidth="3" strokeLinecap="round">{[0, 60, 120].map(angle => <line key={angle} x1="60" y1="8" x2="60" y2="30" transform={`rotate(${angle} 60 19)`}/>)}</g>{scarf && <path d="M28 92 Q60 108 92 92 L92 100 Q60 116 28 100 Z M80 100 L88 118 L76 116 Z" fill="#941C2F"/>}</g>
    case 'pandi': return <g><circle cx="28" cy="32" r="12" fill="#101521"/><circle cx="92" cy="32" r="12" fill="#101521"/></g>
  }
}

function Eyes({ mascot, score }: { mascot: Mascot; score: number }) {
  const panda = mascot.id === 'pandi'
  const color = panda ? '#FFFFFF' : mascot.ink
  return <g>
    {panda && <><ellipse cx="45" cy="60" rx="10" ry="12" fill="#101521" transform="rotate(-20 45 60)"/><ellipse cx="75" cy="60" rx="10" ry="12" fill="#101521" transform="rotate(20 75 60)"/></>}
    {score >= 6
      ? <><path d="M39 61 Q45 53 51 61" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"/><path d="M69 61 Q75 53 81 61" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"/></>
      : <><circle cx="45" cy="60" r="4.5" fill={color}/><circle cx="75" cy="60" r="4.5" fill={color}/></>}
    {/* Sobrancelhas com a ponta interna levantada = tristeza/preocupação (nunca raiva). */}
    {score <= 3 && <><path d={score === 3 ? 'M38 51 L51 49' : 'M38 52 L51 46'} stroke={mascot.ink} strokeWidth="3" strokeLinecap="round"/><path d={score === 3 ? 'M82 51 L69 49' : 'M82 52 L69 46'} stroke={mascot.ink} strokeWidth="3" strokeLinecap="round"/></>}
  </g>
}

function Mouth({ mascot, score }: { mascot: Mascot; score: number }) {
  const stroke = { fill: 'none', stroke: mascot.ink, strokeWidth: 3.5, strokeLinecap: 'round' as const }
  switch (score) {
    case 7: return <g><path d="M44 76 Q60 100 76 76 Z" fill={mascot.ink}/><path d="M52 86 Q60 94 68 86 Q60 90 52 86" fill="#F08AA0"/></g>
    case 6: return <path d="M44 77 Q60 94 76 77" {...stroke}/>
    case 5: return <path d="M48 79 Q60 88 72 79" {...stroke}/>
    case 4: return <path d="M50 82 L70 82" {...stroke}/>
    case 3: return <path d="M49 85 Q60 79 71 85" {...stroke}/>
    default: return <path d="M46 87 Q60 74 74 87" {...stroke}/>
  }
}

/** Rosto do mascote com uma das 7 expressões (7 radiante … 1 muito triste). */
export function MascotFace({ mascot, score = 6, size = 120, scarf = false, title }: { mascot: Mascot; score?: number; size?: number; scarf?: boolean; title?: string }) {
  const panda = mascot.id === 'pandi'
  return <svg viewBox="0 0 120 120" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} className="mascot-svg">
    {(mascot.id === 'guarda-lua' || mascot.id === 'pipo' || mascot.id === 'pandi') && <Accessory mascot={mascot} scarf={scarf}/>}
    <circle cx="60" cy="64" r="40" fill={mascot.body} stroke={panda || mascot.id === 'niva' ? '#c9d2e3' : 'none'} strokeWidth="2"/>
    {mascot.id === 'pinta' && [[34, 76], [38, 70], [86, 76], [82, 70]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.4" fill="#5d8f55"/>)}
    {(mascot.id !== 'guarda-lua' && mascot.id !== 'pipo' && mascot.id !== 'pandi') && <Accessory mascot={mascot} scarf={scarf}/>}
    <Eyes mascot={mascot} score={score}/>
    {score >= 5 && <><circle cx="35" cy="74" r="5" fill="#F4A7B9" opacity=".7"/><circle cx="85" cy="74" r="5" fill="#F4A7B9" opacity=".7"/></>}
    {mascot.id === 'pipo' && <ellipse cx="60" cy="70" rx="5" ry="3.5" fill="#3a2010"/>}
    <Mouth mascot={mascot} score={score}/>
    {score === 1 && <path d="M41 68 Q37 76 41 79 Q45 76 41 68 Z" fill="#6FB3E8"/>}
  </svg>
}
