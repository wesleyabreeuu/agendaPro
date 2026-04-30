import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { useTheme } from '../../contexts/ThemeContext'
import {
  CalendarDays,
  CheckSquare,
  Trash2,
  GripVertical,
  Link2,
  ListTodo,
  Paperclip,
  Plus,
  Save,
  SquarePen,
  X,
} from 'lucide-react'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, Textarea } from '@/components/ui'
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay } from '@/components/ui/kanban'

const boardBackgrounds = {
  violet: 'bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]',
  ocean: 'bg-[linear-gradient(180deg,#f0f9ff_0%,#e0f2fe_100%)]',
  sunset: 'bg-[linear-gradient(180deg,#fff7ed_0%,#ffedd5_100%)]',
  forest: 'bg-[linear-gradient(180deg,#f0fdf4_0%,#dcfce7_100%)]',
  paper: 'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
}

const labelPalette = ['#38bdf8', '#c084fc', '#f59e0b', '#4ade80', '#f87171', '#a78bfa']

function emptyTask(listKey = '') {
  return {
    titulo: '',
    descricao: '',
    observacoes: '',
    urgencia: 'media',
    data_limite: '',
    list_key: listKey,
    etiquetas: [],
    checklist: [],
    anexos: [],
    campos_personalizados: [],
  }
}

function urgencyTone(urgencia) {
  return {
    baixa: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    media: 'border-amber-200 bg-amber-50 text-amber-700',
    alta: 'border-orange-200 bg-orange-50 text-orange-700',
  }[urgencia] || 'border-rose-200 bg-rose-50 text-rose-700'
}

function ensureLabel(task) {
  return [...(task.etiquetas || []), { nome: '', cor: labelPalette[(task.etiquetas || []).length % labelPalette.length] }]
}

function ensureChecklist(task) {
  return [...(task.checklist || []), { titulo: '', done: false }]
}

function ensureAttachment(task) {
  return [...(task.anexos || []), { nome: '', url: '' }]
}

function sanitizeTask(task) {
  return {
    ...task,
    etiquetas: (task.etiquetas || []).filter((item) => item.nome),
    checklist: (task.checklist || []).filter((item) => item.titulo),
    anexos: (task.anexos || []).filter((item) => item.url),
  }
}

function buildKanbanColumns(lists, tarefasByList) {
  return Object.fromEntries(
    lists.map((list) => [list.key, tarefasByList[list.key] || []])
  )
}

function findTaskColumn(columns, taskId) {
  const normalizedTaskId = String(taskId)

  return Object.keys(columns).find((columnKey) =>
    (columns[columnKey] || []).some((item) => String(item.id) === normalizedTaskId)
  )
}

function moveArrayItem(items, fromIndex, toIndex) {
  const nextItems = [...items]
  const [item] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, item)
  return nextItems
}

