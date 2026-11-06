import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { errorText, post } from '../../lib/api'
import type { PersonOption } from '../../lib/types'
import { Button, EmptyState, Input } from '../../components/ui'

export function GuardianCreateForm({ onCreated }: { onCreated?: (guardian: PersonOption) => void }) {
  const { user, offline } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  if (offline) return <EmptyState>Conecte à API para cadastrar um responsável.</EmptyState>
  if (user?.role !== 'CLINICIAN') return null
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setFeedback(null)
    if (form.password !== form.confirm) { setFeedback({ ok: false, text: 'As senhas precisam ser iguais.' }); return }
    setBusy(true)
    try {
      const created = await post<PersonOption>('/api/guardians', { name: form.name.trim(), email: form.email.trim(), password: form.password })
      setForm({ name: '', email: '', password: '', confirm: '' })
      setFeedback({ ok: true, text: `Conta de ${created.name} criada. Agora ela pode ser vinculada à criança.` })
      onCreated?.(created)
    } catch (error) { setFeedback({ ok: false, text: errorText(error) }) } finally { setBusy(false) }
  }
  return <form className="stack-form guardian-create-form" onSubmit={submit}>
    <div className="form-grid"><Input label="Nome do responsável" value={form.name} maxLength={120} minLength={2} required autoComplete="name" onChange={e => setForm({ ...form, name: e.target.value })}/>
      <Input label="E-mail do responsável" type="email" value={form.email} maxLength={200} required autoComplete="off" onChange={e => setForm({ ...form, email: e.target.value })}/></div>
    <div className="form-grid"><Input label="Senha de acesso do responsável" type="password" value={form.password} minLength={12} maxLength={128} required autoComplete="new-password" hint="Use pelo menos 12 caracteres e compartilhe a senha por um canal particular." onChange={e => setForm({ ...form, password: e.target.value })}/>
      <Input label="Confirmar senha do responsável" type="password" value={form.confirm} minLength={12} maxLength={128} required autoComplete="new-password" onChange={e => setForm({ ...form, confirm: e.target.value })}/></div>
    <p className="muted small-text">Use dados fictícios nesta demonstração. A conta será criada agora; nenhum convite por e-mail é enviado.</p>
    <Button type="submit" loading={busy}><UserPlus size={18}/>Criar conta do responsável</Button>
    {feedback && <p role="status" className={feedback.ok ? 'success' : 'field-error'}>{feedback.text}</p>}
  </form>
}
