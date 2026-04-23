import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import AppLayout from '../layouts/AppLayout'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/chart'
import { useTheme } from '../contexts/ThemeContext'
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckSquare,
  Clock3,
  Flame,
  ListChecks,
  LineChart as LineChartIcon,
  MousePointerClick,
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

function MetricCard({ label, value, helper, icon: Icon, isDark = false }) {
  return (
    <section className={`rounded-[26px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
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

function PeriodFilter({ value, onChange, isDark = false }) {
  const options = [
    { value: 7, label: '7 dias' },
    { value: 15, label: '15 dias' },
    { value: 30, label: '30 dias' },
  ]

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border p-1 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
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
        </button>
      ))}
    </div>
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

function ListBlock({ empty, items, renderItem, isDark = false }) {
  if (!items?.length) {
    return <div className={`rounded-2xl border border-dashed px-4 py-8 text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>{empty}</div>
  }

  return <div className="space-y-3">{items.map(renderItem)}</div>
}

function ChartCard({ title, subtitle, children, icon: Icon, onOpen, openLabel, isDark = false }) {
  return (
    <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{title}</h3>
          {subtitle ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isDark
                  ? 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <MousePointerClick className="h-3.5 w-3.5" />
              {openLabel || 'Abrir'}
            </button>
          ) : null}
          {Icon ? (
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
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

  const topMetrics = useMemo(() => {
    if (!dashboard) return []

    return [
      {
        label: 'Compromissos de hoje',
        value: dashboard.compromissos?.hoje?.total || 0,
        helper: `${dashboard.compromissos?.proximos?.total || 0} proximos na fila`,
        icon: CalendarClock,
      },
      {
        label: 'Lembretes ativos',
        value: dashboard.lembretes?.ativos?.total || 0,
        helper: `${dashboard.lembretes?.proximos?.total || 0} proximos lembretes`,
        icon: Clock3,
      },
      {
        label: 'Tarefas pendentes',
        value: dashboard.tarefas?.pendentes?.total || 0,
        helper: `${dashboard.tarefas?.atrasadas?.total || 0} atrasadas`,
        icon: CheckSquare,
      },
      {
        label: 'Melhor streak',
        value: dashboard.rotina?.streak_atual || 0,
        helper: `${dashboard.rotina?.rotinas_do_dia?.concluidos || 0} rotinas concluídas hoje`,
        icon: Flame,
      },
    ]
  }, [dashboard])

  const chartData = dashboard?.graficos || {}
  const periodLabel = `${period} dias`
  const isDark = theme === 'dark'

  const openCompromissos = () => router.visit('/compromissos/calendario')
  const openKanban = () => router.visit('/kanban')
  const openCheckins = () => router.visit('/rotinas/hoje')

  return (
    <AppLayout title="Dashboard" chrome="dashboard">
      <div className="space-y-6">
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div>
            <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Dashboard inteligente</h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Agenda, rotina, tarefas e insights em uma leitura única do seu momento.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Período de análise</p>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Os gráficos e os insights acompanham o recorte selecionado.</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} isDark={isDark} />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {topMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} isDark={isDark} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Execução diária"
            subtitle={`Tarefas concluídas nos últimos ${periodLabel}.`}
            icon={BarChart3}
            onOpen={openKanban}
            openLabel="Abrir kanban"
            isDark={isDark}
          >
            <ChartContainer
              className={isDark ? 'border-zinc-700 bg-zinc-950' : ''}
              config={{
                concluidas: { label: 'Concluídas', color: '#111827' },
              }}
            >
              <BarChart data={chartData.tarefas_concluidas_por_dia || []} onClick={openKanban}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} stroke="#71717a" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} stroke="#71717a" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="concluidas" name="Concluídas" radius={[10, 10, 0, 0]} fill="var(--color-concluidas)" />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Criadas x concluídas"
            subtitle={`Comparação do fluxo de entrada e entrega em ${periodLabel}.`}
            icon={LineChartIcon}
            onOpen={openKanban}
            openLabel="Abrir kanban"
            isDark={isDark}
          >
            <ChartContainer
              className={isDark ? 'border-zinc-700 bg-zinc-950' : ''}
              config={{
                criadas: { label: 'Criadas', color: '#94a3b8' },
                concluidas: { label: 'Concluídas', color: '#18181b' },
              }}
            >
              <LineChart data={chartData.tarefas_criadas_vs_concluidas || []} onClick={openKanban}>
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
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Compromissos"
            subtitle="O que exige atenção agora na sua agenda."
            action={<span className={`rounded-full border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-zinc-200 text-zinc-600'}`}>{dashboard?.compromissos?.atrasados?.total || 0} atrasados</span>}
            isDark={isDark}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Hoje</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.compromissos?.hoje?.total || 0}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Próximos</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.compromissos?.proximos?.total || 0}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Atrasados</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.compromissos?.atrasados?.total || 0}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className={`mb-3 text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Próximos compromissos</p>
                <ListBlock
                  empty="Nenhum compromisso próximo."
                  items={dashboard?.compromissos?.proximos?.items || []}
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200'}`}>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatDateTime(item.data_inicio)} • {item.owner || 'Sem owner'}</p>
                    </div>
                  )}
                />
              </div>
              <div>
                <p className={`mb-3 text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Atrasados</p>
                <ListBlock
                  empty="Nenhum compromisso atrasado."
                  items={dashboard?.compromissos?.atrasados?.items || []}
                  isDark={isDark}
                  renderItem={(item) => (
                    <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200'}`}>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatDateTime(item.data_inicio)} • {item.permissao}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Insights" subtitle="Leitura da sua semana." isDark={isDark}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Conclusão no período</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.insights?.percentual_tarefas_concluidas_semana || 0}%</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Comparação</p>
                <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.insights?.comparacao_com_semana_anterior?.variacao || 0}%</p>
                <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{dashboard?.insights?.comparacao_com_semana_anterior?.tendencia || 'estavel'} vs período anterior</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                {dashboard?.insights?.tarefas_atrasadas || 0} tarefas atrasadas
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                <Flame className="h-4 w-4 text-emerald-600" />
                streak de {dashboard?.rotina?.streak_atual || 0} dias
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Agenda no período"
            subtitle={`Distribuição dos compromissos ao longo de ${periodLabel}.`}
            icon={CalendarClock}
            onOpen={openCompromissos}
            openLabel="Abrir calendário"
            isDark={isDark}
          >
            <ChartContainer
              className={isDark ? 'border-zinc-700 bg-zinc-950' : ''}
              config={{
                total: { label: 'Compromissos', color: '#27272a' },
              }}
            >
              <BarChart data={chartData.compromissos_por_dia || []} onClick={openCompromissos}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={12} stroke="#71717a" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} stroke="#71717a" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" name="Compromissos" radius={[10, 10, 0, 0]} fill="var(--color-total)" />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Rotina no período"
            subtitle={`Quantidade de rotinas concluídas em ${periodLabel}.`}
            icon={Flame}
            onOpen={openCheckins}
            openLabel="Abrir rotinas"
            isDark={isDark}
          >
            <ChartContainer
              className={isDark ? 'border-zinc-700 bg-zinc-950' : ''}
              config={{
                concluidos: { label: 'Concluidos', color: '#18181b' },
              }}
            >
              <BarChart data={chartData.rotinas_concluidas_por_dia || []} onClick={openCheckins}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} stroke="#71717a" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} stroke="#71717a" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="concluidos" name="Concluidos" radius={[10, 10, 0, 0]} fill="var(--color-concluidos)" />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
          <SectionCard title="Lembretes" subtitle="Próximos lembretes ativos." isDark={isDark}>
            <ListBlock
              empty="Nenhum lembrete próximo."
              items={dashboard?.lembretes?.proximos?.items || []}
              isDark={isDark}
              renderItem={(item) => (
                <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200'}`}>
                  <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatDateTime(item.momento_disparo)}</p>
                  {item.descricao ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.descricao}</p> : null}
                </div>
              )}
            />
          </SectionCard>

          <SectionCard title="Tarefas Kanban" subtitle="Visão de execução do quadro." isDark={isDark}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Pendentes</p>
                <p className={`mt-2 text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.tarefas?.pendentes?.total || 0}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Concluídas</p>
                <p className={`mt-2 text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.tarefas?.concluidas?.total || 0}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Atrasadas</p>
                <p className={`mt-2 text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.tarefas?.atrasadas?.total || 0}</p>
              </div>
            </div>

            <div className="mt-5">
              <ListBlock
                empty="Nenhuma tarefa pendente."
                items={dashboard?.tarefas?.pendentes?.items || []}
                isDark={isDark}
                renderItem={(item) => (
                  <div key={item.id} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.titulo}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 text-zinc-600'}`}>{item.status}</span>
                    </div>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.quadro || 'Sem quadro'} • prazo {item.data_limite || 'livre'}</p>
                  </div>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Rotina" subtitle="Presença diária e consistência." isDark={isDark}>
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Rotinas do dia</p>
                <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>
                  {(dashboard?.rotina?.rotinas_do_dia?.concluidos || 0)} de {(dashboard?.rotina?.rotinas_do_dia?.total || 0)} concluídas
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Streak atual</p>
                <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{dashboard?.rotina?.streak_atual || 0} dias</p>
              </div>
              {dashboard?.rotina?.rotinas_do_dia?.items?.length ? (
                <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200'}`}>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <ListChecks className="h-4 w-4" />
                    Rotinas em foco hoje
                  </div>
                  <div className="mt-3 space-y-2">
                    {dashboard.rotina.rotinas_do_dia.items.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50/60'}`}>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.nome}</p>
                          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.categoria || 'rotina'}{item.horario ? ` • ${item.horario}` : ''}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'concluida' ? 'bg-emerald-100 text-emerald-700' : item.status === 'pulada' ? 'bg-amber-100 text-amber-700' : isDark ? 'bg-zinc-100 text-black' : 'bg-zinc-200 text-zinc-600'}`}>
                          {item.status === 'concluida' ? (item.modo_usado === 'minimo' ? 'mínimo' : 'feito') : item.status === 'pulada' ? 'pulada' : 'pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  )
}