export default function KanbanShow({ board, lists = [], tarefas = {}, backgroundOptions = [], errors = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeCard, setActiveCard] = useState(null)
  const [newListTitle, setNewListTitle] = useState('')
  const [editingBoard, setEditingBoard] = useState(false)
  const [cardActionError, setCardActionError] = useState('')
  const [kanbanColumns, setKanbanColumns] = useState(() => buildKanbanColumns(lists, tarefas))
  const dragStartColumnsRef = useRef(null)

  const boardForm = useForm({
    nome: board.nome || '',
    descricao: board.descricao || '',
    background_style: board.background_style || 'violet',
    listas: board.listas || lists,
  })

  const taskForm = useForm(emptyTask(lists[0]?.key || ''))

  const boardLists = useMemo(() => boardForm.data.listas || lists, [boardForm.data.listas, lists])
  const listMap = useMemo(() => Object.fromEntries(boardLists.map((list) => [list.key, list])), [boardLists])

  useEffect(() => {
    setKanbanColumns(buildKanbanColumns(boardLists, tarefas))
  }, [boardLists, tarefas])

  function saveBoard() {
    boardForm.put(`/kanban/boards/${board.id}`, { preserveScroll: true, onSuccess: () => setEditingBoard(false) })
  }

  function addList() {
    if (!newListTitle.trim()) return
    const key = newListTitle.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-')
    const nextKey = `${key || 'lista'}-${Date.now()}`
    boardForm.setData('listas', [...boardLists, { key: nextKey, title: newListTitle.trim() }])
    setKanbanColumns((current) => ({ ...current, [nextKey]: [] }))
    setNewListTitle('')
  }

  function submitQuickTask(e) {
    e.preventDefault()
    taskForm.post(`/kanban/boards/${board.id}/tasks`, {
      preserveScroll: true,
      onSuccess: () => taskForm.reset(),
    })
  }

  function openCard(task) {
    setCardActionError('')
    setActiveCard({ ...task })
  }

  function updateActiveCard(patch) {
    setActiveCard((current) => ({ ...current, ...patch }))
  }

  function saveActiveCard() {
    if (!activeCard) return
    setCardActionError('')
    router.put(`/kanban/tasks/${activeCard.id}`, sanitizeTask(activeCard), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => setActiveCard(null),
      onError: (errors) => {
        setCardActionError(Object.values(errors || {}).flat().find(Boolean) || 'Nao foi possivel salvar este cartao.')
      },
    })
  }

  function moveTask(taskId, listKey) {
    setCardActionError('')
    router.patch(`/kanban/tasks/${taskId}/status`, { list_key: listKey }, { preserveScroll: true, preserveState: true })
  }

  function deleteTask(taskId, { closeModal = false } = {}) {
    setCardActionError('')
    router.delete(`/kanban/tasks/${taskId}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        if (closeModal) {
          setActiveCard(null)
        }
      },
      onError: () => {
        setCardActionError('Nao foi possivel excluir este cartao.')
      },
    })
  }

  function handleKanbanChange(nextColumns) {
    setKanbanColumns(nextColumns)
  }

  function handleKanbanDragStart() {
    dragStartColumnsRef.current = kanbanColumns
  }

  function handleKanbanMove(event) {
    const activeId = String(event.active.id)
    const startColumns = dragStartColumnsRef.current || kanbanColumns

    const isColumnMove = Object.prototype.hasOwnProperty.call(startColumns, activeId)

    if (isColumnMove) {
      const nextLists = moveArrayItem(boardLists, event.activeIndex, event.overIndex)

      setKanbanColumns((current) => Object.fromEntries(nextLists.map((list) => [list.key, current[list.key] || []])))
      boardForm.setData('listas', nextLists)
      boardForm.transform((data) => ({ ...data, listas: nextLists }))
      boardForm.put(`/kanban/boards/${board.id}`, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          boardForm.transform((data) => data)
        },
      })
      return
    }

    const sourceListKey = findTaskColumn(startColumns, activeId)
    const targetListKey = findTaskColumn(kanbanColumns, activeId)

    if (sourceListKey && targetListKey && sourceListKey !== targetListKey) {
      moveTask(activeId, targetListKey)
    }
  }

  return (
    <AppLayout title={board.nome} chrome="dashboard">
      <div className={`min-h-[calc(100vh-11rem)] rounded-xl border p-5 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-950' : `${boardBackgrounds[board.background_style] || boardBackgrounds.paper} border-zinc-200`}`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-50' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-950'}`}>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{board.nome}</h2>
              <Button type="button" onClick={() => setEditingBoard(true)} variant="outline" size="icon-lg" className={`rounded-xl ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-700 hover:bg-zinc-50'}`}>
                <SquarePen className="h-4 w-4" />
              </Button>
            </div>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{board.descricao || 'Organize listas e cartões como em um quadro de trabalho visual.'}</p>
          </div>

          <Button asChild variant="outline" className={`h-11 w-auto rounded-xl px-4 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-950'}`}>
            <Link href="/kanban">Voltar aos quadros</Link>
          </Button>
        </div>

        <Kanban value={kanbanColumns} onValueChange={handleKanbanChange} onMove={handleKanbanMove} onDragStart={handleKanbanDragStart} getItemValue={(task) => String(task.id)}>
          <KanbanBoard className="mt-6 h-auto items-start gap-4 overflow-x-auto pb-4">
            {Object.entries(kanbanColumns).map(([columnKey, items]) => {
              const list = listMap[columnKey]
              if (!list) return null

              return (
                <KanbanColumn
                  key={list.key}
                  value={list.key}
                  className={`h-auto w-[320px] shrink-0 gap-3 rounded-lg border p-2.5 shadow-xs ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-100/80'}`}
                >
                  <div className="flex items-center justify-between gap-3 px-1 py-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <KanbanColumnHandle
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-400' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-500'}`}
                        title="Arraste para mover a lista"
                      >
                        <GripVertical className="h-4 w-4" />
                      </KanbanColumnHandle>
                      <h3 className={`truncate text-sm font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{list.title}</h3>
                    </div>
                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-2 text-xs font-medium ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-white text-zinc-600'}`}>
                      {items.length}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {items.map((task) => (
                      <KanbanItem
                        key={task.id}
                        value={String(task.id)}
                        className={`w-full rounded-lg border p-3 text-left shadow-xs transition hover:shadow-xs ${isDark ? 'border-zinc-800 bg-zinc-950 hover:border-zinc-700' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                      >
                        <div className="flex items-start gap-2">
                          <KanbanItemHandle
                            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-500' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                            title="Arraste para mover o cartão"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </KanbanItemHandle>

                          <button type="button" onClick={() => openCard(task)} className="min-w-0 flex-1 text-left">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <h4 className={`min-w-0 break-words text-sm font-medium leading-5 ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{task.titulo}</h4>
                              <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${urgencyTone(task.urgencia)}`}>{task.urgencia}</span>
                            </div>

                            {task.descricao ? <p className={`mt-1.5 line-clamp-2 text-xs leading-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{task.descricao}</p> : null}

                            {(task.etiquetas || []).length ? (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                              {(task.etiquetas || []).slice(0, 3).map((etiqueta, index) => (
                                <span key={`${etiqueta.nome}-${index}`} className="rounded px-2 py-0.5 text-[11px] font-medium text-zinc-950" style={{ backgroundColor: etiqueta.cor }}>
                                  {etiqueta.nome}
                                </span>
                              ))}
                              </div>
                            ) : null}

                            <div className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {task.data_limite_label ? (
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {task.data_limite_label}
                                </span>
                              ) : null}
                              {task.checklist_resumo?.total ? (
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                  <CheckSquare className="h-3.5 w-3.5" />
                                  {task.checklist_resumo.concluidos}/{task.checklist_resumo.total}
                                </span>
                              ) : null}
                              {task.anexos?.length ? (
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                  <Paperclip className="h-3.5 w-3.5" />
                                  {task.anexos.length}
                                </span>
                              ) : null}
                            </div>
                          </button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTask(task.id)
                            }}
                            className={`shrink-0 rounded-md ${isDark ? 'text-zinc-500 hover:bg-zinc-900 hover:text-red-400' : 'text-zinc-400 hover:bg-red-50 hover:text-red-600'}`}
                            title="Excluir cartão"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </KanbanItem>
                    ))}
                  </div>

                  <form onSubmit={submitQuickTask} className={`rounded-lg border p-2 shadow-xs ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card'}`}>
                    <input type="hidden" value={list.key} onChange={() => {}} />
                    <Input
                      value={taskForm.data.list_key === list.key ? taskForm.data.titulo : ''}
                      onChange={(e) => {
                        taskForm.setData('list_key', list.key)
                        taskForm.setData('titulo', e.target.value)
                      }}
                      placeholder="Adicionar um cartão"
                      className={`h-9 rounded-md border-0 bg-transparent px-2 text-sm shadow-none focus:border-0 focus:ring-0 ${isDark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-950 placeholder:text-zinc-500'}`}
                    />
                    <Button
                      type="submit"
                      onClick={() => taskForm.setData('list_key', list.key)}
                      fullWidth
                      variant="ghost"
                      className={`mt-1 h-8 justify-start gap-2 rounded-md px-2 text-sm ${isDark ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'}`}
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar cartão
                    </Button>
                  </form>
                </KanbanColumn>
              )
            })}

            <section className={`w-[300px] shrink-0 rounded-lg border p-2.5 shadow-xs ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-zinc-100/80 text-zinc-950'}`}>
              <div className="space-y-2">
                <Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Nome da lista" className="h-9 rounded-md bg-white text-sm" />
                <Button type="button" onClick={addList} variant="ghost" className={`h-8 w-full justify-start gap-2 rounded-md px-2 text-sm ${isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-white'}`}>
                  <Plus className="h-4 w-4" />
                  Criar lista
                </Button>
                <Button type="button" onClick={saveBoard} variant="outline" className={`h-8 w-full justify-start gap-2 rounded-md px-2 text-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-900'}`}>
                  <Save className="h-4 w-4" />
                  Salvar quadro
                </Button>
              </div>
            </section>
          </KanbanBoard>
          <KanbanOverlay />
        </Kanban>
      </div>

      <Dialog open={editingBoard} onOpenChange={setEditingBoard}>
        {editingBoard ? (
          <DialogContent className="max-w-2xl rounded-xl border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6">
            <div className="flex items-center justify-between gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl">Editar quadro</DialogTitle>
              </DialogHeader>
              <Button type="button" onClick={() => setEditingBoard(false)} variant="outline" size="icon-lg" className="rounded-xl border-zinc-200 text-zinc-600">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <Label className="text-zinc-900">Nome</Label>
                <Input value={boardForm.data.nome} onChange={(e) => boardForm.setData('nome', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label className="text-zinc-900">Descrição</Label>
                <Textarea className="min-h-24" value={boardForm.data.descricao} onChange={(e) => boardForm.setData('descricao', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label className="text-zinc-900">Fundo</Label>
                <Select value={boardForm.data.background_style} onChange={(e) => boardForm.setData('background_style', e.target.value)}>
                  {backgroundOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" onClick={() => setEditingBoard(false)} variant="outline" className="h-10 w-auto rounded-xl border-zinc-200 bg-white px-4 text-zinc-900">
                Cancelar
              </Button>
              <Button type="button" onClick={saveBoard} className="h-10 w-auto gap-2 rounded-xl px-4">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={Boolean(activeCard)} onOpenChange={(open) => {
        if (!open) setActiveCard(null)
      }}>
        {activeCard ? (
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-xl border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-0">
            <div className="grid lg:grid-cols-[minmax(0,1.1fr)_360px]">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Input value={activeCard.titulo} onChange={(e) => updateActiveCard({ titulo: e.target.value })} className="h-14 rounded-lg border border-zinc-200 bg-white px-4 text-2xl font-semibold tracking-tight shadow-xs" />
                    <p className="mt-3 text-sm text-zinc-500">Neste cartão você organiza a tarefa, a lista em que ela está, a data limite, a urgência e os detalhes do trabalho.</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="grid gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Lista</span>
                        <Select value={activeCard.list_key} onChange={(e) => updateActiveCard({ list_key: e.target.value })} className="w-auto min-w-[180px] rounded-xl bg-zinc-50">
                          {boardLists.map((list) => <option key={list.key} value={list.key}>{list.title}</option>)}
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Data limite</span>
                        <Input type="date" value={activeCard.data_limite || ''} onChange={(e) => updateActiveCard({ data_limite: e.target.value })} className="w-auto min-w-[180px] rounded-xl bg-zinc-50" />
                      </div>
                      <div className="grid gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Urgência</span>
                        <Select value={activeCard.urgencia || 'media'} onChange={(e) => updateActiveCard({ urgencia: e.target.value })} className="w-auto min-w-[160px] rounded-xl bg-zinc-50">
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                          <option value="urgente">Urgente</option>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button type="button" onClick={() => updateActiveCard({ etiquetas: ensureLabel(activeCard) })} variant="outline" className="h-10 w-auto gap-2 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-50">
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                      <Button type="button" onClick={() => updateActiveCard({ data_limite: activeCard.data_limite || new Date().toISOString().slice(0, 10) })} variant="outline" className="h-10 w-auto gap-2 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-50">
                        <CalendarDays className="h-4 w-4" />
                        Datas
                      </Button>
                      <Button type="button" onClick={() => updateActiveCard({ checklist: ensureChecklist(activeCard) })} variant="outline" className="h-10 w-auto gap-2 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-50">
                        <CheckSquare className="h-4 w-4" />
                        Checklist
                      </Button>
                      <Button type="button" onClick={() => updateActiveCard({ anexos: ensureAttachment(activeCard) })} variant="outline" className="h-10 w-auto gap-2 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-50">
                        <Paperclip className="h-4 w-4" />
                        Anexo
                      </Button>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-zinc-700">Etiquetas</h4>
                      <div className="mt-3 flex flex-wrap items-start gap-3">
                        {(activeCard.etiquetas || []).map((etiqueta, index) => (
                          <div key={index} className="rounded-lg border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-3 shadow-xs">
                            <div className="flex items-center gap-2">
                              <input type="color" value={etiqueta.cor} onChange={(e) => updateActiveCard({ etiquetas: activeCard.etiquetas.map((item, itemIndex) => itemIndex === index ? { ...item, cor: e.target.value } : item) })} className="h-10 w-12 rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-1" />
                              <Input value={etiqueta.nome} onChange={(e) => updateActiveCard({ etiquetas: activeCard.etiquetas.map((item, itemIndex) => itemIndex === index ? { ...item, nome: e.target.value } : item) })} placeholder="Nome da etiqueta" className="min-w-[180px] rounded-xl" />
                              <Button type="button" onClick={() => updateActiveCard({ etiquetas: activeCard.etiquetas.filter((_, itemIndex) => itemIndex !== index) })} variant="outline" size="icon-lg" className="rounded-xl border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {etiqueta.nome ? (
                              <div className="mt-3">
                                <span className="inline-flex rounded-md px-3 py-1 text-sm font-medium text-zinc-900" style={{ backgroundColor: etiqueta.cor }}>
                                  {etiqueta.nome}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        ))}
                        {!activeCard.etiquetas?.length ? (
                          <Button type="button" onClick={() => updateActiveCard({ etiquetas: ensureLabel(activeCard) })} variant="outline" className="h-10 w-auto gap-2 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-50">
                            <Plus className="h-4 w-4" />
                            Adicionar etiqueta
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <Button type="button" onClick={() => setActiveCard(null)} variant="outline" size="icon-lg" className="rounded-xl border-zinc-200 text-zinc-600">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6 space-y-6">
                  <section>
                    <div className="flex items-center gap-3">
                      <ListTodo className="h-5 w-5 text-zinc-500" />
                      <h4 className="text-xl font-semibold text-zinc-800">Descrição</h4>
                    </div>
                    <div className="mt-3 rounded-lg border border-zinc-200 bg-gradient-to-t from-primary/5 to-card shadow-xs transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                      <Textarea className="min-h-32 resize-y border-0 shadow-none focus:ring-0" value={activeCard.descricao || ''} onChange={(e) => updateActiveCard({ descricao: e.target.value })} placeholder="Adicione uma descrição mais detalhada..." />
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-zinc-500" />
                      <h4 className="text-xl font-semibold text-zinc-800">Checklist</h4>
                    </div>
                    <div className="mt-3 space-y-3">
                      {(activeCard.checklist || []).map((item, index) => (
                        <label key={index} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <Checkbox checked={Boolean(item.done)} onCheckedChange={(checked) => updateActiveCard({ checklist: activeCard.checklist.map((check, checkIndex) => checkIndex === index ? { ...check, done: Boolean(checked) } : check) })} />
                          <Input value={item.titulo} onChange={(e) => updateActiveCard({ checklist: activeCard.checklist.map((check, checkIndex) => checkIndex === index ? { ...check, titulo: e.target.value } : check) })} className="border-0 bg-transparent px-0 shadow-none focus:border-0 focus:ring-0" placeholder="Item do checklist" />
                        </label>
                      ))}
                      <Button type="button" onClick={() => updateActiveCard({ checklist: ensureChecklist(activeCard) })} variant="outline" className="h-10 w-auto gap-2 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 hover:bg-zinc-50">
                        <Plus className="h-4 w-4" />
                        Adicionar checklist
                      </Button>
                    </div>
                  </section>
                </div>
              </div>

              <aside className={`${isDark ? 'border-l border-zinc-700 bg-zinc-900' : 'border-l border-zinc-200 bg-zinc-50/80'} p-6`}>
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <h4 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-800'}`}>Comentários e atividade</h4>
                    </div>
                    <div className={`mt-3 rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-400' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-400'}`}>
                      Escrever um comentário...
                    </div>
                  </section>

                  <section>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>Observações</h4>
                    <div className={`mt-3 rounded-lg border shadow-xs transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card'}`}>
                      <Textarea className="min-h-36 resize-y border-0 shadow-none focus:ring-0" value={activeCard.observacoes || ''} onChange={(e) => updateActiveCard({ observacoes: e.target.value })} placeholder="Anote contexto, decisões e próximos passos" />
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Anexos</h4>
                    <div className="mt-3 space-y-3">
                      {(activeCard.anexos || []).map((anexo, index) => (
                        <div key={index} className={`rounded-lg border p-3 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card'}`}>
                          <Input value={anexo.nome} onChange={(e) => updateActiveCard({ anexos: activeCard.anexos.map((item, itemIndex) => itemIndex === index ? { ...item, nome: e.target.value } : item) })} placeholder="Nome do anexo" />
                          <Input value={anexo.url} onChange={(e) => updateActiveCard({ anexos: activeCard.anexos.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item) })} placeholder="https://..." className="mt-2" />
                        </div>
                      ))}
                      {!activeCard.anexos?.length ? (
                        <Button type="button" onClick={() => updateActiveCard({ anexos: ensureAttachment(activeCard) })} variant="outline" className={`h-10 w-auto gap-2 rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-900'}`}>
                          <Link2 className="h-4 w-4" />
                          Adicionar anexo
                        </Button>
                      ) : null}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Ações</h4>
                    <div className="mt-3 grid gap-3">
                      {cardActionError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {cardActionError}
                        </div>
                      ) : null}
                      <Button type="button" onClick={saveActiveCard} className="h-11 w-auto gap-2 rounded-xl px-4 shadow-xs">
                        <Save className="h-4 w-4" />
                        Salvar cartão
                      </Button>
                      <Button type="button" onClick={() => deleteTask(activeCard.id, { closeModal: true })} variant="outline" className={`h-11 w-auto gap-2 rounded-xl px-4 ${isDark ? 'border-red-500/40 bg-zinc-950 text-red-400' : 'border-red-200 bg-white text-red-600'}`}>
                        <X className="h-4 w-4" />
                        Excluir cartão
                      </Button>
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </AppLayout>
  )
}
