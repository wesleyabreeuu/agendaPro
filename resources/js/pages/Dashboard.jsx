import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import AppLayout from '../layouts/AppLayout'
import { Button, Skeleton } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckSquare,
  Clock3,
  Flame,
  LineChart as LineChartIcon,
  ListChecks,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

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

function formatShortDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function getPercentageDelta(currentValue, previousValue) {
  const current = Number(currentValue || 0)
  const previous = Number(previousValue || 0)

  if (!previous) {
    if (!current) return 0
    return 100
  }

  return ((current - previous) / Math.abs(previous)) * 100
}

function getMetricTone(delta, inverse = false) {
  const value = inverse ? delta * -1 : delta
  if (value > 0) return { badge: 'success', icon: TrendingUp }
  if (value < 0) return { badge: 'danger', icon: TrendingDown }
  return { badge: 'outline', icon: TrendingUp }
}

function buildMetricCards(dashboard) {
  const compromissosHoje = Number(dashboard.compromissos?.hoje?.total || 0)
  const compromissosProximos = Number(dashboard.compromissos?.proximos?.total || 0)
  const tarefasAtrasadas = Number(dashboard.tarefas?.atrasadas?.total || 0)
  const tarefasPendentes = Number(dashboard.tarefas?.pendentes?.total || 0)
  const rotinasPendentes = Number(dashboard.rotina?.rotinas_do_dia?.pendentes || 0)
  const rotinasConcluidas = Number(dashboard.rotina?.rotinas_do_dia?.concluidos || 0)
  const fluxoMes = Number(dashboard.financeiro?.resultado_mes || 0)
  const pendenciasFinanceiras = Number(dashboard.financeiro?.pendencias || 0)
  const lembretesAtivos = Number(dashboard.lembretes?.ativos?.total || 0)
  const lembretesProximos = Number(dashboard.lembretes?.proximos?.total || 0)

  const compromissoDelta = getPercentageDelta(compromissosHoje, compromissosProximos)
  const tarefaDelta = getPercentageDelta(tarefasAtrasadas, tarefasPendentes)
  const rotinaDelta = getPercentageDelta(rotinasConcluidas, rotinasPendentes || 1)
  const financeiroDelta = getPercentageDelta(fluxoMes, pendenciasFinanceiras || 1)
  const lembreteDelta = getPercentageDelta(lembretesAtivos, lembretesProximos)

  const cards = [
    {
      key: 'compromissos',
      label: 'Compromissos de hoje',
      value: compromissosHoje,
      helper: `${compromissosProximos} na fila dos próximos horários`,
      delta: compromissoDelta,
      inverse: false,
      icon: CalendarClock,
      footer: 'Ritmo do dia e próximos encaixes',
    },
    {
      key: 'tarefas',
      label: 'Tarefas atrasadas',
      value: tarefasAtrasadas,
      helper: `${tarefasPendentes} pendentes no total`,
      delta: tarefaDelta,
      inverse: true,
      icon: AlertTriangle,
      footer: 'Quanto menor, melhor para o fluxo',
    },
    {
      key: 'rotinas',
      label: 'Rotinas pendentes',
      value: rotinasPendentes,
      helper: `${rotinasConcluidas} concluídas hoje`,
      delta: rotinaDelta,
      inverse: true,
      icon: ListChecks,
      footer: 'Mostra a tração do hábito no dia',
    },
  ]

  if (dashboard.financeiro) {
    cards.push({
      key: 'financeiro',
      label: 'Fluxo do mês',
      value: formatCurrency(fluxoMes),
      helper: `${formatCurrency(pendenciasFinanceiras)} em pendências`,
      delta: financeiroDelta,
      inverse: false,
      icon: Wallet,
      footer: 'Resultado líquido do mês corrente',
    })
  } else {
    cards.push({
      key: 'lembretes',
      label: 'Lembretes ativos',
      value: lembretesAtivos,
      helper: `${lembretesProximos} próximos lembretes`,
      delta: lembreteDelta,
      inverse: false,
      icon: Clock3,
      footer: 'Disparos previstos nos próximos minutos',
    })
  }

  return cards
}

