import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, X } from 'lucide-react'
import type { MedicationEvent, MedicationSchedule } from '../../lib/types'
import { DEMO_ENABLED } from '../../lib/api'
import { localDay, occurrencesForDay } from './calendar'

export function MedicationReminder({ schedules, events }: { schedules: MedicationSchedule[]; events: MedicationEvent[] }) {
  const [alert, setAlert] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [permissionMessage, setPermissionMessage] = useState('')
  const shown = useRef(new Set<string>())
  const simulation = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notify = (demo = false) => {
    const text = `${demo ? 'Simulação · ' : ''}Lembrete de medicamento programado`
    setAlert(text)
    if ('Notification' in window && Notification.permission === 'granted' && window.isSecureContext) new Notification('SuperPed', { body: 'Lembrete de medicamento programado. Abra a agenda.', icon: '/icons/superped.svg', tag: 'superped-reminder' })
  }
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== 'visible') return
      const now = new Date()
      const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
      for (const day of [localDay(now), localDay(tomorrow)]) {
        for (const o of occurrencesForDay(schedules, events, day)) {
          if (o.event) continue
          const delta = o.date.getTime() - now.getTime()
          const phase = delta > 0 && delta <= 300000 ? 'before' : delta <= 0 && delta > -60000 ? 'due' : ''
          const key = `${o.key}:${phase}`
          if (phase && !shown.current.has(key)) { shown.current.add(key); notify() }
        }
      }
    }
    check()
    const timer = setInterval(check, 1000)
    return () => clearInterval(timer)
  }, [schedules, events])
  useEffect(() => () => { if (simulation.current) clearTimeout(simulation.current) }, [])
  const simulate = () => {
    setSimulating(true)
    simulation.current = setTimeout(() => { notify(true); setSimulating(false) }, 10000)
  }
  const requestNotifications = async () => {
    if (!('Notification' in window) || !window.isSecureContext) { setPermissionMessage('Notificações indisponíveis. O aviso na tela continua disponível.'); return }
    try { const result = await Notification.requestPermission(); setPermissionMessage(result === 'granted' ? 'Notificações genéricas ativadas.' : 'Permissão não concedida. Use os avisos na tela.') }
    catch { setPermissionMessage('Não foi possível ativar notificações. Use os avisos na tela.') }
  }
  return <>
    <div className="reminder-options"><Bell size={18}/><p>Avisos 5 minutos antes e no horário, com a página aberta.</p>{DEMO_ENABLED && <button className="button ghost small" disabled={simulating} onClick={simulate}>{simulating ? 'Simulando · aguarde 10s…' : 'Simular lembrete em 10 segundos'}</button>}<button className="text-button" onClick={requestNotifications}>Ativar notificação</button></div>
    {permissionMessage && <p role="status" className="muted small-text">{permissionMessage}</p>}
    {alert && <div className="reminder-toast" role="alert"><BellRing/><div><strong>{alert}</strong><a href="#agenda">Ver agenda</a></div><button className="icon-button" aria-label="Fechar lembrete" onClick={() => setAlert('')}><X/></button></div>}
  </>
}
