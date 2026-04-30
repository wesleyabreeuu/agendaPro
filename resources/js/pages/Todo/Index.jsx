import React, { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { ChevronDown, Clock3, MessageSquareText, MoreHorizontal, Plus, Save, Trash2, X } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page'

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
        <PageCard>
          <PageCardHeader
            icon={Plus}
            title="Nova tarefa"
            description="Crie itens com horário, status, urgência e observação."
            action={
              <div className={`rounded-lg border px-3 py-1.5 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
              Dia selecionado: <span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>{dataSelecionada}</span>
            </div>
            }
          />

          <PageCardContent>
          <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[140px_minmax(0,1.5fr)_220px_180px_120px]">
            <div className="grid gap-2">
              <Label className="text-zinc-900">Hora</Label>
              <Input type="time" value={data.hora} onChange={(e) => setData('hora', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-900">Descrição</Label>
              <Input value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} placeholder="Ex.: Revisar proposta do cliente" />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-900">Status</Label>
              <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-900">Urgência</Label>
              <Select value={data.urgencia} onChange={(e) => setData('urgencia', e.target.value)}>
                {urgencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-900">Concluída</Label>
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
              <Label className="text-zinc-900">Observação</Label>
              <Input value={data.observacao} onChange={(e) => setData('observacao', e.target.value)} placeholder="Detalhes rápidos da tarefa" />
            </div>

            {Object.values(errors).length ? (
              <div className="lg:col-span-5">
                <Alert variant="destructive">
                  <AlertDescription>{Object.values(errors)[0]}</AlertDescription>
                </Alert>
              </div>
            ) : null}

            <div className="lg:col-span-5 flex justify-end">
              <Button disabled={processing} className="w-auto gap-2 rounded-xl px-5">
                <Plus className="h-4 w-4" />
                Salvar tarefa
              </Button>
            </div>
          </form>
          </PageCardContent>
        </PageCard>

        <PageCard>
          <PageCardHeader
            icon={Clock3}
            title="Tarefas do dia"
            description="Atualize status, urgência, observações e conclusão direto na tabela."
            action={
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
              <Clock3 className="h-3.5 w-3.5" />
              {rows.length} tarefas
            </div>
            }
          />

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
                      <Input type="time" value={row.hora || ''} onChange={(e) => updateRow(row.id, { hora: e.target.value })} className={tableInputClassName()} />
                    </TableCell>
                    <TableCell className="py-4">
                      <Input value={row.descricao || ''} onChange={(e) => updateRow(row.id, { descricao: e.target.value })} className={tableInputClassName('min-w-[240px]')} />
                    </TableCell>
                    <TableCell className="py-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" className={`min-w-[132px] rounded-full px-3 py-1.5 text-sm font-medium ${statusTone(row.status)}`}>
                            <span className={`h-2.5 w-2.5 rounded-full ${statusMeta(row.status).dot}`} />
                            <span className="truncate">{statusMeta(row.status).label}</span>
                            <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-70" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
                          <div className="space-y-1">
                            {statusOptions.map((option) => (
                              <Button key={option.value} type="button" variant="ghost" onClick={() => handleStatusChange(row, option.value)} className={`h-auto w-full justify-start rounded-xl px-3 py-2 text-left text-sm ${row.status === option.value ? option.tone : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-50'}`}>
                                <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                                <span className="truncate">{option.label}</span>
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="py-4">
                      <Select value={row.urgencia} onChange={(e) => updateRow(row.id, { urgencia: e.target.value })} className={tableInputClassName('min-w-[130px]')}>
                        {urgencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </Select>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button type="button" onClick={() => openObservationModal(row)} variant="outline" className="h-10 min-w-[132px] gap-2 rounded-xl border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50">
                        <MessageSquareText className="h-4 w-4" />
                        {row.observacao ? 'Ver nota' : 'Adicionar'}
                      </Button>
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
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="outline" size="icon" className="w-auto">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Ações da tarefa</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => persistRow(row)}>
                            <Save className="mr-2 h-4 w-4" />
                            {savingRowId === row.id ? 'Salvando...' : 'Salvar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => router.delete(`/todo/${row.id}`, { preserveScroll: true })}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </PageCard>
      </div>

      <Dialog open={Boolean(observationModal)} onOpenChange={(open) => {
        if (!open) closeObservationModal()
      }}>
        {observationModal ? (
          <DialogContent className={`max-w-2xl rounded-xl p-6 ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <DialogHeader>
                <DialogDescription className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Observação da tarefa</DialogDescription>
                <DialogTitle className={`mt-1 text-xl ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{observationModal.descricao}</DialogTitle>
              </DialogHeader>
              <Button type="button" onClick={closeObservationModal} variant="outline" size="icon-lg" className={`rounded-xl ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5">
              <Label className={isDark ? 'text-zinc-100' : 'text-zinc-900'}>Observação</Label>
              <div className={`mt-2 rounded-lg border shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <Textarea
                  className="min-h-44 resize-y border-0 shadow-none focus:ring-0"
                  value={observationModal.observacao}
                  onChange={(e) => setObservationModal((current) => ({ ...current, observacao: e.target.value }))}
                  placeholder="Anote detalhes importantes, contexto ou próximos passos"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                onClick={closeObservationModal}
                variant="outline"
                className={`w-auto rounded-xl ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : ''}`}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={saveObservationModal}
                className="w-auto gap-2 rounded-xl"
              >
                <Save className="h-4 w-4" />
                Salvar observação
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </AppLayout>
  )
}