function buildRecentItems(dashboard) {
  const compromissos = (dashboard.compromissos?.hoje?.items || []).slice(0, 3).map((item) => ({
    id: `compromisso-${item.id}`,
    item: item.titulo,
    origem: 'Agenda',
    quando: formatDateTime(item.data_inicio),
    status: 'Hoje',
    statusVariant: 'info',
    contexto: item.categoria || 'Compromisso do dia',
  }))

  const tarefas = (dashboard.tarefas?.pendentes?.items || []).slice(0, 3).map((item) => ({
    id: `tarefa-${item.id}`,
    item: item.titulo,
    origem: 'Kanban',
    quando: item.data_limite || 'Sem prazo',
    status: dashboard.tarefas?.atrasadas?.total ? 'Atenção' : 'Pendente',
    statusVariant: dashboard.tarefas?.atrasadas?.total ? 'warning' : 'outline',
    contexto: item.quadro || 'Sem quadro',
  }))

  const lembretes = (dashboard.lembretes?.proximos?.items || []).slice(0, 2).map((item) => ({
    id: `lembrete-${item.id}`,
    item: item.titulo,
    origem: 'Lembretes',
    quando: formatDateTime(item.momento_disparo),
    status: 'Próximo',
    statusVariant: 'secondary',
    contexto: item.tipo || 'Disparo automático',
  }))

  const transacoes = (dashboard.financeiro?.transacoes_recentes || []).slice(0, 2).map((item) => ({
    id: `transacao-${item.id}`,
    item: item.descricao,
    origem: 'Financeiro',
    quando: item.data || '-',
    status: item.tipo === 'receita' ? 'Receita' : 'Despesa',
    statusVariant: item.tipo === 'receita' ? 'success' : 'danger',
    contexto: item.categoria || 'Sem categoria',
  }))

  return [...compromissos, ...tarefas, ...lembretes, ...transacoes].slice(0, 8)
}

function buildChartTabs(chartData) {
  return {
    fluxo: {
      title: 'Fluxo de trabalho',
      description: 'Criadas x concluídas para entender a semana',
      data: chartData.tarefas_criadas_vs_concluidas || [],
      config: {
        criadas: { label: 'Criadas', color: '#94a3b8' },
        concluidas: { label: 'Concluídas', color: '#111827' },
      },
      series: [
        { key: 'criadas', gradientId: 'fill-criadas', stroke: 'var(--color-criadas)' },
        { key: 'concluidas', gradientId: 'fill-concluidas', stroke: 'var(--color-concluidas)' },
      ],
    },
    tarefas: {
      title: 'Entrega da semana',
      description: 'Tarefas concluídas no período selecionado',
      data: chartData.tarefas_concluidas_por_dia || [],
      config: {
        concluidas: { label: 'Concluídas', color: '#0f172a' },
      },
      series: [
        { key: 'concluidas', gradientId: 'fill-tarefas', stroke: 'var(--color-concluidas)' },
      ],
    },
    rotinas: {
      title: 'Tração da rotina',
      description: 'Conclusões diárias para manter consistência',
      data: chartData.rotinas_concluidas_por_dia || [],
      config: {
        concluidos: { label: 'Concluídos', color: '#18181b' },
      },
      series: [
        { key: 'concluidos', gradientId: 'fill-rotinas', stroke: 'var(--color-concluidos)' },
      ],
    },
  }
}

