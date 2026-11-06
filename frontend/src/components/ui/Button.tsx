import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

type Variant = 'primary' | 'ghost' | 'wine' | 'plain'
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; small?: boolean; loading?: boolean }

/** Botão acessível: altura mínima 48px, foco visível (CSS global) e estado de carregamento anunciado. */
export function Button({ variant = 'primary', small, loading, disabled, children, className = '', type = 'button', ...rest }: Props) {
  const classes = ['button', variant === 'plain' ? '' : variant, small ? 'small' : '', className].filter(Boolean).join(' ')
  return <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
    {loading && <LoaderCircle className="spin" size={17} aria-hidden="true"/>}{children}
  </button>
}
