import React, { useEffect, useMemo, useRef } from 'react'
import AppLayout from '../layouts/AppLayout'
import Chart from 'chart.js/auto'
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  DollarSign,
  HeartPulse,
  ListTodo,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0))
}

function formatCompactNumber(value) {
  return numberFormatter.format(Number(value || 0))
}

function formatDateLabel(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function formatDateTime(value, allDay = false) {
  if (!value) return allDay ? 'Dia inteiro' : '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return allDay ? 'Dia inteiro' : '-'

  return allDay
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

function formatHour(value) {
  if (!value) return '-'
  return String(value).slice(0, 5)
}

function getTrend(value) {
  const numeric = Number(value || 0)

  if (numeric > 0) {
    return { icon: TrendingUp, label: `+${numeric.toFixed(1)}%`, tone: 'text-emerald-700' }
  }

  if (numeric < 0) {
    return { icon: TrendingDown, label: `${numeric.toFixed(1)}%`, tone: 'text-rose-700' }
  }

  return { icon: Activity, label: '0.0%', tone: 'text-zinc-600' }
}

function buildPriorityRows(proximosCompromissos = [], tarefasHoje = []) {
  const agendaRows = proximosCompromissos.map((item) => ({
    id: `compromisso-${item.id}`,
    titulo: item.titulo,
    tipo: 'Compromisso',
    status: item.dia_inteiro ? 'Dia inteiro' : 'Agendado',
    quando: formatDateTime(item.data_inicio, item.dia_inteiro),
    contexto: item.categoria?.nome || 'Agenda',
  }))

  const taskRows = tarefasHoje.map((item) => ({
    id: `todo-${item.id}`,
    titulo: item.descricao,
    tipo: 'Tarefa',
    status: item.status === 'finalizado' ? 'Concluída' : item.status === 'execucao' ? 'Em execução' : 'Aguardando',
    quando: item.data ? `${formatDateLabel(item.data)} ${item.hora ? `• ${formatHour(item.hora)}` : ''}` : formatHour(item.hora),
    contexto: item.urgencia ? `Urgência ${item.urgencia}` : 'Rotina',
  }))

  return [...agendaRows, ...taskRows].slice(0, 8)
}

function OverviewCard({ title, value, eyebrow, description, trendValue, icon: Icon }) {
  const trend = getTrend(trendValue)
  const TrendIcon = trend.icon

  return (
    <section className="rounded-[26px] border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{eyebrow}</p>
          <p className="mt-3 text-[2.1rem] font-semibold tracking-tight text-zinc-950">{value}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700">
          <TrendIcon className={`h-3.5 w-3.5 ${trend.tone}`} />
          <span>{trend.label}</span>
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-zinc-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        </div>
      </div>
    </section>
  )
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
      {children}
    </span>
  )
}

export default function Dashboard({
  cards,
  chartData,
  proximosCompromissos = [],
  tarefasHoje = [],
  agendaHoje = [],
  financeiro,
  saude,
  kanban,
  checkinHoje,
}) {
  const lineRef = useRef(null)
  const doughnutRef = useRef(null)

  const financialTrend = useMemo(() => {
    const receitas = Number(financeiro?.receitasMes || 0)
    const despesas = Number(financeiro?.despesasMes || 0)
    if (receitas <= 0) return 0

    return ((receitas - despesas) / receitas) * 100
  }, [financeiro])

  const healthTrend = useMemo(() => {
    const calorias = Number(saude?.caloriasSemana || 0)
    const atividades = Number(saude?.atividadesSemana || 0)
    if (atividades <= 0) return 0

    return Math.min((calorias / atividades) / 10, 99)
  }, [saude])

  const statusEntries = useMemo(
    () => [
      { label: 'Hoje', value: `${cards?.compromissosHoje || 0} compromissos`, icon: CalendarClock },
      { label: 'Pendentes', value: `${cards?.tarefasPendentes || 0} tarefas`, icon: ListTodo },
      { label: 'Check-in', value: checkinHoje ? 'Feito hoje' : 'Pendente', icon: CheckCircle2 },
    ],
    [cards, checkinHoje],
  )

  const priorityRows = useMemo(
    () => buildPriorityRows(proximosCompromissos, tarefasHoje),
    [proximosCompromissos, tarefasHoje],
  )

  useEffect(() => {
    const charts = []

    if (lineRef.current) {
      charts.push(new Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: chartData?.compromissosSemana?.labels ?? [],
          datasets: [{
            label: 'Compromissos',
            data: chartData?.compromissosSemana?.values ?? [],
            borderColor: '#111827',
            backgroundColor: 'rgba(17, 24, 39, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#111827',
              padding: 10,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#71717a' },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(228, 228, 231, 0.8)' },
              ticks: {
                color: '#71717a',
                precision: 0,
              },
              border: { display: false },
            },
          },
        },
      }))
    }

    if (doughnutRef.current) {
      charts.push(new Chart(doughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: chartData?.tarefasStatus?.labels ?? [],
          datasets: [{
            data: chartData?.tarefasStatus?.values ?? [],
            backgroundColor: ['#e4e4e7', '#71717a', '#18181b'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#52525b',
                usePointStyle: true,
                boxWidth: 10,
                boxHeight: 10,
                padding: 16,
              },
            },
          },
        },
      }))
    }

    return () => charts.forEach((chart) => chart.destroy())
  }, [chartData])

  return (
    <AppLayout title="Dashboard" chrome="dashboard">
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            eyebrow="Compromissos no mês"
            value={formatCompactNumber(cards?.compromissosMes)}
            trendValue={cards?.compromissosHoje ? 12.5 : 0}
            title="Agenda em movimento"
            description={`${cards?.compromissosHoje || 0} compromissos para hoje e ${agendaHoje.length} itens já visíveis na grade.`}
            icon={CalendarClock}
          />
          <OverviewCard
            eyebrow="Lembretes ativos"
            value={formatCompactNumber(cards?.totalLembretes)}
            trendValue={cards?.totalLembretes ? 8.4 : 0}
            title="Rotina acompanhada"
            description={`${cards?.tarefasPendentes || 0} tarefas pendentes e ${cards?.totalTarefasHoje || 0} tarefas previstas para hoje.`}
            icon={ListTodo}
          />
          <OverviewCard
            eyebrow="Saldo consolidado"
            value={formatCurrency(cards?.saldoTotal)}
            trendValue={financialTrend}
            title="Pulso financeiro"
            description={`Receitas do mês em ${formatCurrency(financeiro?.receitasMes)} e despesas em ${formatCurrency(financeiro?.despesasMes)}.`}
            icon={DollarSign}
          />
          <OverviewCard
            eyebrow="Horas de treino"
            value={`${Number(cards?.horasSemana || 0).toFixed(1)}h`}
            trendValue={healthTrend}
            title="Saúde em foco"
            description={`${saude?.atividadesSemana || 0} atividades na semana e ${formatCompactNumber(saude?.caloriasSemana || 0)} kcal registradas.`}
            icon={HeartPulse}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 px-6 py-5">
              <div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
                    <Target className="h-3.5 w-3.5" />
                  </span>
                  Dashboard
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Visão geral da operação</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>7 dias</Pill>
                <Pill>{cards?.checkinHoje ? 'Check-in ok' : 'Check-in pendente'}</Pill>
              </div>
            </div>

            <div className="grid gap-6 p-6">
              <div className="rounded-[24px] border border-zinc-200 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-950">Fluxo de compromissos</h3>
                    <p className="mt-1 text-sm text-zinc-500">Leitura diária da agenda prevista para a semana atual.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusEntries.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-medium text-zinc-950">{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 h-[320px]">
                  <canvas ref={lineRef} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-5">
                  <p className="text-sm text-zinc-500">Receitas x despesas</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{formatCurrency(financeiro?.resultadoMes)}</p>
                  <p className="mt-2 text-sm text-zinc-600">Resultado líquido do mês com base nas transações registradas.</p>
                </div>
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-5">
                  <p className="text-sm text-zinc-500">Projetos ativos</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{formatCompactNumber(cards?.totalQuadrosKanban)}</p>
                  <p className="mt-2 text-sm text-zinc-600">{(kanban?.pendentes || 0) + (kanban?.andamento || 0)} tarefas abertas acompanhando sua execução.</p>
                </div>
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-5">
                  <p className="text-sm text-zinc-500">Check-in diário</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{cards?.checkinHoje ? 'Concluído' : 'Aberto'}</p>
                  <p className="mt-2 text-sm text-zinc-600">Status do check-in do dia para manter rotina e consistência.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-950">Status das tarefas</h3>
                <p className="mt-1 text-sm text-zinc-500">Distribuição atual da fila de execução.</p>
              </div>
              <Pill>{cards?.tarefasPendentes || 0} abertas</Pill>
            </div>

            <div className="mt-6 h-72">
              <canvas ref={doughnutRef} />
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                <p className="text-sm text-zinc-500">Próximo compromisso</p>
                <p className="mt-1 text-base font-semibold text-zinc-950">{proximosCompromissos[0]?.titulo || 'Nenhum compromisso futuro'}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {proximosCompromissos[0]
                    ? formatDateTime(proximosCompromissos[0].data_inicio, proximosCompromissos[0].dia_inteiro)
                    : 'Sua agenda está livre no momento.'}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                <p className="text-sm text-zinc-500">Meta de saúde da semana</p>
                <p className="mt-1 text-base font-semibold text-zinc-950">{`${Number(cards?.horasSemana || 0).toFixed(1)}h registradas`}</p>
                <p className="mt-1 text-sm text-zinc-600">{saude?.atividadesSemana || 0} atividades acumuladas até agora.</p>
              </div>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 px-6 py-5">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950">Prioridades do sistema</h3>
              <p className="mt-1 text-sm text-zinc-500">Agenda, tarefas e itens que merecem atenção imediata.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{priorityRows.length} itens visíveis</Pill>
              <Pill>{cards?.compromissosHoje || 0} hoje</Pill>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50/80 text-left text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Item</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Quando</th>
                  <th className="px-6 py-4 font-medium">Contexto</th>
                </tr>
              </thead>
              <tbody>
                {priorityRows.length ? priorityRows.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-200">
                    <td className="px-6 py-4 font-medium text-zinc-950">{row.titulo}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.tipo}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
                        {row.status === 'Concluída' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <CircleDashed className="h-3.5 w-3.5 text-zinc-500" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{row.quando}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.contexto}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                      Nenhum item prioritário encontrado para este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Agenda de hoje</p>
                <p className="text-base font-semibold text-zinc-950">{agendaHoje.length} itens na grade</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {agendaHoje.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200 px-4 py-3">
                  <p className="font-medium text-zinc-950">{item.titulo}</p>
                  <p className="mt-1 text-sm text-zinc-500">{formatDateTime(item.data_inicio, item.dia_inteiro)}</p>
                </div>
              ))}
              {!agendaHoje.length ? <p className="text-sm text-zinc-500">Nenhum compromisso para hoje.</p> : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                <ListTodo className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Execução do dia</p>
                <p className="text-base font-semibold text-zinc-950">{tarefasHoje.length} tarefas listadas</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {tarefasHoje.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200 px-4 py-3">
                  <p className="font-medium text-zinc-950">{item.descricao}</p>
                  <p className="mt-1 text-sm text-zinc-500">{`${item.status} • ${item.hora ? formatHour(item.hora) : 'Sem hora'}`}</p>
                </div>
              ))}
              {!tarefasHoje.length ? <p className="text-sm text-zinc-500">Nenhuma tarefa para hoje.</p> : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Resumo de saúde</p>
                <p className="text-base font-semibold text-zinc-950">{formatCompactNumber(saude?.caloriasSemana || 0)} kcal</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-zinc-200 px-4 py-3">
                <p className="font-medium text-zinc-950">Atividades</p>
                <p className="mt-1 text-sm text-zinc-500">{saude?.atividadesSemana || 0} registradas nesta semana</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 px-4 py-3">
                <p className="font-medium text-zinc-950">Treino acumulado</p>
                <p className="mt-1 text-sm text-zinc-500">{`${Number(cards?.horasSemana || 0).toFixed(1)} horas`}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
