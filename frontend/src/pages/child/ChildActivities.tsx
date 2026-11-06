import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BirdGame, CandleGame, StarGame } from '../../features/games'
import { MascotVoice } from '../../features/child-voice'
import { requestAdult } from '../../components/layouts/ChildLayout'
import { useAvatar } from './AvatarProvider'
import type { ChildProfile } from './ChildArea'

const GAMES = { candle: CandleGame, bird: BirdGame, star: StarGame }

/** Hospeda os jogos exportados pelo módulo 09. Jogo inexistente = aviso honesto, nunca botão inerte. */
export function ChildGamePage({ child, offline }: { child: ChildProfile; offline: boolean }) {
  const { game } = useParams()
  const navigate = useNavigate()
  const Game = GAMES[game as keyof typeof GAMES]
  if (!Game) return <div className="kid-empty"><p>Esta aventura está em preparação.</p><Link className="kid-big-button" to="../.." relative="path"><ArrowLeft size={22}/>Voltar</Link></div>
  return <Game key={game} patientId={child.id} offline={offline} onExit={() => navigate('../..', { relative: 'path' })}/>
}

/** Conversa por botões e voz sintética (módulo 12, já existente), com o nome do mascote escolhido. */
export function ChildTalkPage() {
  const { mascot } = useAvatar()
  return <>
    <Link className="kid-back" to=".."><ArrowLeft size={20}/>Voltar ao meu mundo</Link>
    <MascotVoice mascotName={mascot.name} onCallAdult={requestAdult}/>
  </>
}
