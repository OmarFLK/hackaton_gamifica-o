import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayPoint } from '../../lib/format'

// Série única, cor validada (dataviz validate_palette: L, croma e contraste PASS vs superfície clara).
const SERIES = '#3F5FAE'
const AXIS = '#7a869b'
const GRID = '#edf0f5'

export const MOOD_LABELS: Record<number, string> = {
  7: 'Radiante', 6: 'Muito feliz', 5: 'Feliz', 4: 'Neutro', 3: 'Não tão bem', 2: 'Muito mal', 1: 'Muito triste',
}

interface TipProps { active?: boolean; payload?: { payload: DayPoint }[]; format: (point: DayPoint) => string }
function Tip({ active, payload, format }: TipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return <div className="chart-tip"><strong>{point.label}</strong><span>{point.value === null ? 'Sem informação' : format(point)}</span></div>
}

function DataTable({ caption, points, format }: { caption: string; points: DayPoint[]; format: (point: DayPoint) => string }) {
  return <details className="chart-table"><summary>Ver como tabela</summary><table><caption className="sr-only">{caption}</caption>
    <thead><tr><th scope="col">Dia</th><th scope="col">Valor relatado</th></tr></thead>
    <tbody>{points.map(p => <tr key={p.key}><td>{p.label}</td><td>{p.value === null ? 'Sem informação' : format(p)}</td></tr>)}</tbody>
  </table></details>
}

function EmptyDays({ points }: { points: DayPoint[] }) {
  const empty = points.filter(p => p.value === null)
  if (!empty.length) return null
  return <p className="chart-empty-days">Sem informação em: {empty.map(p => p.label).join(', ')}</p>
}

/** Humor médio por dia (1–7). Opinião da criança/família — não é estadiamento nem previsão. */
export function MoodChart({ points }: { points: DayPoint[] }) {
  const format = (p: DayPoint) => `${p.value} · ${MOOD_LABELS[Math.round(p.value ?? 0)] ?? ''} (${p.count} registro${p.count > 1 ? 's' : ''})`
  if (points.every(p => p.value === null)) return <p className="empty">Sem informação nos últimos 7 dias.</p>
  return <figure className="chart" aria-label="Gráfico de humor relatado nos últimos 7 dias">
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={GRID}/>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false}/>
        <YAxis domain={[0, 7]} ticks={[1, 4, 7]} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false}/>
        <Tooltip cursor={{ fill: '#f0f3fa' }} content={<Tip format={format}/>}/>
        <Bar dataKey="value" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}/>
      </BarChart>
    </ResponsiveContainer>
    <figcaption className="chart-caption">Média diária na escala 1 (muito triste) a 7 (radiante). Dias sem barra = sem informação.</figcaption>
    <EmptyDays points={points}/>
    <DataTable caption="Humor relatado por dia" points={points} format={format}/>
  </figure>
}

/** Total de água RELATADA por dia, em ml. */
export function WaterChart({ points }: { points: DayPoint[] }) {
  const format = (p: DayPoint) => `${p.value} ml relatados (${p.count} registro${p.count > 1 ? 's' : ''})`
  if (points.every(p => p.value === null)) return <p className="empty">Sem informação nos últimos 7 dias.</p>
  return <figure className="chart" aria-label="Gráfico de água relatada nos últimos 7 dias">
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={GRID}/>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} unit=" ml" width={64}/>
        <Tooltip cursor={{ fill: '#f0f3fa' }} content={<Tip format={format}/>}/>
        <Bar dataKey="value" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}/>
      </BarChart>
    </ResponsiveContainer>
    <figcaption className="chart-caption">Soma dos registros de água informados pela família em cada dia.</figcaption>
    <EmptyDays points={points}/>
    <DataTable caption="Água relatada por dia" points={points} format={format}/>
  </figure>
}

export function MoodLegend() {
  return <p className="chart-caption">Escala: {Object.entries(MOOD_LABELS).reverse().map(([score, label]) => `${score} ${label}`).join(' · ')}</p>
}
