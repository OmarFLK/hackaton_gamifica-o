import type { AvatarId } from '../../lib/types'
import type { ChildTheme } from '../../components/layouts/ChildLayout'

/**
 * Companheiro disponível: Pandi. Todas as imagens são as ilustrações oficiais fornecidas
 * pela equipe (frontend/public/mascote/); nada do personagem é desenhado em código.
 * Outros personagens aparecem só como nome "em desenvolvimento" (exigem licença).
 */
export interface Mascot {
  id: AvatarId; name: string; world: string; description: string; speech: string
  theme: ChildTheme
}

export const PANDI: Mascot = {
  id: 'pandi', name: 'Pandi', world: 'Super-herói da coragem', description: 'Um panda corajoso que gosta de fazer companhia sem pressa.',
  speech: 'Vamos no seu tempo.',
  theme: { background: 'linear-gradient(160deg,#f1f4fa 0%,#dfe5f1 100%)', accent: '#203774', soft: '#f6f8fc', ink: '#101521' },
}

export const MASCOTS: Mascot[] = [PANDI]

/** Personagens planejados. Ao tocar, a interface mostra "Em desenvolvimento". */
export const COMING_SOON = [
  { id: 'homem-aranha', name: 'Homem-Aranha' },
  { id: 'mickey', name: 'Mickey' },
  { id: 'minnie', name: 'Minnie' },
] as const

/** Qualquer valor antigo (arco, niva, etc.) ou desconhecido cai no Pandi. */
export const mascotById = (id: string | null | undefined): Mascot => MASCOTS.find(m => m.id === id) ?? PANDI

export const MOODS = [
  { score: 7, label: 'Radiante', image: '/mascote/humor-7-radiante.png' },
  { score: 6, label: 'Muito feliz', image: '/mascote/humor-6-muito-feliz.png' },
  { score: 5, label: 'Feliz', image: '/mascote/humor-5-feliz.png' },
  { score: 4, label: 'Neutro', image: '/mascote/humor-4-neutro.png' },
  { score: 3, label: 'Não tão bem', image: '/mascote/humor-3-nao-tao-bem.png' },
  { score: 2, label: 'Muito mal', image: '/mascote/humor-2-muito-mal.png' },
  { score: 1, label: 'Muito triste', image: '/mascote/humor-1-muito-triste.png' },
] as const

export const PANDI_POSES = {
  principal: '/mascote/pandi-principal.png',
  comemorando: '/mascote/pandi-comemorando.png',
  frontal: '/mascote/pandi-frontal.png',
  pensativo: '/mascote/pandi-pensativo.png',
  calmo: '/mascote/humor-4-neutro.png',
  rosto: '/mascote/pandi-rosto.png',
} as const
export type PandiPose = keyof typeof PANDI_POSES

function MascotImage({ src, size, title, className = '' }: { src: string; size: number; title?: string; className?: string }) {
  return <img src={src} width={size} height={size} alt={title ?? ''} aria-hidden={title ? undefined : true}
    className={`mascot-img ${className}`} style={{ width: size, height: size }} loading="lazy" decoding="async" draggable={false}/>
}

/** Pandi na expressão do humor escolhido (7 radiante … 1 muito triste). */
export function MascotFace({ score = 6, size = 120, title }: { mascot?: Mascot; score?: number; size?: number; title?: string }) {
  const mood = MOODS.find(m => m.score === score) ?? MOODS[1]
  return <MascotImage src={mood.image} size={size} title={title}/>
}

/** Pandi em uma pose (personagem principal, comemorando, pensativo…). */
export function PandiPoseImage({ pose, size = 160, title, className }: { pose: PandiPose; size?: number; title?: string; className?: string }) {
  return <MascotImage src={PANDI_POSES[pose]} size={size} title={title} className={className}/>
}

/** Rosto do Pandi para miniaturas (listas, fichas, cadastro). */
export function PandiAvatar({ size = 56, title }: { size?: number; title?: string }) {
  return <MascotImage src={PANDI_POSES.rosto} size={size} title={title} className="mascot-avatar"/>
}
