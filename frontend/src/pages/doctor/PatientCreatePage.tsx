import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'
import { usePatients } from '../../app/PatientsProvider'
import { api, errorText, post } from '../../lib/api'
import type { AvatarId, FormOptions, Patient, PatientCreateInput } from '../../lib/types'
import { Button, Card, EmptyState, ErrorState, Input, Loading, PageHeading, Select, Textarea } from '../../components/ui'
import { COMING_SOON, PANDI, PandiAvatar } from '../child/mascots'

const STEPS = ['Dados fictícios', 'Equipe e família', 'Revisão']

export function PatientCreatePage() {
  const { user, offline } = useAuth()
  const { refresh } = usePatients()
  const navigate = useNavigate()
  const isClinician = user?.role === 'CLINICIAN'
  const [step, setStep] = useState(0)
  const [options, setOptions] = useState<FormOptions | null>(null)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ name: '', birth_date: '', chosen_avatar: 'pandi' as AvatarId, clinician_id: '', guardian_user_id: '', cancer_type_demo: '', clinical_stage_demo: '', clinical_notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (offline) return
    api<FormOptions>('/api/patients/form-options').then(data => { setOptions(data); setForm(f => ({ ...f, clinician_id: f.clinician_id || String(data.clinicians[0]?.id ?? '') })) })
      .catch(err => setLoadError(errorText(err)))
  }, [offline])

  if (offline) return <EmptyState>O cadastro exige a API. No modo offline de apresentação nada é gravado.</EmptyState>
  if (loadError) return <ErrorState message={loadError}/>
  if (!options) return <Loading/>

  const set = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [field]: event.target.value })
  const validateStep = () => {
    const next: Record<string, string> = {}
    if (step === 0) {
      if (form.name.trim().length < 2) next.name = 'Informe um nome fictício.'
      if (!form.birth_date) next.birth_date = 'Informe a data de nascimento fictícia.'
      else if (new Date(form.birth_date) > new Date()) next.birth_date = 'A data não pode estar no futuro.'
    }
    if (step === 1 && !form.clinician_id) next.clinician_id = 'Selecione o médico responsável.'
    setErrors(next)
    return !Object.keys(next).length
  }
  const submit = async () => {
    setBusy(true); setSubmitError('')
    const body: PatientCreateInput = { name: form.name.trim(), birth_date: form.birth_date, chosen_avatar: form.chosen_avatar, clinician_id: Number(form.clinician_id) }
    if (form.guardian_user_id) body.guardian_user_id = Number(form.guardian_user_id)
    if (isClinician) {
      if (form.cancer_type_demo.trim()) body.cancer_type_demo = form.cancer_type_demo.trim()
      if (form.clinical_stage_demo.trim()) body.clinical_stage_demo = form.clinical_stage_demo.trim()
      if (form.clinical_notes.trim()) body.clinical_notes = form.clinical_notes.trim()
    }
    try {
      const created = await post<Patient>('/api/patients', body)
      refresh(); navigate(`/medico/pacientes/${created.id}`, { replace: true })
    } catch (err) { setSubmitError(errorText(err)) } finally { setBusy(false) }
  }
  const guardian = options.guardians.find(g => String(g.id) === form.guardian_user_id)
  const clinician = options.clinicians.find(c => String(c.id) === form.clinician_id)

  return <>
    <PageHeading eyebrow="NOVO CADASTRO" title="Cadastrar paciente" subtitle="Use somente dados fictícios. Nenhum convite real é enviado."/>
    <ol className="stepper" aria-label="Etapas do cadastro">{STEPS.map((label, index) => <li key={label} className={index === step ? 'current' : index < step ? 'done' : ''} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <Check size={14}/> : index + 1}</span>{label}</li>)}</ol>
    <Card>
      {step === 0 && <div className="stack-form">
        <div className="form-grid">
          <Input label="Nome fictício da criança" value={form.name} onChange={set('name')} maxLength={120} error={errors.name} autoFocus/>
          <Input label="Data de nascimento (fictícia)" type="date" value={form.birth_date} onChange={set('birth_date')} max={new Date().toISOString().slice(0, 10)} error={errors.birth_date}/>
        </div>
        <div className="companion-fixed"><PandiAvatar size={52}/><div><strong>Companheiro: {PANDI.name}</strong><small>{COMING_SOON.map(c => c.name).join(', ')}: em desenvolvimento.</small></div></div>
      </div>}
      {step === 1 && <div className="stack-form">
        <Select label="Médico(a) responsável" value={form.clinician_id} onChange={set('clinician_id')} error={errors.clinician_id} disabled={isClinician} hint={isClinician ? 'Você será o médico responsável.' : 'Somente médicos que delegaram cadastro a você.'}>
          {!options.clinicians.length && <option value="">Nenhuma delegação disponível</option>}
          {options.clinicians.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Convidar familiar (responsável demo existente)" value={form.guardian_user_id} onChange={set('guardian_user_id')} hint="Demo: o vínculo é criado direto, sem e-mail real.">
          <option value="">Vincular depois</option>
          {options.guardians.map(g => <option key={g.id} value={g.id}>{g.name} · {g.email}</option>)}
        </Select>
        {isClinician ? <fieldset><legend>Campos clínicos fictícios (opcional, só médico)</legend>
          <div className="form-grid"><Input label="Tipo (fictício)" value={form.cancer_type_demo} onChange={set('cancer_type_demo')} maxLength={120}/><Input label="Estágio (fictício)" value={form.clinical_stage_demo} onChange={set('clinical_stage_demo')} maxLength={60}/></div>
          <Textarea label="Notas (fictícias)" value={form.clinical_notes} onChange={set('clinical_notes')} maxLength={2000}/>
        </fieldset> : <div className="notice"><p><strong>Perfil assistente:</strong> cadastro administrativo. Diagnóstico, estágio e prescrição ficam com o médico.</p></div>}
      </div>}
      {step === 2 && <dl className="review-list">
        <div><dt>Nome</dt><dd>{form.name}</dd></div><div><dt>Nascimento</dt><dd>{form.birth_date.split('-').reverse().join('/')}</dd></div>
        <div><dt>Companheiro</dt><dd>{PANDI.name}</dd></div>
        <div><dt>Médico(a)</dt><dd>{clinician?.name ?? '—'}</dd></div><div><dt>Família</dt><dd>{guardian?.name ?? 'Vincular depois'}</dd></div>
        {isClinician && form.cancer_type_demo && <div><dt>Tipo (fictício)</dt><dd>{form.cancer_type_demo}</dd></div>}
      </dl>}
      {submitError && <ErrorState message={submitError}/>}
      <div className="form-actions">
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={busy}><ArrowLeft size={17}/>Voltar</Button>}
        {step < 2 ? <Button onClick={() => validateStep() && setStep(step + 1)}>Continuar<ArrowRight size={17}/></Button> : <Button onClick={submit} loading={busy}><Check size={17}/>Cadastrar no servidor</Button>}
      </div>
    </Card>
  </>
}
