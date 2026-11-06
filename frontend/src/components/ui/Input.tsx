import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface FieldProps { label: string; hint?: string; error?: string }

function Field({ id, label, hint, error, children }: FieldProps & { id: string; children: ReactNode }) {
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    {children}
    {hint && !error && <small id={`${id}-hint`} className="field-hint">{hint}</small>}
    {error && <small id={`${id}-error`} className="field-error" role="alert">{error}</small>}
  </div>
}
const describedBy = (id: string, hint?: string, error?: string) => error ? `${id}-error` : hint ? `${id}-hint` : undefined

export function Input({ label, hint, error, id, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const generated = useId(); const fieldId = id ?? generated
  return <Field id={fieldId} label={label} hint={hint} error={error}><input id={fieldId} aria-invalid={!!error || undefined} aria-describedby={describedBy(fieldId, hint, error)} {...rest}/></Field>
}

export function Select({ label, hint, error, id, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const generated = useId(); const fieldId = id ?? generated
  return <Field id={fieldId} label={label} hint={hint} error={error}><select id={fieldId} aria-invalid={!!error || undefined} aria-describedby={describedBy(fieldId, hint, error)} {...rest}>{children}</select></Field>
}

export function Textarea({ label, hint, error, id, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generated = useId(); const fieldId = id ?? generated
  return <Field id={fieldId} label={label} hint={hint} error={error}><textarea id={fieldId} aria-invalid={!!error || undefined} aria-describedby={describedBy(fieldId, hint, error)} {...rest}/></Field>
}
