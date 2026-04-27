import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Input, Select, Textarea } from '../../components/ui'

export default function LembretesForm({ lembrete = null, compromissos = [], diasSemana = {}, errors = {} }) {
  const editing = Boolean(lembrete?.id)
  const { data, setData, post, put, processing } = useForm({
    tipo: lembrete?.tipo || 'personalizado',
    compromisso_id: lembrete?.compromisso_id || '',
    titulo: lembrete?.titulo || '',
    descricao: lembrete?.descricao || '',
    categoria: lembrete?.categoria || '',
    inicio_em: lembrete?.inicio_em || '',
    minutos_antes: lembrete?.minutos_antes ?? 15,
    recorrencia: lembrete?.recorrencia || '',
    intervalo_recorrencia: lembrete?.intervalo_recorrencia ?? 1,
    dias_semana: lembrete?.dias_semana || [],
    fim_recorrencia_em: lembrete?.fim_recorrencia_em || '',
    ativo: lembrete?.ativo ?? true,
  })

  function submit(e) {
    e.preventDefault()
    if (editing) put(`/lembretes/${lembrete.id}`)
    else post('/lembretes')
  }

  function toggleWeekday(day) {
    const exists = data.dias_semana.includes(day)
    setData('dias_semana', exists ? data.dias_semana.filter((item) => item !== day) : [...data.dias_semana, day])
  }

  const shellClassName = 'flex h-11 w-full items-center rounded-xl border border-zinc-200 bg-white px-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100'
  const shellInputClassName = 'h-full w-full !rounded-none !border-0 !bg-transparent !p-0 text-sm text-zinc-950 !shadow-none outline-none appearance-none focus:!border-0 focus:!ring-0'
  const sectionClassName = 'grid gap-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 lg:grid-cols-2'

  return (
    <AppLayout title={editing ? 'Editar Lembrete' : 'Novo Lembrete'}>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-sm font-medium text-zinc-900">Tipo</label>
            <div className={shellClassName}>
              <Select value={data.tipo} onChange={(e) => setData('tipo', e.target.value)} className={shellInputClassName}>
                <option value="personalizado">Personalizado</option>
                <option value="compromisso">Vinculado a compromisso</option>
              </Select>
            </div>
          </div>

          {data.tipo === 'compromisso' ? (
            <div className={sectionClassName}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">Compromisso</label>
                <div className={shellClassName}>
                  <Select value={data.compromisso_id} onChange={(e) => setData('compromisso_id', e.target.value)} className={shellInputClassName}>
                    <option value="">Selecione</option>
                    {compromissos.map((compromisso) => <option key={compromisso.id} value={compromisso.id}>{compromisso.label}</option>)}
                  </Select>
                </div>
                {errors.compromisso_id ? <p className="text-sm text-red-600">{errors.compromisso_id}</p> : null}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">Minutos antes</label>
                <div className={shellClassName}>
                  <Input type="number" value={data.minutos_antes} onChange={(e) => setData('minutos_antes', e.target.value)} className={shellInputClassName} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={sectionClassName}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Título</label>
                  <div className={shellClassName}>
                    <Input value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} className={shellInputClassName} />
                  </div>
                  {errors.titulo ? <p className="text-sm text-red-600">{errors.titulo}</p> : null}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Categoria</label>
                  <div className={shellClassName}>
                    <Input value={data.categoria} onChange={(e) => setData('categoria', e.target.value)} className={shellInputClassName} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Início</label>
                  <div className={shellClassName}>
                    <Input type="datetime-local" value={data.inicio_em} onChange={(e) => setData('inicio_em', e.target.value)} className={shellInputClassName} />
                  </div>
                  {errors.inicio_em ? <p className="text-sm text-red-600">{errors.inicio_em}</p> : null}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Disparar quantos minutos antes?</label>
                  <div className={shellClassName}>
                    <Input type="number" min="0" max="10080" value={data.minutos_antes} onChange={(e) => setData('minutos_antes', e.target.value)} className={shellInputClassName} />
                  </div>
                  <p className="text-xs text-zinc-500">Use 0 para disparar exatamente no horário informado.</p>
                  {errors.minutos_antes ? <p className="text-sm text-red-600">{errors.minutos_antes}</p> : null}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Recorrência</label>
                  <div className={shellClassName}>
                    <Select value={data.recorrencia} onChange={(e) => setData('recorrencia', e.target.value)} className={shellInputClassName}>
                      <option value="">Sem recorrência</option>
                      <option value="diaria">Diária</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="dias_semana">Dias da semana</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className={sectionClassName}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Intervalo</label>
                  <div className={shellClassName}>
                    <Input type="number" value={data.intervalo_recorrencia} onChange={(e) => setData('intervalo_recorrencia', e.target.value)} className={shellInputClassName} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Fim da recorrência</label>
                  <div className={shellClassName}>
                    <Input type="date" value={data.fim_recorrencia_em} onChange={(e) => setData('fim_recorrencia_em', e.target.value)} className={shellInputClassName} />
                  </div>
                </div>
              </div>

              {data.recorrencia === 'dias_semana' ? (
                <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
                  <label className="text-sm font-medium text-zinc-900">Dias da semana</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(diasSemana).map(([value, label]) => (
                      <label key={value} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm">
                        <input
                          type="checkbox"
                          checked={data.dias_semana.includes(Number(value))}
                          onChange={() => toggleWeekday(Number(value))}
                          className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-blue-100"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">Descrição</label>
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                  <Textarea className="min-h-32 resize-y border-0 shadow-none focus:ring-0" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
              <input
                type="checkbox"
                checked={data.ativo}
                onChange={(e) => setData('ativo', e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-blue-100"
              />
              <span>Manter lembrete ativo</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar</button>
            <Link href="/lembretes" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
