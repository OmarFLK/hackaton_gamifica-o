import type { ReactNode } from 'react'
import { DEMO_LABEL } from '../../lib/demo'

type Tone = 'neutral' | 'given' | 'not_given' | 'postponed' | 'info'
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

/** Selo DEMONSTRAÇÃO, presente em todas as áreas autenticadas e na área infantil. */
export function DemoBadge({ suffix }: { suffix?: string }) {
  return <span className="demo-badge" title="Dados fictícios. Não validado para uso clínico.">{DEMO_LABEL}{suffix ? ` · ${suffix}` : ''}</span>
}
