import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  Dumbbell,
  Flag,
  HeartPulse,
  LineChart,
  ListChecks,
  ListTodo,
  LoaderCircle,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { Button } from '@/components/ui'
import TimelineItem from '../components/TimelineItem'
import { useTheme } from '../contexts/ThemeContext'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function formatNumber(value, suffix = '') {
  const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Number(value || 0))
  return suffix ? `${number} ${suffix}` : number
}

function summaryMessage(percentual) {
  if (percentual >= 80) return 'Você está perto de fechar o dia com consistência.'
  if (percentual >= 50) return 'Seu ritmo está bom. Continue eliminando os próximos itens.'
  if (percentual > 0) return 'O dia já começou. Foque em uma prioridade por vez.'
  return 'Escolha a primeira ação e comece com clareza.'
}

function sectionTitle(grupo) {
  return {
    tarefas_sem_horario: 'Tarefas sem horário',
    kanban_vencendo_hoje: 'Kanban vencendo hoje',
    rotinas_sem_horario: 'Rotinas sem horário',
  }[grupo] || 'Pendências'
}

function buildSummaryCards(resumo, objetivos, saude, financeiro) {
  const cards = resumo?.cards || {}

  return [
    {
      key: 'compromissos',
      label: 'Compromissos',
      value: cards.compromissos ?? resumo?.itens_por_tipo?.compromissos ?? 0,
      helper: 'agendados hoje',
      icon: CalendarDays,
    },
    {
      key: 'tarefas',
      label: 'Tarefas',
      value: cards.tarefas ?? resumo?.itens_por_tipo?.tarefas ?? 0,
      helper: 'pendentes',
      icon: ListTodo,
    },
    {
      key: 'rotinas',
      label: 'Rotinas',
      value: `${cards.rotinas?.executadas ?? 0}/${cards.rotinas?.total ?? 0}`,
      helper: 'executadas hoje',
      icon: ListChecks,
    },
    {
      key: 'objetivos',
      label: 'Objetivos',
      value: objetivos?.total_ativos ?? cards.objetivos ?? 0,
      helper: 'ativos',
      icon: Target,
    },
    {
      key: 'saude',
      label: 'Saúde',
      value: saude?.atividades_hoje ?? 0,
      helper: `${formatNumber(saude?.distancia_km_hoje, 'km')} hoje`,
      icon: HeartPulse,
    },
    {
      key: 'financeiro',
      label: 'Financeiro',
      value: formatCurrency(financeiro?.saldo_mes ?? cards.financeiro?.saldo_mes ?? 0),
      helper: 'saldo do mês',
      icon: Wallet,
    },
  ]
}

function shellClasses(isDark) {
  return isDark
    ? 'border-zinc-700 bg-zinc-900 text-zinc-50'
    : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-950'
}

function innerClasses(isDark) {
  return isDark
    ? 'border-zinc-700 bg-zinc-950'
    : 'border-zinc-200 bg-white'
}

