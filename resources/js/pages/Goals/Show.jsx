import React from 'react'
import { Link, router } from '@inertiajs/react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ArrowLeft, CalendarClock, Dumbbell, Edit, Flag, Gauge, Plus, Route, Scale, Target, Trophy } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { Button, Checkbox, Input, Progress, Select, Textarea } from '@/components/ui'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { useTheme } from '../../contexts/ThemeContext'
import { innerClass, number, panelClass, percent, PROGRESS_TYPE_LABELS, statusClass, STATUS_LABELS, TYPE_LABELS } from './support'

const chartConfig = {
  valor: { label: 'Valor', color: '#2563eb' },
}

export default function GoalShow({ goal, options = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const progressForm = useForm({
    data: new Date().toISOString().slice(0, 10),
    descricao: '',
    valor: '',
    tipo: goal.tipo_meta === 'personalizado' ? 'personalizado' : goal.tipo_meta,
    observacoes: '',
  })

  function submitProgress(event) {
    event.preventDefault()
    progressForm.post(`/goals/${goal.id}/progress`, {
      preserveScroll: true,
      onSuccess: () => progressForm.setData({
        data: new Date().toISOString().slice(0, 10),
        descricao: '',
        valor: '',
        tipo: progressForm.data.tipo,
        observacoes: '',
      }),
    })
  }

  function toggleMilestone(milestone) {
    router.patch(`/goals/${goal.id}/milestones/${milestone.id}`, { concluido: !milestone.concluido }, { preserveScroll: true })
  }

  const indicators = goal.indicadores || {}

  return (
    <AppLayout title={goal.titulo} chrome="dashboard">
      <div className="space-y-6">
        <section className={panelClass(isDark)}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Button asChild variant="outline" className={`mb-4 h-10 w-auto gap-2 rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}>
                <Link href="/goals"><ArrowLeft className="h-4 w-4" />Objetivos</Link>
              </Button>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg text-xl text-white" style={{ backgroundColor: goal.cor || '#18181b' }}>{goal.icone || '◎'}</span>
                <div>
                  <h1 className={`text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{goal.titulo}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(goal.status, isDark)}`}>{STATUS_LABELS[goal.status]}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>{TYPE_LABELS[goal.tipo_meta]}</span>
                    {goal.categoria ? <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>{goal.categoria}</span> : null}
                  </div>
                </div>
              </div>
              <p className={`mt-4 max-w-4xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{goal.descricao || 'Sem descrição.'}</p>
            </div>
            <Button asChild className="h-11 w-auto gap-2 rounded-xl px-4"><Link href={`/goals/${goal.id}/editar`}><Edit className="h-4 w-4" />Editar</Link></Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Target} title="Conclusão" value={percent(indicators.percentual_conclusao || 0)} helper="Cálculo por marcos e meta principal" isDark={isDark} />
          <Metric icon={CalendarClock} title="Dias restantes" value={indicators.dias_restantes ?? '-'} helper={`${indicators.dias_decorridos || 0} dias decorridos`} isDark={isDark} />
          <Metric icon={Route} title="Km acumulados" value={`${number(indicators.quilometragem_acumulada, 1)} km`} helper={`Maior pedal: ${number(indicators.maior_pedal, 1)} km`} isDark={isDark} />
          <Metric icon={Dumbbell} title="Treinos" value={indicators.treinos_realizados || 0} helper={`${indicators.quantidade_registros || 0} registros totais`} isDark={isDark} />
          <Metric icon={Scale} title="Peso atual" value={indicators.peso_atual ? `${number(indicators.peso_atual, 1)} kg` : '-'} helper={indicators.peso_perdido !== null ? `${number(indicators.peso_perdido, 1)} kg perdidos` : 'Sem registro de peso'} isDark={isDark} />
          <Metric icon={Gauge} title="Maior valor" value={number(indicators.maior_valor_registrado, 1)} helper="Pico entre todos os registros" isDark={isDark} />
          <Metric icon={Flag} title="Sequência atual" value={indicators.sequencia_atual_dias || 0} helper="Dias seguidos com progresso" isDark={isDark} />
          <Metric icon={Trophy} title="Melhor sequência" value={indicators.melhor_sequencia || 0} helper="Melhor consistência registrada" isDark={isDark} />
        </div>

        <section className={panelClass(isDark)}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Percentual de conclusão</span>
            <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{percent(indicators.percentual_conclusao || 0)}</span>
          </div>
          <Progress value={Math.min(indicators.percentual_conclusao || 0, 100)} className="h-3" />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className={panelClass(isDark)}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Histórico de evolução</h2>
            <ChartContainer config={chartConfig} className="mt-5 h-[320px] w-full">
              <LineChart data={goal.chartData || []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="data" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="valor" stroke="var(--color-valor)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </section>

          <section className={panelClass(isDark)}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Registrar progresso</h2>
            <form onSubmit={submitProgress} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input type="date" value={progressForm.data.data} onChange={(event) => progressForm.setData('data', event.target.value)} required />
                <Select value={progressForm.data.tipo} onChange={(event) => progressForm.setData('tipo', event.target.value)}>
                  {(options.progressTypes || []).map((type) => <option key={type} value={type}>{PROGRESS_TYPE_LABELS[type] || type}</option>)}
                </Select>
              </div>
              <Input placeholder="Descrição" value={progressForm.data.descricao} onChange={(event) => progressForm.setData('descricao', event.target.value)} required />
              <Input type="number" step="0.01" placeholder="Valor" value={progressForm.data.valor} onChange={(event) => progressForm.setData('valor', event.target.value)} />
              <Textarea rows={4} placeholder="Observações" value={progressForm.data.observacoes} onChange={(event) => progressForm.setData('observacoes', event.target.value)} />
              <Button className="h-10 w-auto gap-2 rounded-xl px-4"><Plus className="h-4 w-4" />Adicionar registro</Button>
            </form>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className={panelClass(isDark)}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Marcos</h2>
            <div className="mt-5 space-y-3">
              {goal.milestones.map((milestone) => (
                <button key={milestone.id} type="button" onClick={() => toggleMilestone(milestone)} className={`${innerClass(isDark)} flex w-full items-start gap-3 text-left`}>
                  <Checkbox checked={milestone.concluido} tabIndex={-1} />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{milestone.titulo}</span>
                    <span className={`mt-1 block text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{milestone.descricao || (milestone.meta_valor ? `Meta: ${number(milestone.meta_valor, 1)}` : 'Sem descrição')}</span>
                  </span>
                  {milestone.concluido_em ? <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{milestone.concluido_em}</span> : null}
                </button>
              ))}
              {!goal.milestones.length ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nenhum marco cadastrado.</p> : null}
            </div>
          </section>

          <section className={panelClass(isDark)}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Timeline</h2>
            <div className="mt-5 space-y-3">
              {goal.progress.map((item) => (
                <div key={item.id} className={`${innerClass(isDark)} border-l-4`} style={{ borderLeftColor: goal.cor || '#2563eb' }}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.descricao}</p>
                      <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.data} • {PROGRESS_TYPE_LABELS[item.tipo] || item.tipo}</p>
                      {item.observacoes ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.observacoes}</p> : null}
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>{number(item.valor, 1)}</span>
                  </div>
                </div>
              ))}
              {!goal.progress.length ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nenhum progresso registrado.</p> : null}
            </div>
          </section>
        </div>

        <section className={panelClass(isDark)}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Hábitos vinculados</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {goal.rotinas.map((rotina) => (
              <div key={rotina.id} className={innerClass(isDark)}>
                <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.nome}</p>
                <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{rotina.categoria}</p>
              </div>
            ))}
            {!goal.rotinas.length ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nenhuma rotina vinculada.</p> : null}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

function Metric({ icon: Icon, title, value, helper, isDark }) {
  return (
    <div className={panelClass(isDark)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
          <p className={`mt-3 text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
          <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
