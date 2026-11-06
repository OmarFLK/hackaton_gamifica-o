import { Link } from 'react-router-dom'
import { Bird, Flame, MessageCircleHeart, Palette, Smile, Star, Volume2 } from 'lucide-react'
import { PandiPoseImage } from './mascots'
import { speakText, useAvatar } from './AvatarProvider'
import type { ChildProfile } from './ChildArea'

const ADVENTURES = [
  { to: 'jogos/candle', title: 'Vela tranquila', text: 'Sopre a chama devagar', icon: Flame },
  { to: 'jogos/bird', title: 'Voo nas nuvens', text: 'Voe com o Pandi', icon: Bird },
  { to: 'jogos/star', title: 'Estrela ao alcance', text: 'Colecione estrelas', icon: Star },
]

export function ChildHomePage({ child }: { child: ChildProfile }) {
  const { mascot } = useAvatar()
  const greeting = `Oi, ${child.firstName}! Eu sou ${mascot.name}. ${mascot.speech}`
  return <div className="kid-home">
    <section className="kid-hero">
      <PandiPoseImage pose="principal" size={190} title={`${mascot.name}, seu companheiro`} className="kid-hero-img"/>
      <div className="kid-bubble"><p>{greeting}</p><button className="kid-audio" onClick={() => speakText(greeting)}><Volume2 size={20}/>Ouvir</button></div>
    </section>
    <nav className="kid-main-actions" aria-label="O que você quer fazer?">
      <Link className="kid-tile feature" to="sentimentos"><Smile size={34}/><strong>Como estou hoje?</strong><span>Contar com rostinhos</span></Link>
      <Link className="kid-tile" to="conversar"><MessageCircleHeart size={34}/><strong>Conversar com o Pendi</strong><span>Escrever ou falar antes de enviar</span></Link>
      <Link className="kid-tile" to="mascote"><Palette size={34}/><strong>Trocar companheiro</strong><span>Pandi · novos amigos em breve</span></Link>
    </nav>
    <section aria-labelledby="adventures-title">
      <h2 id="adventures-title" className="kid-section-title">Minhas aventuras</h2>
      <div className="kid-adventures">{ADVENTURES.map(item => <Link key={item.to} className="kid-tile adventure" to={item.to}><item.icon size={36}/><strong>{item.title}</strong><span>{item.text}</span></Link>)}</div>
    </section>
  </div>
}
