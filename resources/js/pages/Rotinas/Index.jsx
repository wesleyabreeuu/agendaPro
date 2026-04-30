import React from 'react'
import { Link, router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { Pencil, PauseCircle, PlayCircle, Trash2 } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Select } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  FREQUENCY_OPTIONS,
  categoryBadgeStyle,
  categoryLabel,
  difficultyBadgeClass,
  difficultyLabel,
  formatPercent,
  frequencyLabel,
  statusBadgeClass,
  statusLabel,
} from './support'

function SummaryCard({ title, value, helper, isDark = false }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
      {helper ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p> : null}
    </div>
  )
}

export default function RotinasIndex({ rotinas = [], filters, summary }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const filterForm = useForm({
    search: filters.search || '',
    categoria: filters.categoria || '',
    frequencia_tipo: filters.frequencia_tipo || '',
    dificuldade: filters.dificuldade || '',
    ativo: filters.ativo || '',
  })

  function submitFilters(event) {
    event.preventDefault()
    router.get('/rotinas/minhas', filterForm.data, { preserveState: true, preserveScroll: true })
  }

  function resetFilters() {
    filterForm.setData({
      search: '',
      categoria: '',
      frequencia_tipo: '',
      dificuldade: '',
      ativo: '',
    })
    router.get('/rotinas/minhas', {}, { preserveState: true, preserveScroll: true })
  }

  function toggleRotina(id) {
    router.patch(`/rotinas/${id}/toggle`, {}, { preserveScroll: true })
  }

  function destroyRotina(id) {
    if (!window.confirm('Deseja remover esta rotina?')) return
    router.delete(`/rotinas/${id}`, { preserveScroll: true })
  }

  return (
    <AppLayout title="Minhas Rotinas" chrome="dashboard">
      <div className="space-y-6">
        <div className={`rounded-xl border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Minhas rotinas</h1>
              <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Filtre suas rotinas por área da vida, dificuldade, frequência e status. O objetivo aqui é enxergar o sistema inteiro, não só o dia de hoje.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className={`h-11 w-auto rounded-xl px-4 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}>
                <Link href="/rotinas/hoje">Ver rotinas de hoje</Link>
              </Button>
              <Button asChild className="h-11 w-auto rounded-xl px-4 shadow-sm">
                <Link href="/rotinas/criar">Nova rotina</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total" value={summary.total} helper="Todas as rotinas cadastradas" isDark={isDark} />
          <SummaryCard title="Ativas" value={summary.ativas} helper="Em operação no seu sistema" isDark={isDark} />
          <SummaryCard title="Previstas hoje" value={summary.previstas_hoje} helper="Entram na tela de execução diária" isDark={isDark} />
          <SummaryCard title="Com modo mínimo" value={summary.com_modo_minimo} helper="Prontas para dias mais difíceis" isDark={isDark} />
        </div>

        <form onSubmit={submitFilters} className={`rounded-xl border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input placeholder="Buscar por nome" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
            <Select value={filterForm.data.categoria} onChange={(event) => filterForm.setData('categoria', event.target.value)}>
              <option value="">Todas as categorias</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
            <Select value={filterForm.data.frequencia_tipo} onChange={(event) => filterForm.setData('frequencia_tipo', event.target.value)}>
              <option value="">Todas as frequências</option>
              {FREQUENCY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
            <Select value={filterForm.data.dificuldade} onChange={(event) => filterForm.setData('dificuldade', event.target.value)}>
              <option value="">Todas as dificuldades</option>
              {DIFFICULTY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
            <Select value={filterForm.data.ativo} onChange={(event) => filterForm.setData('ativo', event.target.value)}>
              <option value="">Ativas e inativas</option>
              <option value="1">Ativas</option>
              <option value="0">Inativas</option>
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="h-10 w-auto rounded-xl px-4">Aplicar filtros</Button>
            <Button type="button" onClick={resetFilters} variant="outline" className={`h-10 w-auto rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}>Limpar</Button>
          </div>
        </form>

        <div className="space-y-4">
          {rotinas.map((rotina) => (
            <section key={rotina.id} className={`rounded-xl border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.nome}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium" style={categoryBadgeStyle(rotina.categoria, isDark)}>{categoryLabel(rotina.categoria)}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyBadgeClass(rotina.dificuldade, isDark)}`}>{difficultyLabel(rotina.dificuldade)}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(rotina.status_hoje, isDark)}`}>{statusLabel(rotina.status_hoje)} hoje</span>
                    {!rotina.ativo ? <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-400' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>Inativa</span> : null}
                  </div>
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{rotina.descricao || 'Sem descrição.'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="icon-lg" className={`rounded-xl ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                    <Link href={`/rotinas/${rotina.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button type="button" onClick={() => toggleRotina(rotina.id)} variant="outline" size="icon-lg" className={`rounded-xl ${rotina.ativo ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                    {rotina.ativo ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                  <Button type="button" onClick={() => destroyRotina(rotina.id)} variant="outline" size="icon-lg" className="rounded-xl border-red-200 bg-red-50 text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className={`rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Frequência</p>
                  <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{frequencyLabel(rotina)}</p>
                </div>
                <div className={`rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Horário</p>
                  <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.horario || 'Livre'}</p>
                </div>
                <div className={`rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Energia</p>
                  <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.energia_recomendada || 'Livre'}</p>
                </div>
                <div className={`rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Última execução</p>
                  <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.ultima_execucao_em || 'Sem histórico'}</p>
                </div>
                <div className={`rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Consistência 30d</p>
                  <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{formatPercent(rotina.consistencia_30_dias)}</p>
                </div>
              </div>

              {rotina.modo_minimo_ativo ? (
                <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                  <span className="font-medium">Modo mínimo:</span> {rotina.modo_minimo_descricao || 'Ativo, mas sem descrição.'}
                </div>
              ) : null}
            </section>
          ))}

          {!rotinas.length ? (
            <div className={`rounded-xl border border-dashed px-6 py-12 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
              Nenhuma rotina encontrada com os filtros atuais.
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
