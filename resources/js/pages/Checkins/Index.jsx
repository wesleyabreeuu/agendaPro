import React, { useMemo, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Textarea } from '@/components/ui'
import { Check, Flame, Pencil, Plus, Trash2 } from 'lucide-react'

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Nao foi possivel concluir a operacao.')
  }

  return payload
}

function HabitCard({ habit, onComplete, onEdit, onDelete, busy }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950">{habit.nome}</h3>
            {!habit.ativo ? <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-zinc-500">Inativo</span> : null}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{habit.descricao || 'Sem descricao.'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Streak atual</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{habit.estatisticas?.streak_atual || 0}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Maior streak</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{habit.estatisticas?.maior_streak || 0}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Ultimo registro</p>
          <p className="mt-2 text-sm font-medium text-zinc-950">{habit.ultimo_registro_em || '-'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${habit.concluido_hoje ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
          <Flame className="h-4 w-4" />
          {habit.concluido_hoje ? 'Concluido hoje' : 'Pendente hoje'}
        </div>

        <Button
          type="button"
          onClick={() => onComplete(habit.id)}
          disabled={busy || habit.concluido_hoje || !habit.ativo}
          className="w-auto rounded-xl px-4"
        >
          <Check className="mr-2 h-4 w-4" />
          Marcar hoje
        </Button>
      </div>
    </div>
  )
}

export default function CheckinsIndex({ today, habitos = [], historico = [] }) {
  const [items, setItems] = useState(habitos)
  const [activityLog, setActivityLog] = useState(historico)
  const [editingId, setEditingId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ nome: '', descricao: '', ativo: true })

  const summary = useMemo(() => ({
    total_habitos: items.length,
    concluidos_hoje: items.filter((item) => item.concluido_hoje).length,
    melhor_streak_atual: items.reduce((max, item) => Math.max(max, item.estatisticas?.streak_atual || 0), 0),
  }), [items])

  function resetForm() {
    setEditingId(null)
    setForm({ nome: '', descricao: '', ativo: true })
  }

  function startEdit(habit) {
    setEditingId(habit.id)
    setForm({
      nome: habit.nome,
      descricao: habit.descricao || '',
      ativo: Boolean(habit.ativo),
    })
  }

  async function submitForm(event) {
    event.preventDefault()
    setFeedback({ type: '', message: '' })

    try {
      const payload = await apiRequest(editingId ? `/api/habitos/${editingId}` : '/api/habitos', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })

      setItems((current) => {
        if (editingId) {
          return current.map((item) => (item.id === editingId ? payload.data : item))
        }

        return [...current, payload.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      })

      setFeedback({ type: 'success', message: editingId ? 'Habito atualizado.' : 'Habito criado.' })
      resetForm()
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  async function handleComplete(habitId) {
    setBusyId(habitId)
    setFeedback({ type: '', message: '' })

    try {
      const payload = await apiRequest(`/api/habitos/${habitId}/concluir`, {
        method: 'POST',
        body: JSON.stringify({}),
      })

      setItems((current) => current.map((item) => (item.id === habitId ? payload.data : item)))
      setActivityLog((current) => {
        const next = [
          {
            id: `new-${habitId}-${today}`,
            habito: payload.data.nome,
            data: new Intl.DateTimeFormat('pt-BR').format(new Date(`${today}T00:00:00`)),
            concluido_em: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
          },
          ...current,
        ]

        return next.slice(0, 14)
      })
      setFeedback({
        type: 'success',
        message: payload.meta?.duplicado ? 'Esse habito ja estava concluido hoje.' : 'Habito concluido no dia.',
      })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(habitId) {
    if (!window.confirm('Deseja remover este habito?')) {
      return
    }

    setFeedback({ type: '', message: '' })

    try {
      await apiRequest(`/api/habitos/${habitId}`, { method: 'DELETE' })
      setItems((current) => current.filter((item) => item.id !== habitId))
      setFeedback({ type: 'success', message: 'Habito removido.' })
      if (editingId === habitId) {
        resetForm()
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  return (
    <AppLayout title="Habitos">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Habitos ativos</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{summary.total_habitos}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Concluidos hoje</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{summary.concluidos_hoje}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Melhor streak atual</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{summary.melhor_streak_atual}</p>
          </div>
        </div>

        {feedback.message ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {feedback.message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-zinc-500" />
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{editingId ? 'Editar habito' : 'Novo habito'}</h2>
            </div>
            <form onSubmit={submitForm} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Nome</label>
                <Input value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} placeholder="Ex.: Leitura" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Descricao</label>
                <Textarea value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} className="min-h-28" placeholder="Opcional" />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-sm text-zinc-700">
                <input type="checkbox" checked={form.ativo} onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))} className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-200" />
                Habito ativo
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-xl">{editingId ? 'Salvar alteracoes' : 'Criar habito'}</Button>
                {editingId ? <Button type="button" variant="outline" className="rounded-xl" onClick={resetForm}>Cancelar</Button> : null}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {items.length ? items.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleComplete}
                onEdit={startEdit}
                onDelete={handleDelete}
                busy={busyId === habit.id}
              />
            )) : (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500 shadow-sm">
                Nenhum habito cadastrado ainda. Comece criando o primeiro na lateral.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Historico recente</h2>
            <p className="mt-1 text-sm text-zinc-500">Ultimos registros de conclusao dos seus habitos.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Habito</th>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Data</th>
                <th className="px-6 py-3 text-left font-medium text-zinc-500">Hora</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.length ? activityLog.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200">
                  <td className="px-6 py-3 text-zinc-950">{item.habito}</td>
                  <td className="px-6 py-3 text-zinc-600">{item.data}</td>
                  <td className="px-6 py-3 text-zinc-600">{item.concluido_em || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-zinc-500">Nenhuma conclusão registrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
