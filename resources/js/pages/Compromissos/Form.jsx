import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Input, Select, Textarea } from '../../components/ui'

export default function CompromissosForm({ modo = 'create', compromisso = null, categorias = [], leadTimeOptions = [], errors = {} }) {
  const editing = modo === 'edit' && compromisso?.id
  const { data, setData, post, put, processing } = useForm({
    titulo: compromisso?.titulo || '',
    categoria_id: compromisso?.categoria_id || '',
    descricao: compromisso?.descricao || '',
    data_inicio: compromisso?.data_inicio || '',
    data_fim: compromisso?.data_fim || '',
    dia_inteiro: compromisso?.dia_inteiro || false,
    recorrencia: compromisso?.recorrencia || '',
    recorrencia_intervalo: compromisso?.recorrencia_intervalo || '',
    data_fim_recorrencia: compromisso?.data_fim_recorrencia || '',
    telefone: compromisso?.telefone || '',
    lead_time: compromisso?.lead_time || '',
    cancelar_lembrete: false,
  })

  function submit(e) {
    e.preventDefault()
    if (editing) put(`/compromissos/${compromisso.id}`)
    else post('/compromissos')
  }

  const shellClassName = 'flex h-11 w-full items-center rounded-xl border border-zinc-200 bg-white px-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100'
  const shellInputClassName = 'h-full w-full !rounded-none !border-0 !bg-transparent !p-0 text-sm text-zinc-950 !shadow-none outline-none appearance-none focus:!border-0 focus:!ring-0'
  const sectionClassName = 'grid gap-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 lg:grid-cols-2'

  return (
    <AppLayout title={editing ? 'Editar Compromisso' : 'Novo Compromisso'}>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-sm font-medium text-zinc-900">Título</label>
            <div className={shellClassName}>
              <Input value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} className={shellInputClassName} />
            </div>
            {errors.titulo ? <p className="text-sm text-red-600">{errors.titulo}</p> : null}
          </div>

          <div className={sectionClassName}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Data de início</label>
              <div className={shellClassName}>
                <Input
                  type="datetime-local"
                  value={data.data_inicio}
                  onChange={(e) => setData('data_inicio', e.target.value)}
                  className={shellInputClassName}
                />
              </div>
              {errors.data_inicio ? <p className="text-sm text-red-600">{errors.data_inicio}</p> : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Data final</label>
              <div className={shellClassName}>
                <Input
                  type="datetime-local"
                  value={data.data_fim}
                  onChange={(e) => setData('data_fim', e.target.value)}
                  className={shellInputClassName}
                />
              </div>
              {errors.data_fim ? <p className="text-sm text-red-600">{errors.data_fim}</p> : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Categoria</label>
              <div className={shellClassName}>
                <Select value={data.categoria_id} onChange={(e) => setData('categoria_id', e.target.value)} className={shellInputClassName}>
                  <option value="">Sem categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Telefone para WhatsApp</label>
              <div className={shellClassName}>
                <Input
                  value={data.telefone}
                  onChange={(e) => setData('telefone', e.target.value)}
                  placeholder="5511999999999"
                  className={shellInputClassName}
                />
              </div>
              {errors.telefone ? <p className="text-sm text-red-600">{errors.telefone}</p> : null}
            </div>
          </div>

          <div className={sectionClassName}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Lembrete por WhatsApp</label>
              <div className={shellClassName}>
                <Select value={data.lead_time} onChange={(e) => setData('lead_time', e.target.value)} className={shellInputClassName}>
                  {leadTimeOptions.map((option) => (
                    <option key={option.value || 'none'} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Recorrência</label>
              <div className={shellClassName}>
                <Select value={data.recorrencia} onChange={(e) => setData('recorrencia', e.target.value)} className={shellInputClassName}>
                  <option value="">Não repetir</option>
                  <option value="diaria">Diariamente</option>
                  <option value="semanal">Semanalmente</option>
                  <option value="mensal">Mensalmente</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Intervalo</label>
              <div className={shellClassName}>
                <Input
                  type="number"
                  min="1"
                  value={data.recorrencia_intervalo}
                  onChange={(e) => setData('recorrencia_intervalo', e.target.value)}
                  className={shellInputClassName}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Repetir até</label>
              <div className={shellClassName}>
                <Input
                  type="date"
                  value={data.data_fim_recorrencia}
                  onChange={(e) => setData('data_fim_recorrencia', e.target.value)}
                  className={shellInputClassName}
                />
              </div>
              {errors.data_fim_recorrencia ? <p className="text-sm text-red-600">{errors.data_fim_recorrencia}</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
              <input
                type="checkbox"
                checked={data.dia_inteiro}
                onChange={(e) => setData('dia_inteiro', e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-blue-100"
              />
              <span>Evento de dia inteiro</span>
            </label>
          </div>

          {editing ? (
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 shadow-sm lg:col-span-2">
              <input
                type="checkbox"
                checked={data.cancelar_lembrete}
                onChange={(e) => setData('cancelar_lembrete', e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-blue-100"
              />
              <span>Cancelar lembrete pendente deste compromisso</span>
            </label>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">Descrição</label>
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
              <Textarea className="min-h-36 resize-y border-0 shadow-none focus:ring-0" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">
              {editing ? 'Salvar alterações' : 'Criar compromisso'}
            </button>
            <Link href="/compromissos" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