export default function MeuDia({ initialData = null }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [actionLoading, setActionLoading] = useState('')
  const [plannerLoading, setPlannerLoading] = useState(false)
  const [planner, setPlanner] = useState(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (initialData) return

    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const response = await fetch('/api/meu-dia', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })

        if (!response.ok) throw new Error('Falha ao carregar o meu dia.')

        const payload = await response.json()
        if (!cancelled) setData(payload)
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [initialData])

  const timeline = data?.timeline || []
  const pendencias = data?.pendencias || []
  const resumo = data?.resumo || { total: 0, concluidos: 0, percentual: 0 }
  const prioridades = data?.prioridades || []
  const alertas = data?.alertas || []
  const progresso = data?.progresso || { percentual: resumo.percentual || 0, detalhes: {} }
  const objetivos = data?.objetivos || { total_ativos: 0, items: [] }
  const saude = data?.saude || {}
  const financeiro = data?.financeiro || {}
  const cabecalho = data?.cabecalho || {}
  const summaryCards = buildSummaryCards(resumo, objetivos, saude, financeiro)
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const nextActivity = useMemo(() => {
    const pendingItems = timeline.filter((item) => item.status !== 'concluido')
    const upcoming = pendingItems.find((item) => item.hora_inicio && item.hora_inicio >= currentTime)

    return upcoming || prioridades[0] || pendingItems[0] || timeline[0] || null
  }, [currentTime, prioridades, timeline])

  const pendenciasAgrupadas = useMemo(() => (
    pendencias.reduce((acc, item) => {
      const key = item.grupo || 'geral'
      acc[key] = [...(acc[key] || []), item]
      return acc
    }, {})
  ), [pendencias])

  async function refresh() {
    const response = await fetch('/api/meu-dia', {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })

    if (!response.ok) throw new Error('Falha ao atualizar o dia.')

    const payload = await response.json()
    setData(payload)
  }

  async function handleAction(item, action) {
    const loadingKey = `${item.tipo}-${item.origem_id}-${action}`
    setActionLoading(loadingKey)

    try {
      const response = await fetch('/api/meu-dia/action', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          tipo: item.tipo,
          origem_id: item.origem_id,
          acao: action,
        }),
      })

      if (!response.ok) throw new Error('Falha ao atualizar item do dia.')

      await refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading('')
    }
  }

  async function handlePlanDay() {
    setPlannerLoading(true)

    try {
      const response = await fetch('/api/meu-dia/planejar', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      })

      if (!response.ok) throw new Error('Falha ao planejar o dia.')

      setPlanner(await response.json())
    } catch (error) {
      console.error(error)
    } finally {
      setPlannerLoading(false)
    }
  }

  const renderActionItem = (item, extraKey = '') => (
    <TimelineItem
      key={`${extraKey}${item.tipo}-${item.origem_id}`}
      tipo={item.tipo}
      titulo={item.titulo}
      descricao={item.descricao || item.motivo}
      hora={item.hora_inicio}
      status={item.status}
      canComplete={Boolean(item.pode_concluir) && actionLoading === ''}
      canDelay={Boolean(item.pode_adiar) && actionLoading === ''}
      onComplete={item.pode_concluir ? () => handleAction(item, 'concluir') : null}
      onDelay={item.pode_adiar ? () => handleAction(item, 'adiar') : null}
      onOpen={item.origem_url ? () => router.visit(item.origem_url) : null}
    />
  )

  return (
    <AppLayout title="Meu Dia" chrome="dashboard">
      <div className="space-y-6">
        <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
          <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Centro de comando
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[40px]">
                {cabecalho.saudacao || 'Bom dia'}, {cabecalho.nome || 'vamos começar'}
              </h1>
              <p className={`mt-2 text-sm capitalize ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {cabecalho.data || 'Hoje'}.
              </p>

              <div className={`mt-4 rounded-lg border p-4 ${innerClasses(isDark)}`}>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Próxima ação</p>
                {nextActivity ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-semibold">{nextActivity.titulo}</span>
                    <span className={isDark ? 'text-zinc-600' : 'text-zinc-300'}>|</span>
                    <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{nextActivity.descricao || nextActivity.motivo || 'Sem descrição'}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                      <Clock3 className="h-3.5 w-3.5" />
                      {nextActivity.hora_inicio || 'Sem hora'}
                    </span>
                  </div>
                ) : (
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nenhuma atividade prevista para hoje.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handlePlanDay} disabled={plannerLoading} className={`h-11 w-auto gap-2 rounded-lg px-4 ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : ''}`}>
                {plannerLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Planejar Meu Dia
              </Button>
              <Button type="button" onClick={() => router.visit('/meu-dia?visao=dia')} variant="outline" className={`h-11 w-auto rounded-lg px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}>
                Leitura guiada
              </Button>
            </div>
          </div>
        </section>

        {planner?.agenda_sugerida?.length ? (
          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Agenda sugerida</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Planejamento do dia</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}>Preparado para IA</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {planner.agenda_sugerida.map((item) => (
                <div key={`${item.hora}-${item.atividade}`} className={`rounded-lg border p-4 ${innerClasses(isDark)}`}>
                  <p className="text-lg font-semibold">{item.hora}</p>
                  <p className="mt-1 text-sm font-medium">{item.atividade}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.descricao}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {summaryCards.map(({ key, label, value, helper, icon: Icon }) => (
            <div key={key} className={`rounded-xl border p-4 shadow-xs ${shellClasses(isDark)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p>
                </div>
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-700">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Prioridades</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Prioridades de hoje</h2>
              </div>
              <ClipboardCheck className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className="mt-4 space-y-2">
              {prioridades.length ? prioridades.map((item) => renderActionItem(item, 'prio-')) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nenhuma prioridade crítica para hoje.
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Progresso</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{progresso.percentual || 0}% do dia concluído</h2>
              </div>
              <LineChart className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className={`mt-5 h-2 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <div className={`h-2 rounded-full transition-all ${isDark ? 'bg-white' : 'bg-zinc-950'}`} style={{ width: `${Math.min(progresso.percentual || 0, 100)}%` }} />
            </div>
            <div className="mt-5 space-y-3">
              {Object.entries(progresso.detalhes || {}).map(([key, detail]) => (
                <div key={key} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${innerClasses(isDark)}`}>
                  <span className={`text-sm capitalize ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{key}</span>
                  <span className="text-lg font-semibold">{detail.concluidos}/{detail.total}</span>
                </div>
              ))}
            </div>
            <p className={`mt-5 text-sm leading-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{summaryMessage(progresso.percentual || 0)}</p>
          </section>
        </div>

        <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
          <div className="flex items-center justify-between gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-700">
            <div>
              <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Timeline</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Seu fluxo de hoje</h2>
            </div>
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-zinc-400" /> : null}
          </div>

          <div className="mt-4 space-y-2">
            {timeline.length ? timeline.map((item) => renderActionItem(item, 'time-')) : (
              <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                Nenhum item programado na timeline de hoje.
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Alertas</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Pendências importantes</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {alertas.length ? alertas.map((alerta) => (
                <div key={alerta.tipo} className={`rounded-lg border p-4 ${innerClasses(isDark)}`}>
                  <p className="font-semibold">{alerta.titulo}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{alerta.descricao}</p>
                </div>
              )) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nenhum alerta importante agora.
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center gap-3">
              <ListTodo className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Fora da timeline</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">O que ainda pede atenção</h2>
              </div>
            </div>
            <div className="mt-5 space-y-5">
              {Object.keys(pendenciasAgrupadas).length ? Object.entries(pendenciasAgrupadas).map(([grupo, items]) => (
                <div key={grupo} className={`rounded-lg border p-4 ${innerClasses(isDark)}`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{sectionTitle(grupo)}</h3>
                  <div className="mt-3 space-y-2">
                    {items.map((item) => renderActionItem(item, `${grupo}-`))}
                  </div>
                </div>
              )) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nenhuma pendência fora da timeline por enquanto.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Objetivos</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Em destaque</h2>
              </div>
              <Flag className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className="mt-5 space-y-3">
              {objetivos.items?.length ? objetivos.items.map((goal) => (
                <button key={goal.id} type="button" onClick={() => router.visit(goal.url)} className={`block w-full rounded-lg border p-4 text-left transition ${innerClasses(isDark)} ${isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{goal.nome}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{goal.proxima_acao}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-zinc-950'}`} style={{ width: `${goal.percentual}%` }} />
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {formatNumber(goal.progresso_atual)} / {formatNumber(goal.meta)} {goal.unidade}
                  </p>
                </button>
              )) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nenhum objetivo ativo em destaque.
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Saúde</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Resumo de hoje</h2>
              </div>
              <Dumbbell className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className="mt-5 grid gap-3">
              <Metric label="Distância" value={formatNumber(saude.distancia_km_hoje, 'km')} isDark={isDark} />
              <Metric label="Atividades" value={saude.atividades_hoje || 0} isDark={isDark} />
              <Metric label="Rotinas executadas" value={saude.rotinas_executadas_hoje || 0} isDark={isDark} />
              <Metric label="Calorias" value={saude.calorias_hoje || 0} isDark={isDark} />
            </div>
            <p className={`mt-4 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {saude.meta ? `Meta ativa: ${saude.meta.titulo}` : 'Nenhuma meta de saúde ativa configurada.'}
              {saude.strava_sincronizado ? ' Dados sincronizados com Strava hoje.' : ''}
            </p>
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Financeiro</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Fluxo do mês</h2>
              </div>
              <Banknote className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className="mt-5 grid gap-3">
              <Metric label="Receitas" value={formatCurrency(financeiro.receitas_mes)} isDark={isDark} />
              <Metric label="Despesas" value={formatCurrency(financeiro.despesas_mes)} isDark={isDark} />
              <Metric label="Saldo do mês" value={formatCurrency(financeiro.saldo_mes)} isDark={isDark} strong />
              <Metric label="Economia acumulada" value={formatCurrency(financeiro.economia_acumulada)} isDark={isDark} />
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}

function Metric({ label, value, isDark, strong = false }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${innerClasses(isDark)}`}>
      <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</span>
      <span className={`${strong ? 'text-lg' : 'text-base'} font-semibold`}>{value}</span>
    </div>
  )
}
