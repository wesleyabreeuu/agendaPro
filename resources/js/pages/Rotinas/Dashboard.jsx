import React from 'react'
import { Link } from '@inertiajs/react'
import { ArrowRight, CalendarDays, Flame, ListChecks, Sparkles, Target } from 'lucide-react'
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

function Panel({ title, subtitle, action = null, children, isDark = false }) {
  return (
    <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{title}</h2>
          {subtitle ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function MetricCard({ title, value, helper, icon: Icon, isDark = false }) {
  return (
    <div className={`rounded-[26px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
          <p className={`mt-3 text-4xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
          {helper ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default function RotinasDashboard({ summary, today, recentProgress = [], categoryBreakdown = [], templatesCount = 0 }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <AppLayout title="Rotinas" chrome="dashboard">
      <div className="space-y-6">
        <section className={`rounded-[30px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm uppercase tracking-[0.22em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Módulo Rotinas</p>
              <h1 className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Constância visível no seu dia</h1>
              <p className={`mt-2 max-w-2xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Organize hábitos, checklists diários e modo mínimo em um fluxo só. O dia conta quando você mantém presença, mesmo nas semanas difíceis.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/rotinas/hoje" className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                Abrir rotinas de hoje
              </Link>
              <Link href="/rotinas/templates" className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}>
                Ver templates
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Rotinas ativas" value={summary.ativas} helper={`${templatesCount} templates prontos disponíveis`} icon={ListChecks} isDark={isDark} />
          <MetricCard title="Conclusão hoje" value={formatPercent(summary.taxa_conclusao_hoje)} helper={`${summary.concluidas_hoje} concluídas • ${summary.pendentes_hoje} pendentes`} icon={Target} isDark={isDark} />
          <MetricCard title="Taxa semanal" value={formatPercent(summary.taxa_semanal)} helper={`Modo mínimo usado ${summary.modo_minimo_hoje} vez(es) hoje`} icon={CalendarDays} isDark={isDark} />
          <MetricCard title="Streak atual" value={summary.streak_atual} helper={`Maior sequência: ${summary.maior_streak} dias`} icon={Flame} isDark={isDark} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            title="Execução de hoje"
            subtitle="O que está previsto para hoje e como o dia está avançando."
            action={<Link href="/rotinas/hoje" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>Ir para execução <ArrowRight className="h-3.5 w-3.5" /></Link>}
            isDark={isDark}
          >
            <div className={`rounded-3xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{today.data_formatada}</p>
                  <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{today.concluidas} de {today.total_previstas} concluídas</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 text-right ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Modo mínimo</p>
                  <p className={`mt-2 text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{today.modo_minimo}</p>
                </div>
              </div>
              <div className={`mt-4 h-3 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <div className="h-3 rounded-full bg-zinc-950 transition-all" style={{ width: `${Math.min(Number(summary.taxa_conclusao_hoje || 0), 100)}%` }} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(today.items || []).slice(0, 5).map((item) => (
                <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.nome}</p>
                        <span className="rounded-full border px-2.5 py-1 text-xs font-medium" style={categoryBadgeStyle(item.categoria, isDark)}>{categoryLabel(item.categoria)}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyBadgeClass(item.dificuldade, isDark)}`}>{difficultyLabel(item.dificuldade)}</span>
                      </div>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.descricao || 'Sem descrição'}{item.horario ? ` • ${item.horario}` : ''}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(item.status, isDark)}`}>{statusLabel(item.status)}{item.modo_usado === 'minimo' ? ' • mínimo' : ''}</span>
                  </div>
                </div>
              ))}
              {!today.items?.length ? (
                <div className={`rounded-2xl border border-dashed px-4 py-8 text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>Nenhuma rotina prevista para hoje.</div>
              ) : null}
            </div>
          </Panel>

          <Panel title="Progresso recente" subtitle="Leitura dos últimos dias para enxergar constância." isDark={isDark}>
            <div className="space-y-3">
              {recentProgress.map((day) => (
                <div key={day.data} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{day.label}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{day.concluidas} de {day.previstas} concluídas</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${day.cumpriu_meta_dia ? 'text-emerald-600' : isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{formatPercent(day.taxa)}</p>
                      <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{day.cumpriu_meta_dia ? 'dia validado' : 'abaixo da meta'}</p>
                    </div>
                  </div>
                  <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className={`h-2 rounded-full ${day.cumpriu_meta_dia ? 'bg-emerald-500' : 'bg-zinc-900'}`} style={{ width: `${Math.min(Number(day.taxa || 0), 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Áreas da vida" subtitle="Distribuição das rotinas ativas e previstas hoje." isDark={isDark}>
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.categoria} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium" style={categoryBadgeStyle(item.categoria, isDark)}>{categoryLabel(item.categoria)}</span>
                    <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.ativas} ativas</p>
                  </div>
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.previstas_hoje} previstas hoje • {item.concluidas_hoje} concluídas</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Atalhos rápidos" subtitle="Ações úteis para ajustar seu sistema sem perder ritmo." isDark={isDark}>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/rotinas/minhas" className={`rounded-3xl border p-5 shadow-sm transition ${isDark ? 'border-zinc-700 bg-zinc-950 hover:bg-zinc-900' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>
                <ListChecks className={`h-5 w-5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
                <p className={`mt-4 text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Minhas rotinas</p>
                <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Filtre, edite, ative ou pause rotinas existentes.</p>
              </Link>

              <Link href="/rotinas/criar" className={`rounded-3xl border p-5 shadow-sm transition ${isDark ? 'border-zinc-700 bg-zinc-950 hover:bg-zinc-900' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>
                <Sparkles className={`h-5 w-5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
                <p className={`mt-4 text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Nova rotina</p>
                <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crie uma rotina com frequência, energia e modo mínimo.</p>
              </Link>

              <Link href="/rotinas/historico" className={`rounded-3xl border p-5 shadow-sm transition ${isDark ? 'border-zinc-700 bg-zinc-950 hover:bg-zinc-900' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>
                <CalendarDays className={`h-5 w-5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
                <p className={`mt-4 text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Histórico</p>
                <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Veja o que foi feito, pulado e quando entrou modo mínimo.</p>
              </Link>

              <Link href="/rotinas/templates" className={`rounded-3xl border p-5 shadow-sm transition ${isDark ? 'border-zinc-700 bg-zinc-950 hover:bg-zinc-900' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>
                <Target className={`h-5 w-5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
                <p className={`mt-4 text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Templates</p>
                <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Aplique estruturas prontas para manhã, saúde, foco e espiritualidade.</p>
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  )
}
