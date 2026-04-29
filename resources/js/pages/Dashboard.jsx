import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import AppLayout from '../layouts/AppLayout'
import { Button } from '@/components/ui'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/chart'
import { useTheme } from '../contexts/ThemeContext'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckSquare,
  Clock3,
  Flame,
  LineChart as LineChartIcon,
  ListChecks,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function MetricCard({ label, value, helper, icon: Icon, tone = 'default', isDark = false }) {
  const tones = {
    default: isDark
      ? 'border-zinc-700 bg-zinc-900'
      : 'border-zinc-200 bg-white',
    danger: isDark
      ? 'border-red-500/30 bg-zinc-900'
      : 'border-red-200 bg-white',
    success: isDark
      ? 'border-emerald-500/30 bg-zinc-900'
      : 'border-emerald-200 bg-white',
    focus: isDark
      ? 'border-sky-500/30 bg-zinc-900'
      : 'border-sky-200 bg-white',
  }

  return (
    <section className={`rounded-[26px] border p-6 shadow-sm ${tones[tone] || tones.default}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
          <p className={`mt-3 text-4xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
          <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  )
}

function SectionCard({ title, subtitle, children, action = null, isDark = false }) {
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

function PeriodFilter({ value, onChange, isDark = false }) {
  const options = [
    { value: 7, label: '7 dias' },
    { value: 15, label: '15 dias' },
    { value: 30, label: '30 dias' },
  ]

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border p-1 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          variant="ghost"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            value === option.value
              ? isDark
                ? 'bg-zinc-100 text-black shadow-sm'
                : 'bg-white text-zinc-950 shadow-sm'
              : isDark
                ? 'text-zinc-400 hover:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

function EmptyState({ text, isDark = false }) {
  return <div className={`rounded-2xl border border-dashed px-4 py-8 text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>{text}</div>
}

function MiniList({ items, empty, renderItem, isDark = false }) {
  if (!items?.length) {
    return <EmptyState text={empty} isDark={isDark} />
  }

  return <div className="space-y-3">{items.map(renderItem)}</div>
}

function QuickLink({ label, helper, onClick, isDark = false }) {
  return (
    <Button type="button" onClick={onClick} variant="outline" className={`h-auto w-full justify-start rounded-2xl px-4 py-4 text-left transition ${isDark ? 'border-zinc-700 bg-zinc-950 hover:bg-zinc-900' : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{label}</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p>
        </div>
        <ArrowRight className={`h-4 w-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
      </div>
    </Button>
  )
}

function ChartCard({ title, subtitle, children, icon: Icon, isDark = false }) {
  return (
    <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{title}</h3>
          {subtitle ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p> : null}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default function Dashboard() {
  const { theme } = useTheme()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState(7)
  const isDark = theme === 'dark'

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/dashboard?period=${period}`, {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar dashboard.')
        }

        const payload = await response.json()
        setDashboard(payload.data)
      } catch (loadError) {
        setError(loadError.message || 'Falha ao carregar dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [period])

  const openCompromissos = () => router.visit('/compromissos/calendario')
  const openKanban = () => router.visit('/kanban')
  const openRotinas = () => router.visit('/rotinas/hoje')
  const openFinanceiro = () => router.visit('/financeiro')

  const heroMetrics = useMemo(() => {
    if (!dashboard) return []

    const metrics = [
      {
        label: 'Compromissos de hoje',
        value: dashboard.compromissos?.hoje?.total || 0,
        helper: `${dashboard.compromissos?.proximos?.total || 0} próximos na fila`,
        icon: CalendarClock,
        tone: 'focus',
      },
      {
        label: 'Tarefas atrasadas',
        value: dashboard.tarefas?.atrasadas?.total || 0,
        helper: `${dashboard.tarefas?.pendentes?.total || 0} pendentes no total`,
        icon: AlertTriangle,
        tone: (dashboard.tarefas?.atrasadas?.total || 0) > 0 ? 'danger' : 'default',
      },
      {
        label: 'Rotinas pendentes',
        value: dashboard.rotina?.rotinas_do_dia?.pendentes || 0,
        helper: `${dashboard.rotina?.rotinas_do_dia?.concluidos || 0} concluídas hoje`,
        icon: ListChecks,
        tone: (dashboard.rotina?.rotinas_do_dia?.pendentes || 0) > 0 ? 'focus' : 'success',
      },
    ]

    if (dashboard.financeiro) {
      metrics.push({
        label: 'Fluxo do mês',
        value: formatCurrency(dashboard.financeiro.resultado_mes || 0),
        helper: `${formatCurrency(dashboard.financeiro.pendencias || 0)} em pendências`,
        icon: Wallet,
        tone: Number(dashboard.financeiro.resultado_mes || 0) >= 0 ? 'success' : 'danger',
      })
    } else {
      metrics.push({
        label: 'Lembretes ativos',
        value: dashboard.lembretes?.ativos?.total || 0,
        helper: `${dashboard.lembretes?.proximos?.total || 0} próximos lembretes`,
        icon: Clock3,
        tone: 'default',
      })
    }

    return metrics
  }, [dashboard])

  const chartData = dashboard?.graficos || {}
  const periodLabel = `${period} dias`

  if (loading && !dashboard) {
    return (
      <AppLayout title="Dashboard" chrome="dashboard">
        <div className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'}`}>
          Carregando dashboard...
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard" chrome="dashboard">
      <div className="space-y-6">
        <section className={`rounded-[30px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Visão geral</p>
              <h1 className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>O que importa agora</h1>
              <p className={`mt-2 max-w-3xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{dashboard?.insights?.mensagem_automatica || 'Acompanhe seus módulos com foco no que exige atenção hoje.'}</p>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} isDark={isDark} />
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {heroMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} isDark={isDark} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Seu dia"
            subtitle="Agenda, rotinas e tarefas que precisam entrar em execução."
            action={<Button type="button" onClick={openCompromissos} variant="outline" className={`h-auto gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>Abrir calendário <ArrowRight className="h-3.5 w-3.5" /></Button>}
            isDark={isDark}
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <p className={`mb-3 text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Agenda de hoje</p>
                <MiniList
                  items={dashboard?.compromissos?.hoje?.items || []}
                  empty="Nenhum compromisso para hoje."
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatDateTime(item.data_inicio)}</p>
                    </div>
                  )}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Rotinas de hoje</p>
                  <Button type="button" onClick={openRotinas} variant="link" className={`h-auto p-0 text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>abrir</Button>
                </div>
                <div className={`mb-3 rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Progresso do dia</p>
                  <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.rotina?.rotinas_do_dia?.concluidos || 0} de {dashboard?.rotina?.rotinas_do_dia?.total || 0}</p>
                  <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className="h-2 rounded-full bg-zinc-950" style={{ width: `${Math.min(Number(dashboard?.rotina?.taxa_conclusao_hoje || 0), 100)}%` }} />
                  </div>
                </div>
                <MiniList
                  items={dashboard?.rotina?.rotinas_do_dia?.items || []}
                  empty="Nenhuma rotina prevista hoje."
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.nome}</p>
                          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.categoria || 'rotina'}{item.horario ? ` • ${item.horario}` : ''}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'concluida' ? 'bg-emerald-100 text-emerald-700' : item.status === 'pulada' ? 'bg-amber-100 text-amber-700' : isDark ? 'bg-zinc-100 text-black' : 'bg-zinc-200 text-zinc-600'}`}>
                          {item.status === 'concluida' ? (item.modo_usado === 'minimo' ? 'mínimo' : 'feito') : item.status === 'pulada' ? 'pulada' : 'pendente'}
                        </span>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Tarefas prioritárias</p>
                  <Button type="button" onClick={openKanban} variant="link" className={`h-auto p-0 text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>abrir</Button>
                </div>
                <MiniList
                  items={dashboard?.tarefas?.pendentes?.items || []}
                  empty="Nenhuma tarefa pendente."
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.quadro || 'Sem quadro'} • prazo {item.data_limite || 'livre'}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Atenção agora" subtitle="O que saiu do trilho ou merece acompanhamento de perto." isDark={isDark}>
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-red-500/30 bg-zinc-950' : 'border-red-200 bg-red-50/70'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Backlog em risco</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{dashboard?.tarefas?.atrasadas?.total || 0} tarefas atrasadas e {dashboard?.compromissos?.atrasados?.total || 0} compromissos vencidos.</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Consistência</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Streak atual de {dashboard?.rotina?.streak_atual || 0} dias com taxa semanal de {Math.round(Number(dashboard?.rotina?.taxa_semanal || 0))}%.</p>
                </div>
                {dashboard?.financeiro ? (
                  <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Financeiro</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{formatCurrency(dashboard.financeiro.pendencias || 0)} em pendências e saldo total de {formatCurrency(dashboard.financeiro.saldo_total || 0)}.</p>
                  </div>
                ) : null}
              </div>

              <div>
                <p className={`mb-3 text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Próximos lembretes</p>
                <MiniList
                  items={dashboard?.lembretes?.proximos?.items || []}
                  empty="Nenhum lembrete próximo."
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatDateTime(item.momento_disparo)}</p>
                    </div>
                  )}
                />
              </div>

              <div>
                <p className={`mb-3 text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Atalhos</p>
                <div className="space-y-3">
                  <QuickLink label="Abrir calendário" helper="Ir direto para a agenda e compromissos" onClick={openCompromissos} isDark={isDark} />
                  <QuickLink label="Abrir rotinas de hoje" helper="Fechar o dia com consistência" onClick={openRotinas} isDark={isDark} />
                  <QuickLink label="Abrir kanban" helper="Ver e priorizar as tarefas em andamento" onClick={openKanban} isDark={isDark} />
                  {dashboard?.financeiro ? <QuickLink label="Abrir financeiro" helper="Conferir lançamentos e pendências" onClick={openFinanceiro} isDark={isDark} /> : null}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Entrega da semana" subtitle={`Tarefas concluídas nos últimos ${periodLabel}.`} icon={BarChart3} isDark={isDark}>
            <ChartContainer className={isDark ? 'border-zinc-700 bg-zinc-950' : ''} config={{ concluidas: { label: 'Concluídas', color: '#111827' } }}>
              <BarChart data={chartData.tarefas_concluidas_por_dia || []}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} stroke="#71717a" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} stroke="#71717a" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="concluidas" name="Concluídas" radius={[10, 10, 0, 0]} fill="var(--color-concluidas)" />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Tração da rotina" subtitle={`Conclusões diárias de rotinas em ${periodLabel}.`} icon={Flame} isDark={isDark}>
            <ChartContainer className={isDark ? 'border-zinc-700 bg-zinc-950' : ''} config={{ concluidos: { label: 'Concluídos', color: '#18181b' } }}>
              <BarChart data={chartData.rotinas_concluidas_por_dia || []}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} stroke="#71717a" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} stroke="#71717a" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="concluidos" name="Concluídos" radius={[10, 10, 0, 0]} fill="var(--color-concluidos)" />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ChartCard title="Fluxo de trabalho" subtitle="Criadas x concluídas para entender a semana." icon={LineChartIcon} isDark={isDark}>
            <ChartContainer
              className={isDark ? 'border-zinc-700 bg-zinc-950' : ''}
              config={{
                criadas: { label: 'Criadas', color: '#94a3b8' },
                concluidas: { label: 'Concluídas', color: '#18181b' },
              }}
            >
              <LineChart data={chartData.tarefas_criadas_vs_concluidas || []}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} stroke="#71717a" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} stroke="#71717a" />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Legend />
                <Line type="monotone" dataKey="criadas" name="Criadas" stroke="var(--color-criadas)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke="var(--color-concluidas)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          <SectionCard title="Financeiro e próximos passos" subtitle="Resumo enxuto do caixa e últimas movimentações." isDark={isDark}>
            {dashboard?.financeiro ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Saldo total</p>
                    <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{formatCurrency(dashboard.financeiro.saldo_total || 0)}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Resultado do mês</p>
                    <p className={`mt-2 text-2xl font-semibold tracking-tight ${Number(dashboard.financeiro.resultado_mes || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(dashboard.financeiro.resultado_mes || 0)}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Pendências</p>
                    <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{formatCurrency(dashboard.financeiro.pendencias || 0)}</p>
                  </div>
                </div>

                <MiniList
                  items={dashboard.financeiro.transacoes_recentes || []}
                  empty="Sem movimentações recentes."
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.descricao}</p>
                          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.categoria || 'Sem categoria'} • {item.data || '-'}</p>
                        </div>
                        <span className={`text-sm font-medium ${item.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>{item.tipo === 'receita' ? '+' : '-'}{formatCurrency(item.valor)}</span>
                      </div>
                    </div>
                  )}
                />
              </div>
            ) : (
              <EmptyState text="Resumo financeiro indisponível para esta conta." isDark={isDark} />
            )}
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  )
}