function DashboardSkeleton({ isDark = false }) {
  return (
    <div className="space-y-6">
      <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
        <CardHeader className="gap-3">
          <Skeleton className={`h-4 w-32 ${isDark ? 'bg-zinc-800' : ''}`} />
          <Skeleton className={`h-10 w-80 ${isDark ? 'bg-zinc-800' : ''}`} />
          <Skeleton className={`h-4 w-[32rem] max-w-full ${isDark ? 'bg-zinc-800' : ''}`} />
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
            <CardHeader className="gap-3">
              <Skeleton className={`h-4 w-28 ${isDark ? 'bg-zinc-800' : ''}`} />
              <Skeleton className={`h-10 w-24 ${isDark ? 'bg-zinc-800' : ''}`} />
            </CardHeader>
            <CardFooter className={isDark ? 'border-zinc-800 bg-zinc-950/70' : ''}>
              <Skeleton className={`h-4 w-full ${isDark ? 'bg-zinc-800' : ''}`} />
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
          <CardHeader className="gap-3">
            <Skeleton className={`h-5 w-48 ${isDark ? 'bg-zinc-800' : ''}`} />
            <Skeleton className={`h-4 w-56 ${isDark ? 'bg-zinc-800' : ''}`} />
          </CardHeader>
          <CardContent>
            <Skeleton className={`h-[300px] w-full rounded-xl ${isDark ? 'bg-zinc-800' : ''}`} />
          </CardContent>
        </Card>
        <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
          <CardHeader className="gap-3">
            <Skeleton className={`h-5 w-40 ${isDark ? 'bg-zinc-800' : ''}`} />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className={`h-16 w-full rounded-xl ${isDark ? 'bg-zinc-800' : ''}`} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ item, isDark = false }) {
  const tone = getMetricTone(item.delta, item.inverse)
  const TrendIcon = tone.icon

  return (
    <Card
      className={`@container/card border shadow-xs ${
        isDark
          ? 'border-zinc-700 bg-card'
          : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card'
      }`}
    >
      <CardHeader>
        <CardDescription>{item.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {item.value}
        </CardTitle>
        <CardAction>
          <Badge variant={tone.badge}>
            <TrendIcon className="h-3.5 w-3.5" />
            {`${item.delta >= 0 ? '+' : ''}${item.delta.toFixed(1)}%`}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <item.icon className="h-4 w-4" />
          {item.helper}
        </div>
        <div className="text-muted-foreground">{item.footer}</div>
      </CardFooter>
    </Card>
  )
}

function QuickAction({ label, helper, onClick }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="h-auto justify-between rounded-xl px-4 py-3 text-left">
      <div>
        <div className="font-medium text-zinc-950 dark:text-zinc-50">{label}</div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{helper}</div>
      </div>
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}

function MiniEvent({ title, meta, badge, badgeVariant = 'outline' }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-background px-4 py-3 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-950 dark:text-zinc-50">{title}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{meta}</p>
        </div>
        {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
      </div>
    </div>
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

  const metricCards = useMemo(() => (dashboard ? buildMetricCards(dashboard) : []), [dashboard])
  const recentItems = useMemo(() => (dashboard ? buildRecentItems(dashboard) : []), [dashboard])
  const chartTabs = useMemo(() => buildChartTabs(dashboard?.graficos || {}), [dashboard])

  const openCompromissos = () => router.visit('/compromissos/calendario')
  const openKanban = () => router.visit('/kanban')
  const openRotinas = () => router.visit('/rotinas/hoje')
  const openFinanceiro = () => router.visit('/financeiro')

  if (loading && !dashboard) {
    return (
      <AppLayout title="Dashboard" chrome="dashboard">
        <DashboardSkeleton isDark={isDark} />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard" chrome="dashboard">
      <div className="@container/main flex flex-col gap-4 md:gap-6">
        <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
          <CardHeader className="gap-3 lg:flex lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardDescription>Visão geral</CardDescription>
              <CardTitle className="mt-1 text-3xl font-semibold tracking-tight">O que importa agora</CardTitle>
              <p className="mt-2 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
                {dashboard?.insights?.mensagem_automatica || 'Acompanhe seus módulos com foco no que exige atenção hoje.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[7, 15, 30].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={period === value ? 'default' : 'outline'}
                  onClick={() => setPeriod(value)}
                  className="rounded-full px-4"
                >
                  {value} dias
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {error ? (
          <Card className="border-red-200 bg-red-50 text-red-700">
            <CardContent className="py-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 px-0 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((item) => (
            <MetricCard key={item.key} item={item} isDark={isDark} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <Tabs defaultValue="fluxo" className="gap-4">
            <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
              <CardHeader>
                <div>
                  <CardTitle>Panorama operacional</CardTitle>
                  <CardDescription>Estrutura visual inspirada no bloco oficial `dashboard-01`, adaptada aos seus dados.</CardDescription>
                </div>
                <CardAction>
                  <TabsList variant="line" className="flex-wrap justify-start">
                    <TabsTrigger value="fluxo">Fluxo</TabsTrigger>
                    <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
                    <TabsTrigger value="rotinas">Rotinas</TabsTrigger>
                  </TabsList>
                </CardAction>
              </CardHeader>

              {Object.entries(chartTabs).map(([key, tab]) => (
                <TabsContent key={key} value={key}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{tab.title}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{tab.description}</p>
                      </div>
                      <Badge variant="outline">{period} dias</Badge>
                    </div>

                    <ChartContainer config={tab.config} className="h-[320px] w-full">
                      <AreaChart data={tab.data}>
                        <defs>
                          {tab.series.map((series) => (
                            <linearGradient key={series.gradientId} id={series.gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={series.stroke} stopOpacity={0.35} />
                              <stop offset="95%" stopColor={series.stroke} stopOpacity={0.05} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        {tab.series.map((series) => (
                          <Area
                            key={series.key}
                            type="natural"
                            dataKey={series.key}
                            fill={`url(#${series.gradientId})`}
                            stroke={series.stroke}
                            strokeWidth={2}
                          />
                        ))}
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </TabsContent>
              ))}
            </Card>
          </Tabs>

          <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
            <CardHeader>
              <CardTitle>Seu dia</CardTitle>
              <CardDescription>Agenda, hábitos e prioridades imediatas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MiniEvent
                title={dashboard?.compromissos?.hoje?.items?.[0]?.titulo || 'Nenhum compromisso agora'}
                meta={dashboard?.compromissos?.hoje?.items?.[0]?.data_inicio ? formatDateTime(dashboard.compromissos.hoje.items[0].data_inicio) : 'Sua agenda está livre neste momento.'}
                badge={dashboard?.compromissos?.hoje?.total ? `${dashboard.compromissos.hoje.total} hoje` : null}
                badgeVariant="info"
              />
              <MiniEvent
                title={`${dashboard?.rotina?.rotinas_do_dia?.concluidos || 0} de ${dashboard?.rotina?.rotinas_do_dia?.total || 0} rotinas concluídas`}
                meta={`Streak atual de ${dashboard?.rotina?.streak_atual || 0} dias • taxa semanal ${Math.round(Number(dashboard?.rotina?.taxa_semanal || 0))}%`}
                badge={`${dashboard?.rotina?.rotinas_do_dia?.pendentes || 0} pendentes`}
                badgeVariant="warning"
              />
              <MiniEvent
                title={dashboard?.tarefas?.pendentes?.items?.[0]?.titulo || 'Nenhuma tarefa crítica'}
                meta={dashboard?.tarefas?.pendentes?.items?.[0] ? `${dashboard.tarefas.pendentes.items[0].quadro || 'Sem quadro'} • prazo ${dashboard.tarefas.pendentes.items[0].data_limite || 'livre'}` : 'Seu quadro está em dia por enquanto.'}
                badge={dashboard?.tarefas?.atrasadas?.total ? `${dashboard.tarefas.atrasadas.total} atrasadas` : 'Em dia'}
                badgeVariant={dashboard?.tarefas?.atrasadas?.total ? 'danger' : 'success'}
              />
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <QuickAction label="Abrir calendário" helper="Compromissos e visão da agenda" onClick={openCompromissos} />
              <QuickAction label="Abrir rotinas de hoje" helper="Fechar o dia com consistência" onClick={openRotinas} />
              <QuickAction label="Abrir kanban" helper="Priorizar entregas e tarefas" onClick={openKanban} />
              {dashboard?.financeiro ? (
                <QuickAction label="Abrir financeiro" helper="Lançamentos, metas e pendências" onClick={openFinanceiro} />
              ) : null}
            </CardFooter>
          </Card>
        </div>

        <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
          <CardHeader>
            <CardTitle>Itens em movimento</CardTitle>
            <CardDescription>Uma leitura rápida do que está entrando em execução nos módulos principais.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Quando</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contexto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentItems.length ? recentItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-zinc-950 dark:text-zinc-50">{row.item}</TableCell>
                    <TableCell>{row.origem}</TableCell>
                    <TableCell>{row.quando}</TableCell>
                    <TableCell>
                      <Badge variant={row.statusVariant}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">{row.contexto}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-zinc-500 dark:text-zinc-400">
                      Nenhum item relevante para mostrar agora.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Atualizado para a janela dos últimos {period} dias.
            </div>
            <Button type="button" variant="outline" onClick={openKanban} className="gap-2">
              Ver fluxo completo
              <LineChartIcon className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
            <CardHeader>
              <CardTitle>Atenção agora</CardTitle>
              <CardDescription>O que merece acompanhamento mais próximo.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <MiniEvent
                title="Backlog em risco"
                meta={`${dashboard?.tarefas?.atrasadas?.total || 0} tarefas atrasadas e ${dashboard?.compromissos?.atrasados?.total || 0} compromissos vencidos.`}
                badge="Prioridade"
                badgeVariant="danger"
              />
              <MiniEvent
                title="Consistência"
                meta={`Streak atual de ${dashboard?.rotina?.streak_atual || 0} dias com taxa semanal de ${Math.round(Number(dashboard?.rotina?.taxa_semanal || 0))}%.`}
                badge="Rotina"
                badgeVariant="warning"
              />
              {dashboard?.financeiro ? (
                <MiniEvent
                  title="Financeiro"
                  meta={`${formatCurrency(dashboard.financeiro.pendencias || 0)} em pendências e saldo total de ${formatCurrency(dashboard.financeiro.saldo_total || 0)}.`}
                  badge="Caixa"
                  badgeVariant={Number(dashboard.financeiro.resultado_mes || 0) >= 0 ? 'success' : 'danger'}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className={isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}>
            <CardHeader>
              <CardTitle>Próximos lembretes</CardTitle>
              <CardDescription>Disparos que devem acontecer em seguida.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(dashboard?.lembretes?.proximos?.items || []).slice(0, 4).map((item) => (
                <MiniEvent
                  key={item.id}
                  title={item.titulo}
                  meta={`${formatDateTime(item.momento_disparo)} • ${item.tipo || 'lembrete'}`}
                  badge={formatShortDate(item.momento_disparo)}
                  badgeVariant="secondary"
                />
              ))}
              {!dashboard?.lembretes?.proximos?.items?.length ? (
                <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  Nenhum lembrete próximo.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
