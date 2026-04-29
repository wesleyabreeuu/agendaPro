import React, { useEffect, useState } from 'react'
import { router, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Check, ChevronDown, Clock3, MessageSquareText, MoreHorizontal, Plus, Save, Trash2, X } from 'lucide-react'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'

const statusOptions = [
  { value: 'aguardando', label: 'Não iniciado', tone: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-400' },
  { value: 'execucao', label: 'Em andamento', tone: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
  { value: 'finalizado', label: 'Concluído', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
]

const urgencyOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

function statusTone(status) {
  return statusOptions.find((item) => item.value === status)?.tone || 'bg-zinc-100 text-zinc-700 border-zinc-200'
}

function statusMeta(status) {
  return statusOptions.find((item) => item.value === status) || statusOptions[0]
}

function urgencyLabel(value) {
  return urgencyOptions.find((item) => item.value === value)?.label || value
}

function tableInputClassName(extra = '') {
  return `h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${extra}`.trim()
}

export default function TodoIndex({ tarefas, dataSelecionada, errors = {} }) {
  const { theme } = useTheme()
  const [rows, setRows] = useState(tarefas)
  const [savingRowId, setSavingRowId] = useState(null)
  const [observationModal, setObservationModal] = useState(null)
  const isDark = theme === 'dark'

  const { data, setData, post, processing, reset } = useForm({
    data: dataSelecionada,
    hora: '',
    descricao: '',
    observacao: '',
    urgencia: 'media',
    status: 'aguardando',
    concluida: false,
  })

  useEffect(() => {
    setRows(tarefas)
  }, [tarefas])

  function submit(e) {
    e.preventDefault()
    post('/todo', {
      preserveScroll: true,
      onSuccess: () => reset('hora', 'descricao', 'observacao', 'urgencia', 'status', 'concluida'),
    })
  }

  function updateRow(id, patch) {
    setRows((current) => current.map((row) => {
      if (row.id !== id) return row

      const next = { ...row, ...patch }
      if (Object.prototype.hasOwnProperty.call(patch, 'status')) {
        next.concluida = patch.status === 'finalizado'
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'concluida')) {
        next.status = patch.concluida ? 'finalizado' : row.status === 'finalizado' ? 'aguardando' : row.status
      }

      return next
    }))
  }

  function persistRow(row, override = {}) {
    const payload = { ...row, ...override }
    setSavingRowId(row.id)

    router.put(`/todo/${row.id}`, {
      data: payload.data || dataSelecionada,
      hora: payload.hora || '',
      descricao: payload.descricao || '',
      observacao: payload.observacao || '',
      urgencia: payload.urgencia || 'media',
      status: payload.status || 'aguardando',
      concluida: Boolean(payload.concluida),
    }, {
      preserveScroll: true,
      onFinish: () => setSavingRowId(null),
    })
  }

  function handleStatusChange(row, status) {
    const updated = { ...row, status, concluida: status === 'finalizado' }
    updateRow(row.id, updated)
    persistRow(updated)
  }

  function handleConcludedToggle(row, checked) {
    const updated = {
      ...row,
      concluida: checked,
      status: checked ? 'finalizado' : row.status === 'finalizado' ? 'aguardando' : row.status,
    }
    updateRow(row.id, updated)
    persistRow(updated)
  }

  function openObservationModal(row) {
    setObservationModal({
      id: row.id,
      descricao: row.descricao,
      observacao: row.observacao || '',
    })
  }

  function closeObservationModal() {
    setObservationModal(null)
  }

  function saveObservationModal() {
    if (!observationModal) return

    const row = rows.find((item) => item.id === observationModal.id)
    if (!row) return

    const updated = { ...row, observacao: observationModal.observacao }
    updateRow(row.id, { observacao: observationModal.observacao })
    persistRow(updated)
    closeObservationModal()
  }

  return (
    <AppLayout title="Todo List" chrome="dashboard">
      <div className="space-y-6">
        <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Nova tarefa</h2>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crie itens com horário, status, urgência e observação.</p>
            </div>
            <div className={`rounded-2xl border px-4 py-2 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
              Dia selecionado: <span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>{dataSelecionada}</span>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-[140px_minmax(0,1.5fr)_220px_180px_120px]">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Hora</label>
              <Input type="time" value={data.hora} onChange={(e) => setData('hora', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Descrição</label>
              <Input value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} placeholder="Ex.: Revisar proposta do cliente" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Status</label>
              <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Urgência</label>
              <Select value={data.urgencia} onChange={(e) => setData('urgencia', e.target.value)}>
                {urgencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">Concluída</label>
              <label className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 shadow-sm">
                <Checkbox
                  checked={data.concluida}
                  onCheckedChange={(checked) => {
                    const next = Boolean(checked)
                    setData('concluida', next)
                    setData('status', next ? 'finalizado' : 'aguardando')
                  }}
                />
                <span>Finalizar</span>
              </label>
            </div>

            <div className="grid gap-2 lg:col-span-5">
              <label className="text-sm font-medium text-zinc-900">Observação</label>
              <Input value={data.observacao} onChange={(e) => setData('observacao', e.target.value)} placeholder="Detalhes rápidos da tarefa" />
            </div>

            {Object.values(errors).length ? <div className="text-sm text-red-600 lg:col-span-5">{Object.values(errors)[0]}</div> : null}

            <div className="lg:col-span-5 flex justify-end">
              <Button disabled={processing} className="w-auto gap-2 rounded-xl px-5">
                <Plus className="h-4 w-4" />
                Salvar tarefa
              </Button>
            </div>
          </form>
        </section>

        <section className={`overflow-hidden rounded-[28px] border shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className={`flex items-center justify-between gap-4 border-b px-6 py-5 ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
            <div>
              <h3 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Tarefas do dia</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Atualize status, urgência, observações e conclusão direto na tabela.</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
              <Clock3 className="h-3.5 w-3.5" />
              {rows.length} tarefas
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader className={isDark ? 'bg-white text-black' : 'bg-zinc-50/80 text-zinc-500'}>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 font-medium">Hora</TableHead>
                  <TableHead className="py-4 font-medium">Descrição</TableHead>
                  <TableHead className="py-4 font-medium">Status</TableHead>
                  <TableHead className="py-4 font-medium">Urgência</TableHead>
                  <TableHead className="py-4 font-medium">Observação</TableHead>
                  <TableHead className="py-4 font-medium">Concluída</TableHead>
                  <TableHead className="py-4 font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? rows.map((row) => (
                  <TableRow key={row.id} className={`align-top ${isDark ? 'border-zinc-700 hover:bg-zinc-900/70' : ''}`}>
                    <TableCell className="py-4">
                      <input
                        type="time"
                        value={row.hora || ''}
                        onChange={(e) => updateRow(row.id, { hora: e.target.value })}
                        className={tableInputClassName()}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <input
                        value={row.descricao || ''}
                        onChange={(e) => updateRow(row.id, { descricao: e.target.value })}
                        className={tableInputClassName('min-w-[240px]')}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <details className="relative inline-block">
                        <summary className={`flex min-w-[132px] cursor-pointer list-none items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusTone(row.status)}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${statusMeta(row.status).dot}`} />
                          <span className="truncate">{statusMeta(row.status).label}</span>
                          <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-70" />
                        </summary>
                        <div className={`absolute left-0 top-[calc(100%+8px)] z-20 min-w-[172px] rounded-2xl border p-2 shadow-lg ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                          <div className="space-y-1">
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleStatusChange(row, option.value)}
                                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${row.status === option.value ? option.tone : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-50'}`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                                <span className="truncate">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </details>
                    </TableCell>
                    <TableCell className="py-4">
                      <select
                        value={row.urgencia}
                        onChange={(e) => updateRow(row.id, { urgencia: e.target.value })}
                        className={tableInputClassName('min-w-[130px]')}
                      >
                        {urgencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="py-4">
                      <button
                        type="button"
                        onClick={() => openObservationModal(row)}
                        className="inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                      >
                        <MessageSquareText className="h-4 w-4" />
                        {row.observacao ? 'Ver nota' : 'Adicionar'}
                      </button>
                    </TableCell>
                    <TableCell className="py-4">
                      <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 shadow-sm">
                        <Checkbox
                          checked={Boolean(row.concluida)}
                          onCheckedChange={(checked) => handleConcludedToggle(row, Boolean(checked))}
                        />
                        <span>{row.concluida ? 'Feita' : 'Pendente'}</span>
                      </label>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => persistRow(row)}
                          disabled={savingRowId === row.id}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                          title={savingRowId === row.id ? 'Salvando' : 'Salvar'}
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => router.delete(`/todo/${row.id}`, { preserveScroll: true })}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan="7" className="px-6 py-14 text-center">
                      <div className="space-y-2">
                        <p className={`text-lg font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Nenhuma tarefa cadastrada para este dia</p>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crie a primeira linha acima e acompanhe o dia nesse formato de tabela.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <Dialog open={Boolean(observationModal)} onOpenChange={(open) => {
        if (!open) closeObservationModal()
      }}>
        {observationModal ? (
          <DialogContent className={`max-w-2xl rounded-[28px] p-6 ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <DialogHeader>
                <DialogDescription className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Observação da tarefa</DialogDescription>
                <DialogTitle className={`mt-1 text-xl ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{observationModal.descricao}</DialogTitle>
              </DialogHeader>
              <button
                type="button"
                onClick={closeObservationModal}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Observação</label>
              <div className={`mt-2 rounded-2xl border shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <Textarea
                  className="min-h-44 resize-y border-0 shadow-none focus:ring-0"
                  value={observationModal.observacao}
                  onChange={(e) => setObservationModal((current) => ({ ...current, observacao: e.target.value }))}
                  placeholder="Anote detalhes importantes, contexto ou próximos passos"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button
                type="button"
                onClick={closeObservationModal}
                className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveObservationModal}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm"
              >
                <Save className="h-4 w-4" />
                Salvar observação
              </button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </AppLayout>
  )
}
