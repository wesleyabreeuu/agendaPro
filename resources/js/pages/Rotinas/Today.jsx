import React from 'react'
import { router } from '@inertiajs/react'
import { Check, CornerDownLeft, MinusCircle, Sparkles } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { useTheme } from '../../contexts/ThemeContext'
import {
  categoryBadgeStyle,
  categoryLabel,
  difficultyBadgeClass,
  difficultyLabel,
  formatPercent,
  statusBadgeClass,
  statusLabel,
} from './support'

function Metric({ title, value, helper, isDark = false }) {
  return (
    <div className={`rounded-[24px] border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
      {helper ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p> : null}
    </div>
  )
}

export default function RotinasToday({ summary, today, recentProgress = [] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  function sendAction(rotina, status, modoUsado = 'normal') {
    const payload = { status, modo_usado: modoUsado, data: today.data }

    if (status === 'pulada') {
      const observacao = window.prompt('Quer deixar uma observação rápida para essa rotina?', '')
      if (observacao) {
        payload.observacao = observacao
      }
    }

    router.post(`/rotinas/${rotina.id}/execucoes`, payload, { preserveScroll: true })
  }

  return (
    <AppLayout title="Rotinas de Hoje" chrome="dashboard">
      <div className="space-y-6">
        <section className={`rounded-[30px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Execução diária</p>
              <h1 className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Rotinas de hoje</h1>
              <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Feche o dia com consistência. Concluir no modo mínimo também conta e protege seu ritmo.</p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
              <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{today.data_formatada}</p>
              <p className={`mt-2 text-lg font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{formatPercent(summary.taxa_conclusao_hoje)} de execução</p>
            </div>
          </div>

          <div className={`mt-5 h-3 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <div className="h-3 rounded-full bg-zinc-950 transition-all" style={{ width: `${Math.min(Number(summary.taxa_conclusao_hoje || 0), 100)}%` }} />
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Metric title="Previstas hoje" value={today.total_previstas} helper="Tudo que entra no seu checklist de hoje" isDark={isDark} />
          <Metric title="Concluídas" value={today.concluidas} helper="Normal e modo mínimo contam" isDark={isDark} />
          <Metric title="Pendentes" value={today.pendentes} helper="Ainda abertas no dia" isDark={isDark} />
          <Metric title="Puladas" value={today.puladas} helper="Visíveis para revisão posterior" isDark={isDark} />
          <Metric title="Streak" value={summary.streak_atual} helper={`Maior sequência: ${summary.maior_streak}`} isDark={isDark} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {(today.items || []).map((rotina) => (
              <section key={rotina.id} className={`rounded-[28px] border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.nome}</h2>
                      <span className="rounded-full border px-2.5 py-1 text-xs font-medium" style={categoryBadgeStyle(rotina.categoria, isDark)}>{categoryLabel(rotina.categoria)}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyBadgeClass(rotina.dificuldade, isDark)}`}>{difficultyLabel(rotina.dificuldade)}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(rotina.status, isDark)}`}>{statusLabel(rotina.status)}{rotina.modo_usado === 'minimo' ? ' • mínimo' : ''}</span>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{rotina.descricao || 'Sem descrição'}{rotina.horario ? ` • horário sugerido ${rotina.horario}` : ''}</p>
                    {rotina.modo_minimo_ativo ? (
                      <p className={`mt-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        <span className="font-medium">Modo mínimo:</span> {rotina.modo_minimo_descricao || 'Ativo, mas sem descrição.'}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => sendAction(rotina, 'concluida', 'normal')}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Concluir
                  </button>
                  {rotina.modo_minimo_ativo ? (
                    <button
                      type="button"
                      onClick={() => sendAction(rotina, 'concluida', 'minimo')}
                      className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Modo mínimo
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => sendAction(rotina, 'pulada')}
                    className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium ${isDark ? 'border-amber-400/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
                  >
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Pular
                  </button>
                  {rotina.status !== 'pendente' ? (
                    <button
                      type="button"
                      onClick={() => sendAction(rotina, 'pendente')}
                      className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}
                    >
                      <CornerDownLeft className="mr-2 h-4 w-4" />
                      Reabrir
                    </button>
                  ) : null}
                </div>
              </section>
            ))}

            {!today.items?.length ? (
              <div className={`rounded-[28px] border border-dashed px-6 py-12 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                Nenhuma rotina prevista para hoje.
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Leitura rápida</h2>
              <div className="mt-4 space-y-3">
                {recentProgress.map((day) => (
                  <div key={day.data} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{day.label}</p>
                      <p className={`text-sm ${day.cumpriu_meta_dia ? 'text-emerald-600' : isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{formatPercent(day.taxa)}</p>
                    </div>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{day.concluidas} de {day.previstas} concluídas</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Regra de streak</h2>
              <p className={`mt-3 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>O dia conta para a sequência quando pelo menos 60% das rotinas previstas são concluídas, seja no modo normal ou no modo mínimo.</p>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
