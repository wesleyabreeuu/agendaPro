import React from 'react'
import { Link } from '@inertiajs/react'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { useTheme } from '../../contexts/ThemeContext'
import { panelClass, STATUS_LABELS, TYPE_LABELS } from './support'

const emptyMilestone = { titulo: '', descricao: '', ordem: '', meta_valor: '', concluido: false }

function fieldError(errors, name) {
  return errors?.[name] ? <p className="mt-1 text-sm text-red-500">{errors[name]}</p> : null
}

export default function GoalForm({ mode = 'create', goal = null, rotinas = [], options = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isEdit = mode === 'edit'
  const form = useForm({
    titulo: goal?.titulo || '',
    descricao: goal?.descricao || '',
    categoria: goal?.categoria || '',
    data_inicio: goal?.data_inicio || '',
    data_meta: goal?.data_meta || '',
    status: goal?.status || 'planejamento',
    cor: goal?.cor || '#2563eb',
    icone: goal?.icone || '◎',
    peso_inicial: goal?.peso_inicial || '',
    peso_meta: goal?.peso_meta || '',
    distancia_meta: goal?.distancia_meta || '',
    valor_meta: goal?.valor_meta || '',
    tipo_meta: goal?.tipo_meta || 'personalizado',
    rotina_ids: goal?.rotina_ids || [],
    milestones: goal?.milestones?.length ? goal.milestones : [
      { ...emptyMilestone, titulo: 'Primeiro marco', ordem: 1 },
    ],
  })

  function submit(event) {
    event.preventDefault()
    if (isEdit) {
      form.put(`/goals/${goal.id}`)
      return
    }
    form.post('/goals')
  }

  function setMilestone(index, key, value) {
    form.setData('milestones', form.data.milestones.map((item, current) => current === index ? { ...item, [key]: value } : item))
  }

  function addMilestone() {
    form.setData('milestones', [...form.data.milestones, { ...emptyMilestone, ordem: form.data.milestones.length + 1 }])
  }

  function removeMilestone(index) {
    form.setData('milestones', form.data.milestones.filter((_, current) => current !== index))
  }

  function toggleRotina(id) {
    const exists = form.data.rotina_ids.includes(id)
    form.setData('rotina_ids', exists ? form.data.rotina_ids.filter((item) => item !== id) : [...form.data.rotina_ids, id])
  }

  return (
    <AppLayout title={isEdit ? 'Editar Objetivo' : 'Novo Objetivo'} chrome="dashboard">
      <form onSubmit={submit} className="space-y-6">
        <section className={panelClass(isDark)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Button asChild variant="outline" className={`mb-4 h-10 w-auto gap-2 rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}>
                <Link href={isEdit ? `/goals/${goal.id}` : '/goals'}><ArrowLeft className="h-4 w-4" />Voltar</Link>
              </Button>
              <h1 className={`text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{isEdit ? 'Editar objetivo' : 'Criar objetivo'}</h1>
              <p className={`mt-2 max-w-3xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Configure o projeto, suas metas numéricas, marcos e rotinas que ajudam a manter a consistência.</p>
            </div>
            <Button className="h-11 w-auto gap-2 rounded-xl px-5" disabled={form.processing}><Save className="h-4 w-4" />Salvar</Button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className={panelClass(isDark)}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Dados principais</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Título" isDark={isDark}>
                <Input value={form.data.titulo} onChange={(event) => form.setData('titulo', event.target.value)} required />
                {fieldError(form.errors, 'titulo')}
              </Field>
              <Field label="Categoria" isDark={isDark}>
                <Input value={form.data.categoria} onChange={(event) => form.setData('categoria', event.target.value)} placeholder="Saúde, esportes, estudos..." />
              </Field>
              <Field label="Data início" isDark={isDark}>
                <Input type="date" value={form.data.data_inicio} onChange={(event) => form.setData('data_inicio', event.target.value)} />
              </Field>
              <Field label="Data meta" isDark={isDark}>
                <Input type="date" value={form.data.data_meta} onChange={(event) => form.setData('data_meta', event.target.value)} />
                {fieldError(form.errors, 'data_meta')}
              </Field>
              <Field label="Status" isDark={isDark}>
                <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                  {(options.statuses || []).map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </Select>
              </Field>
              <Field label="Tipo de meta" isDark={isDark}>
                <Select value={form.data.tipo_meta} onChange={(event) => form.setData('tipo_meta', event.target.value)}>
                  {(options.types || []).map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}
                </Select>
              </Field>
              <Field label="Cor" isDark={isDark}>
                <Input type="color" value={form.data.cor} onChange={(event) => form.setData('cor', event.target.value)} className="h-10" />
              </Field>
              <Field label="Ícone" isDark={isDark}>
                <Input value={form.data.icone} onChange={(event) => form.setData('icone', event.target.value)} maxLength={12} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Descrição" isDark={isDark}>
                  <Textarea rows={5} value={form.data.descricao} onChange={(event) => form.setData('descricao', event.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <section className={panelClass(isDark)}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Metas numéricas</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Peso inicial" isDark={isDark}><Input type="number" step="0.01" value={form.data.peso_inicial} onChange={(event) => form.setData('peso_inicial', event.target.value)} /></Field>
              <Field label="Peso meta" isDark={isDark}><Input type="number" step="0.01" value={form.data.peso_meta} onChange={(event) => form.setData('peso_meta', event.target.value)} /></Field>
              <Field label="Distância meta" isDark={isDark}><Input type="number" step="0.01" value={form.data.distancia_meta} onChange={(event) => form.setData('distancia_meta', event.target.value)} /></Field>
              <Field label="Valor meta" isDark={isDark}><Input type="number" step="0.01" value={form.data.valor_meta} onChange={(event) => form.setData('valor_meta', event.target.value)} /></Field>
            </div>
          </section>
        </div>

        <section className={panelClass(isDark)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Marcos</h2>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Checklist de conquistas intermediárias.</p>
            </div>
            <Button type="button" onClick={addMilestone} variant="outline" className={`h-10 w-auto gap-2 rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}><Plus className="h-4 w-4" />Adicionar</Button>
          </div>
          <div className="mt-5 space-y-3">
            {form.data.milestones.map((milestone, index) => (
              <div key={index} className={`grid gap-3 rounded-lg border p-4 md:grid-cols-[80px_1fr_140px_1fr_auto] ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                <Input type="number" value={milestone.ordem} onChange={(event) => setMilestone(index, 'ordem', event.target.value)} placeholder="Ordem" />
                <Input value={milestone.titulo} onChange={(event) => setMilestone(index, 'titulo', event.target.value)} placeholder="Título do marco" />
                <Input type="number" step="0.01" value={milestone.meta_valor} onChange={(event) => setMilestone(index, 'meta_valor', event.target.value)} placeholder="Valor" />
                <Input value={milestone.descricao || ''} onChange={(event) => setMilestone(index, 'descricao', event.target.value)} placeholder="Descrição" />
                <Button type="button" variant="outline" size="icon-lg" onClick={() => removeMilestone(index)} className="rounded-xl border-red-200 bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </section>

        <section className={panelClass(isDark)}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Rotinas vinculadas</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rotinas.map((rotina) => (
              <label key={rotina.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
                <Checkbox checked={form.data.rotina_ids.includes(rotina.id)} onCheckedChange={() => toggleRotina(rotina.id)} />
                <span>
                  <span className="block text-sm font-medium">{rotina.nome}</span>
                  <span className={`block text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{rotina.categoria}</span>
                </span>
              </label>
            ))}
            {!rotinas.length ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nenhuma rotina cadastrada para vincular.</p> : null}
          </div>
        </section>
      </form>
    </AppLayout>
  )
}

function Field({ label, children, isDark }) {
  return (
    <label className="block">
      <span className={`mb-2 block text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{label}</span>
      {children}
    </label>
  )
}
