import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  Dumbbell,
  Eye,
  EyeOff,
  Flag,
  Gauge,
  HeartPulse,
  LineChart,
  ListChecks,
  ListTodo,
  LoaderCircle,
  Sparkles,
  Target,
  TimerReset,
  Wallet,
  Zap,
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
  const [plannerApplyLoading, setPlannerApplyLoading] = useState(false)
  const [planner, setPlanner] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const [focusMode, setFocusMode] = useState(() => window.localStorage.getItem('meu-dia-focus-mode') === '1')
  const [checkinOpen, setCheckinOpen] = useState(false)

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

  useEffect(() => {
    window.localStorage.setItem('meu-dia-focus-mode', focusMode ? '1' : '0')
  }, [focusMode])

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
  const hero = data?.hero || { frases: [] }
  const nextBestAction = data?.proxima_melhor_acao || null
  const tempoDisponivel = data?.tempo_disponivel || { texto: 'Você possui 0min livres hoje.', blocos: [] }
  const scoreDia = data?.score_dia || { valor: 0, evolucao: 'estavel', componentes: {} }
  const radarVida = data?.radar_vida || { indicadores: [] }
  const objetivosEmRisco = data?.objetivos_em_risco || []
  const centroDecisoes = data?.centro_decisoes || []
  const checkinManha = data?.checkin_manha || { feito: true }
  const summaryCards = buildSummaryCards(resumo, objetivos, saude, financeiro)
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  useEffect(() => {
    if (loading || !data) return
    setCheckinOpen(!checkinManha.feito)
  }, [checkinManha.feito, data, loading])

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

  async function handleApplyPlan() {
    setPlannerApplyLoading(true)

    try {
      const response = await fetch('/api/meu-dia/planejar/aplicar', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      })

      if (!response.ok) throw new Error('Falha ao aplicar o planejamento.')

      setPlanner(await response.json().then((payload) => payload.planejamento || planner))
      await refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setPlannerApplyLoading(false)
    }
  }

  async function handleCheckin(option) {
    try {
      const response = await fetch('/api/meu-dia/checkin', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify(option),
      })

      if (!response.ok) throw new Error('Falha ao salvar check-in.')

      setCheckinOpen(false)
      await refresh()
    } catch (error) {
      console.error(error)
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
        {checkinOpen ? (
          <MorningCheckinModal isDark={isDark} onSelect={handleCheckin} />
        ) : null}

        <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                <Brain className="h-3.5 w-3.5" />
                Assistente executivo pessoal
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[40px]">
                {cabecalho.saudacao || 'Bom dia'}, {cabecalho.nome || 'vamos começar'}
              </h1>
              <p className={`mt-2 text-sm capitalize ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {cabecalho.data || 'Hoje'}.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {hero.frases?.map((item) => (
                  <div key={item.label} className={`rounded-lg border px-4 py-3 ${innerClasses(isDark)}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
                      <span className="text-xl font-semibold">{item.valor}</span>
                    </div>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border p-5 ${innerClasses(isDark)}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>O mais importante hoje</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{nextBestAction?.titulo || nextActivity?.titulo || 'Definir primeira ação'}</h2>
                </div>
                <Target className={`h-6 w-6 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Metric label="Impacta" value={nextBestAction?.impacto || 'Clareza'} isDark={isDark} />
                <Metric label="Tempo estimado" value={nextBestAction?.tempo_estimado || '10 minutos'} isDark={isDark} />
              </div>
              <p className={`mt-4 text-sm leading-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {nextBestAction?.motivo || 'Escolha uma ação concreta para começar o dia com direção.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" onClick={() => nextBestAction?.origem_url ? router.visit(nextBestAction.origem_url) : null} className={`h-11 w-auto gap-2 rounded-lg px-4 ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : ''}`}>
                  <Zap className="h-4 w-4" />
                  Iniciar
                </Button>
                <Button type="button" onClick={handlePlanDay} disabled={plannerLoading} variant="outline" className={`h-11 w-auto gap-2 rounded-lg px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}>
                  {plannerLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Organizar Meu Dia
                </Button>
                <Button type="button" onClick={() => setFocusMode((value) => !value)} variant="outline" className={`h-11 w-auto gap-2 rounded-lg px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}>
                  {focusMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {focusMode ? 'Sair do Modo Foco' : 'Entrar em Modo Foco'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {planner?.agenda_sugerida?.length ? (
          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Agenda sugerida</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{planner.titulo || 'Plano recomendado para hoje'}</h2>
              </div>
              <Button type="button" onClick={handleApplyPlan} disabled={plannerApplyLoading} className={`h-10 w-auto gap-2 rounded-lg px-4 ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : ''}`}>
                {plannerApplyLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Aplicar Planejamento
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="Tempo estimado total" value={planner.tempo_estimado_total || '0min'} isDark={isDark} strong />
              <Metric label="Quantidade de tarefas" value={planner.quantidade_tarefas || planner.agenda_sugerida.length} isDark={isDark} />
              <Metric label="Impacto nos objetivos" value={(planner.impacto_objetivos || []).join(', ') || 'Clareza'} isDark={isDark} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {planner.agenda_sugerida.map((item) => (
                <div key={`${item.hora}-${item.atividade}`} className={`rounded-lg border p-4 ${innerClasses(isDark)}`}>
                  <p className="text-lg font-semibold">{item.hora}</p>
                  <p className="mt-1 text-sm font-medium">{item.atividade}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.descricao}</p>
                  <p className={`mt-3 inline-flex rounded-lg border px-2.5 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}>{item.impacto || 'Produtividade'}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {focusMode ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
              <div className="flex items-center justify-between gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Agenda de hoje</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Fluxo essencial</h2>
                </div>
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-zinc-400" /> : <Clock3 className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />}
              </div>
              <div className="mt-4 space-y-2">
                {timeline.length ? timeline.map((item) => renderActionItem(item, 'focus-time-')) : (
                  <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                    Nenhum item programado na timeline de hoje.
                  </div>
                )}
              </div>
            </section>

            <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
              <div className="flex items-center justify-between gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Top 3 prioridades</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Execute nesta ordem</h2>
                </div>
                <ClipboardCheck className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
              </div>
              <div className="mt-4 space-y-2">
                {prioridades.length ? prioridades.slice(0, 3).map((item) => renderActionItem(item, 'focus-prio-')) : (
                  <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                    Nenhuma prioridade crítica para hoje.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <>
        <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          {summaryCards.map(({ key, label, value, helper, icon: Icon }) => (
            <div key={key} className={`min-w-0 rounded-xl border p-4 shadow-xs ${shellClasses(isDark)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`break-words text-xs uppercase tracking-[0.12em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
                  <p className={`mt-1 break-words text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p>
                </div>
                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'}`}>
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
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Score do Dia</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{scoreDia.valor || 0} / 100</h2>
              </div>
              <Gauge className={`h-6 w-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className={`mt-5 h-2 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <div className={`h-2 rounded-full transition-all ${isDark ? 'bg-white' : 'bg-zinc-950'}`} style={{ width: `${Math.min(scoreDia.valor || 0, 100)}%` }} />
            </div>
            <p className={`mt-4 text-sm capitalize ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Evolução: {scoreDia.evolucao || 'estável'}</p>
            <div className="mt-4 grid gap-2">
              {Object.entries(scoreDia.componentes || {}).map(([key, value]) => (
                <Metric key={key} label={key.replaceAll('_', ' ')} value={`${value}%`} isDark={isDark} />
              ))}
            </div>
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Radar da Vida</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{radarVida.score_geral || 0}% geral</h2>
              </div>
              <Sparkles className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <RadarChart indicators={radarVida.indicadores || []} isDark={isDark} />
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Tempo Disponível Hoje</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tempoDisponivel.texto}</h2>
              </div>
              <TimerReset className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            </div>
            <div className="mt-5 space-y-2">
              {tempoDisponivel.blocos?.length ? tempoDisponivel.blocos.slice(0, 4).map((block) => (
                <div key={`${block.inicio}-${block.fim}`} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${innerClasses(isDark)}`}>
                  <span className="text-sm font-medium">{block.inicio} às {block.fim}</span>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{block.duracao_minutos}min</span>
                </div>
              )) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nenhum bloco livre relevante encontrado.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Objetivos em risco</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Precisam de tração</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {objetivosEmRisco.length ? objetivosEmRisco.map((goal) => (
                <button key={goal.id} type="button" onClick={() => router.visit(goal.url)} className={`block w-full rounded-lg border p-4 text-left transition ${innerClasses(isDark)} ${isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{goal.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatNumber(goal.progresso_atual)} / {formatNumber(goal.meta)} {goal.unidade}</p>
                    </div>
                    <span className={`rounded-lg border px-2.5 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}>Atrasado {goal.atraso_percentual}%</span>
                  </div>
                  <p className={`mt-3 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Próxima ação: {goal.proxima_acao}</p>
                </button>
              )) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nenhum objetivo em risco agora.
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-xl border p-5 shadow-xs sm:p-6 ${shellClasses(isDark)}`}>
            <div className="flex items-center gap-3">
              <Brain className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <div>
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>O que merece atenção hoje</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Centro de decisões</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {centroDecisoes.length ? centroDecisoes.map((item) => (
                <div key={`${item.tipo}-${item.titulo}`} className={`rounded-lg border p-4 ${innerClasses(isDark)}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 ${item.severidade === 'alta' ? 'text-amber-500' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    <div>
                      <p className="font-semibold">{item.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.descricao}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className={`rounded-lg border border-dashed px-5 py-10 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                  Nada crítico pedindo decisão imediata.
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
          </>
        )}
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

function RadarChart({ indicators, isDark }) {
  const size = 230
  const center = size / 2
  const maxRadius = 78
  const safeIndicators = indicators.length ? indicators : [
    { nome: 'Saúde', valor: 0 },
    { nome: 'Financeiro', valor: 0 },
    { nome: 'Objetivos', valor: 0 },
    { nome: 'Rotinas', valor: 0 },
    { nome: 'Produtividade', valor: 0 },
  ]

  const pointFor = (index, value = 100, radius = maxRadius) => {
    const angle = ((Math.PI * 2) / safeIndicators.length) * index - Math.PI / 2
    const distance = radius * (value / 100)

    return [
      center + Math.cos(angle) * distance,
      center + Math.sin(angle) * distance,
    ]
  }

  const polygon = safeIndicators
    .map((item, index) => pointFor(index, item.valor).join(','))
    .join(' ')

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-56 w-full max-w-64">
        {[25, 50, 75, 100].map((value) => (
          <polygon
            key={value}
            points={safeIndicators.map((_, index) => pointFor(index, 100, maxRadius * (value / 100)).join(',')).join(' ')}
            fill="none"
            stroke={isDark ? '#3f3f46' : '#e4e4e7'}
            strokeWidth="1"
          />
        ))}
        {safeIndicators.map((item, index) => {
          const [x, y] = pointFor(index, 112)
          const [lineX, lineY] = pointFor(index, 100)

          return (
            <g key={item.nome}>
              <line x1={center} y1={center} x2={lineX} y2={lineY} stroke={isDark ? '#3f3f46' : '#e4e4e7'} strokeWidth="1" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={isDark ? 'fill-zinc-400 text-[10px]' : 'fill-zinc-500 text-[10px]'}>
                {item.nome}
              </text>
            </g>
          )
        })}
        <polygon points={polygon} fill={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(24,24,27,0.14)'} stroke={isDark ? '#fff' : '#18181b'} strokeWidth="2" />
      </svg>
      <div className="mt-3 grid gap-2">
        {safeIndicators.map((item) => (
          <Metric key={item.nome} label={item.nome} value={`${item.valor}%`} isDark={isDark} />
        ))}
      </div>
    </div>
  )
}

function MorningCheckinModal({ isDark, onSelect }) {
  const options = [
    { label: 'Excelente', icon: '😀', humor: 5, energia: 5 },
    { label: 'Bem', icon: '🙂', humor: 4, energia: 4 },
    { label: 'Normal', icon: '😐', humor: 3, energia: 3 },
    { label: 'Cansado', icon: '😞', humor: 2, energia: 2 },
    { label: 'Exausto', icon: '😫', humor: 1, energia: 1 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-xl border p-6 shadow-xl ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-50' : 'border-zinc-200 bg-white text-zinc-950'}`}>
        <div className="flex items-start gap-3">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
            <HeartPulse className="h-5 w-5" />
          </span>
          <div>
            <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Check-in matinal</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Como você está hoje?</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onSelect({ humor: option.humor, energia: option.energia, produtividade: option.energia })}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${innerClasses(isDark)} ${isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
