import React, { useMemo, useState } from 'react'
import { Link, router, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import {
  CalendarDays,
  CheckSquare,
  Link2,
  ListTodo,
  Paperclip,
  Plus,
  Save,
  SquarePen,
  X,
} from 'lucide-react'
import { Input, Select, Textarea } from '../../components/ui'

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

export default function KanbanShow({ board, lists = [], tarefas = {}, backgroundOptions = [], errors = {} }) {
  const [activeCard, setActiveCard] = useState(null)
  const [newListTitle, setNewListTitle] = useState('')
  const [editingBoard, setEditingBoard] = useState(false)

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

  function addList() {
    if (!newListTitle.trim()) return
    const key = newListTitle.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-')
    boardForm.setData('listas', [...boardLists, { key: `${key || 'lista'}-${Date.now()}`, title: newListTitle.trim() }])
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
    setActiveCard({ ...task })
  }

  function updateActiveCard(patch) {
    setActiveCard((current) => ({ ...current, ...patch }))
  }

  function saveActiveCard() {
    if (!activeCard) return
    router.put(`/kanban/tasks/${activeCard.id}`, sanitizeTask(activeCard), {
      preserveScroll: true,
      onSuccess: () => setActiveCard(null),
    })
  }

  function moveTask(taskId, listKey) {
    router.patch(`/kanban/tasks/${taskId}/status`, { list_key: listKey }, { preserveScroll: true })
  }

  return (
    <AppLayout title={board.nome}>
      <div className={`min-h-[calc(100vh-11rem)] rounded-[32px] border border-zinc-200 p-5 shadow-sm ${boardBackgrounds[board.background_style] || boardBackgrounds.paper}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-zinc-200 bg-white px-5 py-4 text-zinc-950 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{board.nome}</h2>
              <button type="button" onClick={() => setEditingBoard(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50">
                <SquarePen className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{board.descricao || 'Organize listas e cartões como em um quadro de trabalho visual.'}</p>
          </div>

          <Link href="/kanban" className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm">
            Voltar aos quadros
          </Link>
        </div>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {boardLists.map((list) => (
            <section key={list.key} className="flex w-[320px] shrink-0 flex-col rounded-[22px] bg-zinc-100/90 p-3 shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
                <h3 className="text-base font-semibold text-zinc-900">{list.title}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-zinc-600 shadow-sm">{(tarefas[list.key] || []).length}</span>
              </div>

              <div className="space-y-3">
                {(tarefas[list.key] || []).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => openCard(task)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {(task.etiquetas || []).slice(0, 3).map((etiqueta, index) => (
                        <span key={`${etiqueta.nome}-${index}`} className="rounded-md px-2 py-1 text-[11px] font-medium text-zinc-900" style={{ backgroundColor: etiqueta.cor }}>
                          {etiqueta.nome}
                        </span>
                      ))}
                    </div>

                    <h4 className="mt-3 text-[15px] font-medium leading-6 text-zinc-950">{task.titulo}</h4>
                    {task.descricao ? <p className="mt-2 line-clamp-3 text-sm leading-5 text-zinc-600">{task.descricao}</p> : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      {task.data_limite_label ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-red-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {task.data_limite_label}
                        </span>
                      ) : null}
                      {task.checklist_resumo?.total ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1">
                          <CheckSquare className="h-3.5 w-3.5" />
                          {task.checklist_resumo.concluidos}/{task.checklist_resumo.total}
                        </span>
                      ) : null}
                      {task.anexos?.length ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1">
                          <Paperclip className="h-3.5 w-3.5" />
                          {task.anexos.length}
                        </span>
                      ) : null}
                      <span className={`rounded-md px-2 py-1 capitalize ${urgencyTone(task.urgencia)}`}>{task.urgencia}</span>
                    </div>

                    <div className="mt-4 border-t border-zinc-100 pt-3">
                      <Select
                        value={task.list_key}
                        onChange={(e) => moveTask(task.id, e.target.value)}
                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 text-xs shadow-none"
                      >
                        {boardLists.map((option) => <option key={option.key} value={option.key}>{option.title}</option>)}
                      </Select>
                    </div>
                  </button>
                ))}
              </div>

              <form onSubmit={submitQuickTask} className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                <input type="hidden" value={list.key} onChange={() => {}} />
                <Input
                  value={taskForm.data.list_key === list.key ? taskForm.data.titulo : ''}
                  onChange={(e) => {
                    taskForm.setData('list_key', list.key)
                    taskForm.setData('titulo', e.target.value)
                  }}
                  placeholder="Adicionar um cartão"
                  className="border-0 bg-transparent px-0 shadow-none focus:border-0 focus:ring-0"
                />
                <button
                  type="submit"
                  onClick={() => taskForm.setData('list_key', list.key)}
                  className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar cartão
                </button>
              </form>
            </section>
          ))}

          <section className="w-[300px] shrink-0 rounded-[22px] border border-zinc-200 bg-zinc-50 p-4 text-zinc-950 shadow-sm">
            <h3 className="text-base font-semibold">Nova lista</h3>
            <p className="mt-1 text-sm text-zinc-500">Crie colunas como no Trello para separar o fluxo do quadro.</p>
            <div className="mt-4 space-y-3">
              <Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Nome da lista" />
              <button type="button" onClick={addList} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                <Plus className="h-4 w-4" />
                Criar lista
              </button>
              <button type="button" onClick={saveBoard} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
                <Save className="h-4 w-4" />
                Salvar quadro
              </button>
            </div>
          </section>
        </div>
      </div>

      {editingBoard ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950">Editar quadro</h3>
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

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingBoard(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
                Cancelar
              </button>
              <button type="button" onClick={saveBoard} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white">
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeCard ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-zinc-200 bg-white shadow-xl">
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
                          <input type="checkbox" checked={Boolean(item.done)} onChange={(e) => updateActiveCard({ checklist: activeCard.checklist.map((check, checkIndex) => checkIndex === index ? { ...check, done: e.target.checked } : check) })} className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-blue-100" />
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

              <aside className="border-l border-zinc-200 bg-zinc-50/80 p-6">
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xl font-semibold text-zinc-800">Comentários e atividade</h4>
                    </div>
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-400">
                      Escrever um comentário...
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Observações</h4>
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                      <Textarea className="min-h-36 resize-y border-0 shadow-none focus:ring-0" value={activeCard.observacoes || ''} onChange={(e) => updateActiveCard({ observacoes: e.target.value })} placeholder="Anote contexto, decisões e próximos passos" />
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Anexos</h4>
                    <div className="mt-3 space-y-3">
                      {(activeCard.anexos || []).map((anexo, index) => (
                        <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                          <Input value={anexo.nome} onChange={(e) => updateActiveCard({ anexos: activeCard.anexos.map((item, itemIndex) => itemIndex === index ? { ...item, nome: e.target.value } : item) })} placeholder="Nome do anexo" />
                          <Input value={anexo.url} onChange={(e) => updateActiveCard({ anexos: activeCard.anexos.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item) })} placeholder="https://..." className="mt-2" />
                        </div>
                      ))}
                      {!activeCard.anexos?.length ? (
                        <button type="button" onClick={() => updateActiveCard({ anexos: ensureAttachment(activeCard) })} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
                          <Link2 className="h-4 w-4" />
                          Adicionar anexo
                        </button>
                      ) : null}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Ações</h4>
                    <div className="mt-3 grid gap-3">
                      <button type="button" onClick={saveActiveCard} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                        <Save className="h-4 w-4" />
                        Salvar cartão
                      </button>
                      <button type="button" onClick={() => router.delete(`/kanban/tasks/${activeCard.id}`)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600">
                        <X className="h-4 w-4" />
                        Excluir cartão
                      </button>
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  )
}
