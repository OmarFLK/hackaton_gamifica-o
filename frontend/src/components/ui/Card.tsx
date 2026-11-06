import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`card ${className}`} {...rest}>{children}</section>
}

export function CardHeader({ title, eyebrow, subtitle, action }: { title: ReactNode; eyebrow?: string; subtitle?: ReactNode; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{subtitle && <p className="muted small-text">{subtitle}</p>}</div>{action}</div>
}

export function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}<span className="heading-dot">.</span></h1>{subtitle && <p className="muted">{subtitle}</p>}</div>{action}</div>
}

export function StatCard({ label, value, hint, icon, tone }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: 'green' | 'pink' }) {
  return <article className="stat-card">{icon && <div className={`stat-icon ${tone ?? ''}`}>{icon}</div>}<span>{label}</span><strong className={typeof value === 'string' && value.length > 6 ? 'status-title' : undefined}>{value}</strong>{hint && <small>{hint}</small>}</article>
}
