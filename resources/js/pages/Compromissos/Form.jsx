import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Checkbox, Input, Select, Textarea } from '@/components/ui'

function formatPermissionLabel(permission) {
  return {
    owner: 'Dono',
    visualizar: 'Pode visualizar',
    editar: 'Pode editar',
  }[permission] || permission
}

function ShareEditor({ compromisso, processing }) {
  const [email, setEmail] = React.useState('')
  const [permission, setPermission] = React.useState('visualizar')
  const [saving, setSaving] = React.useState(false)
  const [feedback, setFeedback] = React.useState(null)
  const [localItems, setLocalItems] = React.useState(compromisso?.compartilhado_com || [])

  const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const addShare = async () => {
    if (!email.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/compromissos/${compromisso.id}/compartilhar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf(),
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email: email.trim(), permissao: permission }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.message || 'Não foi possível compartilhar compromisso.')
      }

      setLocalItems((current) => [
        ...current.filter((item) => Number(item.usuario_id) !== Number(payload?.data?.usuario_id)),
        {
          usuario_id: payload?.data?.usuario_id,
          nome: payload?.data?.usuario_nome || 'Usuário',
          email: payload?.data?.usuario_email || email.trim(),
          permissao: payload?.data?.permissao || permission,
        },
      ])
      setFeedback({ type: 'success', message: payload?.message || 'Compromisso compartilhado com sucesso.' })
      setEmail('')
      setPermission('visualizar')
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível compartilhar compromisso.' })
    } finally {
      setSaving(false)
    }
  }

  const removeShare = async (usuarioId) => {
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/compromissos/${compromisso.id}/compartilhar/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrf(),
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.message || 'Não foi possível remover compartilhamento.')
      }

      setLocalItems((current) => current.filter((item) => Number(item.usuario_id) !== Number(usuarioId)))
      setFeedback({ type: 'success', message: payload?.message || 'Compartilhamento removido com sucesso.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível remover compartilhamento.' })
    } finally {
      setSaving(false)
    }
  }

  if (!compromisso?.pode_compartilhar) {
    return null
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-zinc-950">Compartilhamento</h3>
        <p className="mt-1 text-sm text-zinc-600">Digite o e-mail do usuário do sistema. Se ele existir, o compromisso será compartilhado.</p>
      </div>

      {feedback ? (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
          feedback.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@exemplo.com"
        />
        <Select
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
        >
          <option value="visualizar">Pode visualizar</option>
          <option value="editar">Pode editar</option>
        </Select>
        <Button
          type="button"
          onClick={addShare}
          disabled={saving || processing || !email.trim()}
          className="w-auto disabled:opacity-60"
        >
          Compartilhar
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {localItems.length ? localItems.map((item) => (
          <div key={item.usuario_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-950">{item.nome}</p>
              <p className="text-sm text-zinc-500">{item.email_masked || item.email || 'Sem e-mail'} • {formatPermissionLabel(item.permissao)}</p>
            </div>
            <Button
              type="button"
              onClick={() => removeShare(item.usuario_id)}
              disabled={saving || processing}
              variant="destructive"
              className="w-auto disabled:opacity-60"
            >
              Remover
            </Button>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
            Este compromisso ainda não foi compartilhado com ninguém.
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompromissosForm({ modo = 'create', compromisso = null, categorias = [], errors = {} }) {
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
          {editing && compromisso?.owner?.nome ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-sm text-zinc-600">
              Dono: <span className="font-medium text-zinc-900">{compromisso.owner.nome}</span>
              {compromisso.permissao ? <span className="ml-2"><Badge variant="outline">{formatPermissionLabel(compromisso.permissao)}</Badge></span> : null}
            </div>
          ) : null}

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
                <Input type="datetime-local" value={data.data_inicio} onChange={(e) => setData('data_inicio', e.target.value)} className={shellInputClassName} />
              </div>
              {errors.data_inicio ? <p className="text-sm text-red-600">{errors.data_inicio}</p> : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Data final</label>
              <div className={shellClassName}>
                <Input type="datetime-local" value={data.data_fim} onChange={(e) => setData('data_fim', e.target.value)} className={shellInputClassName} />
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
          </div>

          <div className={sectionClassName}>
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
                <Input type="number" min="1" value={data.recorrencia_intervalo} onChange={(e) => setData('recorrencia_intervalo', e.target.value)} className={shellInputClassName} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Repetir até</label>
              <div className={shellClassName}>
                <Input type="date" value={data.data_fim_recorrencia} onChange={(e) => setData('data_fim_recorrencia', e.target.value)} className={shellInputClassName} />
              </div>
              {errors.data_fim_recorrencia ? <p className="text-sm text-red-600">{errors.data_fim_recorrencia}</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
              <Checkbox
                checked={data.dia_inteiro}
                onCheckedChange={(checked) => setData('dia_inteiro', Boolean(checked))}
              />
              <span>Evento de dia inteiro</span>
            </label>
          </div>

          {editing ? (
            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 shadow-sm lg:col-span-2">
              <Checkbox
                checked={data.cancelar_lembrete}
                onCheckedChange={(checked) => setData('cancelar_lembrete', Boolean(checked))}
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
            <Button disabled={processing} className="w-auto">
              {editing ? 'Salvar alterações' : 'Criar compromisso'}
            </Button>
            <Link href="/compromissos" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
              Cancelar
            </Link>
          </div>
        </form>

        {editing ? <div className="mt-6"><ShareEditor compromisso={compromisso} processing={processing} /></div> : null}
      </div>
    </AppLayout>
  )
}
