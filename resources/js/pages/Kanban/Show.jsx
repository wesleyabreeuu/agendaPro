import React, { useMemo, useState } from 'react'
import { Link, router, useForm } from '@inertiajs/react'
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
import { Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Select, Textarea } from '@/components/ui'

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
    baixa: 'bg-slate-100 text-slate-700',
    media: 'bg-amber-100 text-amber-700',
    alta: 'bg-orange-100 text-orange-700',
  }[urgencia] || 'bg-rose-100 text-rose-700'
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

function reorderLists(lists, draggedKey, targetKey) {
  if (!draggedKey || !targetKey || draggedKey === targetKey) {
    return lists
  }

  const draggedIndex = lists.findIndex((list) => list.key === draggedKey)
  const targetIndex = lists.findIndex((list) => list.key === targetKey)

  if (draggedIndex === -1 || targetIndex === -1) {
    return lists
  }

  const nextLists = [...lists]
  const [draggedList] = nextLists.splice(draggedIndex, 1)
  nextLists.splice(targetIndex, 0, draggedList)

  return nextLists
}

export default function KanbanShow({ board, lists = [], tarefas = {}, backgroundOptions = [], errors = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeCard, setActiveCard] = useState(null)
  const [newListTitle, setNewListTitle] = useState('')
  const [editingBoard, setEditingBoard] = useState(false)
  const [draggedListKey, setDraggedListKey] = useState(null)
  const [dragOverListKey, setDragOverListKey] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverTaskListKey, setDragOverTaskListKey] = useState(null)
  const [cardActionError, setCardActionError] = useState('')

  const boardForm = useForm({
    nome: board.nome || '',
    descricao: board.descricao || '',
    background_style: board.background_style || 'violet',
    listas: board.listas || lists,
  })

  const taskForm = useForm(emptyTask(lists[0]?.key || ''))

  const boardLists = useMemo(() => boardForm.data.listas || lists, [boardForm.data.listas, lists])

  function saveBoard() {
    boardForm.put(`/kanban/boards/${board.id}`, { preserveScroll: true, onSuccess: () => setEditingBoard(false) })
  }

  function persistLists(nextLists) {
    boardForm.transform((data) => ({ ...data, listas: nextLists }))
    boardForm.put(`/kanban/boards/${board.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => setEditingBoard(false),
      onFinish: () => {
        boardForm.transform((data) => data)
        setDraggedListKey(null)
        setDragOverListKey(null)
      },
    })
  }

  function addList() {
    if (!newListTitle.trim()) return
    const key = newListTitle.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-')
    boardForm.setData('listas', [...boardLists, { key: `${key || 'lista'}-${Date.now()}`, title: newListTitle.trim() }])
    setNewListTitle('')
  }

  function handleListDragStart(listKey) {
    setDraggedListKey(listKey)
    setDragOverListKey(listKey)
  }

  function handleListDragEnter(targetKey) {
    if (!draggedListKey || draggedListKey === targetKey) {
      return
    }

    setDragOverListKey(targetKey)
    boardForm.setData('listas', reorderLists(boardLists, draggedListKey, targetKey))
  }

  function handleListDrop(targetKey) {
    const nextLists = reorderLists(boardLists, draggedListKey, targetKey)

    if (!draggedListKey || draggedListKey === targetKey) {
      setDraggedListKey(null)
      setDragOverListKey(null)
      return
    }

    boardForm.setData('listas', nextLists)
    persistLists(nextLists)
  }

  function handleListDragEnd() {
    setDraggedListKey(null)
    setDragOverListKey(null)
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

  function handleTaskDragStart(task) {
    setDraggedTask(task)
    setDragOverTaskListKey(task.list_key)
  }

  function handleTaskDragEnd() {
    setDraggedTask(null)
    setDragOverTaskListKey(null)
  }

  function handleTaskDrop(listKey) {
    if (!draggedTask) {
      return
    }

    const nextListKey = listKey || draggedTask.list_key

    if (draggedTask.list_key !== nextListKey) {
      moveTask(draggedTask.id, nextListKey)
    }

    setDraggedTask(null)
    setDragOverTaskListKey(null)
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

  return (
    <AppLayout title={board.nome} chrome="dashboard">
      <div className={`min-h-[calc(100vh-11rem)] rounded-[32px] border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950' : `${boardBackgrounds[board.background_style] || boardBackgrounds.paper} border-zinc-200`}`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-[24px] border px-5 py-4 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-50' : 'border-zinc-200 bg-white text-zinc-950'}`}>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{board.nome}</h2>
              <button type="button" onClick={() => setEditingBoard(true)} className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}>
                <SquarePen className="h-4 w-4" />
              </button>
            </div>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{board.descricao || 'Organize listas e cartões como em um quadro de trabalho visual.'}</p>
          </div>

          <Link href="/kanban" className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}>
            Voltar aos quadros
          </Link>
        </div>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {boardLists.map((list) => (
            <section
              key={list.key}
              onDragEnter={() => {
                if (draggedTask) {
                  setDragOverTaskListKey(list.key)
                  return
                }

                handleListDragEnter(list.key)
              }}
              onDragOver={(e) => {
                if (draggedTask || draggedListKey) {
                  e.preventDefault()
                }
              }}
              onDrop={() => {
                if (draggedTask) {
                  handleTaskDrop(list.key)
                  return
                }

                handleListDrop(list.key)
              }}
              className={`flex w-[320px] shrink-0 flex-col rounded-[22px] p-3 shadow-lg transition ${dragOverListKey === list.key || dragOverTaskListKey === list.key ? 'ring-2 ring-sky-300 ring-offset-2 ring-offset-transparent' : ''} ${isDark ? 'border border-zinc-700 bg-zinc-900' : 'bg-zinc-100/90'}`}
            >
              <div
                draggable
                onDragStart={() => handleListDragStart(list.key)}
                onDragEnd={handleListDragEnd}
                className="mb-3 flex cursor-grab items-center justify-between gap-3 px-2 pt-1 active:cursor-grabbing"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-zinc-200 bg-white text-zinc-400'}`}
                    title="Arraste para mover a lista"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <h3 className={`truncate text-base font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-900'}`}>{list.title}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs shadow-sm ${isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-600'}`}>{(tarefas[list.key] || []).length}</span>
              </div>

              <div className="space-y-3">
                {(tarefas[list.key] || []).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleTaskDragStart(task)}
                    onDragEnd={handleTaskDragEnd}
                    className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${draggedTask?.id === task.id ? 'opacity-60' : ''} ${isDark ? 'border-zinc-700 bg-zinc-800 hover:border-zinc-500' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => openCard(task)} className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap gap-1.5">
                          {(task.etiquetas || []).slice(0, 3).map((etiqueta, index) => (
                            <span key={`${etiqueta.nome}-${index}`} className={`rounded-md px-2 py-1 text-[11px] font-medium ${isDark ? 'text-slate-950' : 'text-zinc-900'}`} style={{ backgroundColor: etiqueta.cor }}>
                              {etiqueta.nome}
                            </span>
                          ))}
                        </div>

                        <h4 className={`mt-3 text-[15px] font-medium leading-6 ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{task.titulo}</h4>
                        {task.descricao ? <p className={`mt-2 line-clamp-3 text-sm leading-5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{task.descricao}</p> : null}

                        <div className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {task.data_limite_label ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-red-600">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {task.data_limite_label}
                            </span>
                          ) : null}
                          {task.checklist_resumo?.total ? (
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isDark ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-100'}`}>
                              <CheckSquare className="h-3.5 w-3.5" />
                              {task.checklist_resumo.concluidos}/{task.checklist_resumo.total}
                            </span>
                          ) : null}
                          {task.anexos?.length ? (
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isDark ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-100'}`}>
                              <Paperclip className="h-3.5 w-3.5" />
                              {task.anexos.length}
                            </span>
                          ) : null}
                          <span className={`rounded-md px-2 py-1 capitalize ${urgencyTone(task.urgencia)}`}>{task.urgencia}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${isDark ? 'border-red-500/40 bg-zinc-900 text-red-400 hover:bg-zinc-800' : 'border-red-200 bg-white text-red-600 hover:bg-red-50'}`}
                        title="Excluir cartão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className={`mt-4 border-t pt-3 ${isDark ? 'border-zinc-700' : 'border-zinc-100'}`}>
                      <Select
                        value={task.list_key}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          moveTask(task.id, e.target.value)
                        }}
                        className={`h-9 rounded-xl text-xs shadow-none ${isDark ? 'border-zinc-600 bg-zinc-700 text-zinc-100' : 'border-zinc-200 bg-zinc-50'}`}
                      >
                        {boardLists.map((option) => <option key={option.key} value={option.key}>{option.title}</option>)}
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={submitQuickTask} className={`mt-3 rounded-2xl border p-3 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                <input type="hidden" value={list.key} onChange={() => {}} />
                <Input
                  value={taskForm.data.list_key === list.key ? taskForm.data.titulo : ''}
                  onChange={(e) => {
                    taskForm.setData('list_key', list.key)
                    taskForm.setData('titulo', e.target.value)
                  }}
                  placeholder="Adicionar um cartão"
                  className={`border-0 bg-transparent px-0 shadow-none focus:border-0 focus:ring-0 ${isDark ? 'text-zinc-100 placeholder:text-zinc-400' : 'text-zinc-950 placeholder:text-zinc-500'}`}
                />
                <button
                  type="submit"
                  onClick={() => taskForm.setData('list_key', list.key)}
                  className={`mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'}`}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar cartão
                </button>
              </form>
            </section>
          ))}

          <section className={`w-[300px] shrink-0 rounded-[22px] border p-4 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-zinc-50 text-zinc-950'}`}>
            <h3 className="text-base font-semibold">Nova lista</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crie colunas como no Trello para separar o fluxo do quadro.</p>
            <div className="mt-4 space-y-3">
              <Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Nome da lista" />
              <button type="button" onClick={addList} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                <Plus className="h-4 w-4" />
                Criar lista
              </button>
              <button type="button" onClick={saveBoard} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
                <Save className="h-4 w-4" />
                Salvar quadro
              </button>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={editingBoard} onOpenChange={setEditingBoard}>
        {editingBoard ? (
          <DialogContent className="max-w-2xl rounded-[28px] border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl">Editar quadro</DialogTitle>
              </DialogHeader>
              <button type="button" onClick={() => setEditingBoard(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">Nome</label>
                <Input value={boardForm.data.nome} onChange={(e) => boardForm.setData('nome', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">Descrição</label>
                <Textarea className="min-h-24" value={boardForm.data.descricao} onChange={(e) => boardForm.setData('descricao', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">Fundo</label>
                <Select value={boardForm.data.background_style} onChange={(e) => boardForm.setData('background_style', e.target.value)}>
                  {backgroundOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button type="button" onClick={() => setEditingBoard(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
                Cancelar
              </button>
              <button type="button" onClick={saveBoard} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white">
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={Boolean(activeCard)} onOpenChange={(open) => {
        if (!open) setActiveCard(null)
      }}>
        {activeCard ? (
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-[28px] border-zinc-200 bg-white p-0">
            <div className="grid lg:grid-cols-[minmax(0,1.1fr)_360px]">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Input value={activeCard.titulo} onChange={(e) => updateActiveCard({ titulo: e.target.value })} className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-2xl font-semibold tracking-tight shadow-sm" />
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
                      <button type="button" onClick={() => updateActiveCard({ etiquetas: ensureLabel(activeCard) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </button>
                      <button type="button" onClick={() => updateActiveCard({ data_limite: activeCard.data_limite || new Date().toISOString().slice(0, 10) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                        <CalendarDays className="h-4 w-4" />
                        Datas
                      </button>
                      <button type="button" onClick={() => updateActiveCard({ checklist: ensureChecklist(activeCard) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                        <CheckSquare className="h-4 w-4" />
                        Checklist
                      </button>
                      <button type="button" onClick={() => updateActiveCard({ anexos: ensureAttachment(activeCard) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                        <Paperclip className="h-4 w-4" />
                        Anexo
                      </button>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-zinc-700">Etiquetas</h4>
                      <div className="mt-3 flex flex-wrap items-start gap-3">
                        {(activeCard.etiquetas || []).map((etiqueta, index) => (
                          <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <input type="color" value={etiqueta.cor} onChange={(e) => updateActiveCard({ etiquetas: activeCard.etiquetas.map((item, itemIndex) => itemIndex === index ? { ...item, cor: e.target.value } : item) })} className="h-10 w-12 rounded-xl border border-zinc-200 bg-white p-1" />
                              <Input value={etiqueta.nome} onChange={(e) => updateActiveCard({ etiquetas: activeCard.etiquetas.map((item, itemIndex) => itemIndex === index ? { ...item, nome: e.target.value } : item) })} placeholder="Nome da etiqueta" className="min-w-[180px] rounded-xl" />
                              <button type="button" onClick={() => updateActiveCard({ etiquetas: activeCard.etiquetas.filter((_, itemIndex) => itemIndex !== index) })} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50">
                                <X className="h-4 w-4" />
                              </button>
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
                          <button type="button" onClick={() => updateActiveCard({ etiquetas: ensureLabel(activeCard) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                            <Plus className="h-4 w-4" />
                            Adicionar etiqueta
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setActiveCard(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  <section>
                    <div className="flex items-center gap-3">
                      <ListTodo className="h-5 w-5 text-zinc-500" />
                      <h4 className="text-xl font-semibold text-zinc-800">Descrição</h4>
                    </div>
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
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
                        <label key={index} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <Checkbox checked={Boolean(item.done)} onCheckedChange={(checked) => updateActiveCard({ checklist: activeCard.checklist.map((check, checkIndex) => checkIndex === index ? { ...check, done: Boolean(checked) } : check) })} />
                          <Input value={item.titulo} onChange={(e) => updateActiveCard({ checklist: activeCard.checklist.map((check, checkIndex) => checkIndex === index ? { ...check, titulo: e.target.value } : check) })} className="border-0 bg-transparent px-0 shadow-none focus:border-0 focus:ring-0" placeholder="Item do checklist" />
                        </label>
                      ))}
                      <button type="button" onClick={() => updateActiveCard({ checklist: ensureChecklist(activeCard) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                        <Plus className="h-4 w-4" />
                        Adicionar checklist
                      </button>
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
                    <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-400' : 'border-zinc-200 bg-white text-zinc-400'}`}>
                      Escrever um comentário...
                    </div>
                  </section>

                  <section>
                    <h4 className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>Observações</h4>
                    <div className={`mt-3 rounded-2xl border shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                      <Textarea className="min-h-36 resize-y border-0 shadow-none focus:ring-0" value={activeCard.observacoes || ''} onChange={(e) => updateActiveCard({ observacoes: e.target.value })} placeholder="Anote contexto, decisões e próximos passos" />
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Anexos</h4>
                    <div className="mt-3 space-y-3">
                      {(activeCard.anexos || []).map((anexo, index) => (
                        <div key={index} className={`rounded-2xl border p-3 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                          <Input value={anexo.nome} onChange={(e) => updateActiveCard({ anexos: activeCard.anexos.map((item, itemIndex) => itemIndex === index ? { ...item, nome: e.target.value } : item) })} placeholder="Nome do anexo" />
                          <Input value={anexo.url} onChange={(e) => updateActiveCard({ anexos: activeCard.anexos.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item) })} placeholder="https://..." className="mt-2" />
                        </div>
                      ))}
                      {!activeCard.anexos?.length ? (
                        <button type="button" onClick={() => updateActiveCard({ anexos: ensureAttachment(activeCard) })} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
                          <Link2 className="h-4 w-4" />
                          Adicionar anexo
                        </button>
                      ) : null}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Ações</h4>
                    <div className="mt-3 grid gap-3">
                      {cardActionError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {cardActionError}
                        </div>
                      ) : null}
                      <button type="button" onClick={saveActiveCard} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                        <Save className="h-4 w-4" />
                        Salvar cartão
                      </button>
                      <button type="button" onClick={() => deleteTask(activeCard.id, { closeModal: true })} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium ${isDark ? 'border-red-500/40 bg-zinc-950 text-red-400' : 'border-red-200 bg-white text-red-600'}`}>
                        <X className="h-4 w-4" />
                        Excluir cartão
                      </button>
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
