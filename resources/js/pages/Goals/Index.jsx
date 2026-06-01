import React from 'react'
import { Link, router } from '@inertiajs/react'
import { CalendarClock, Flag, Plus, Search, Target, Trophy } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Progress, Select } from '@/components/ui'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { useTheme } from '../../contexts/ThemeContext'
import { panelClass, percent, statusClass, STATUS_LABELS, TYPE_LABELS } from './support'

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

export default function GoalsIndex({ goals = [], filters = {}, summary = {}, options = {} }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const form = useForm({
    search: filters.search || '',
    status: filters.status || '',
    tipo_meta: filters.tipo_meta || '',
  })

  function submit(event) {
    event.preventDefault()
    router.get('/goals', form.data, { preserveState: true, preserveScroll: true })
  }

  function reset() {
    form.setData({ search: '', status: '', tipo_meta: '' })
    router.get('/goals', {}, { preserveState: true, preserveScroll: true })
  }

  return (
    <AppLayout title="Objetivos" chrome="dashboard">
      <div className="space-y-6">
        <section className={panelClass(isDark)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm uppercase tracking-[0.22em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Goals</p>
              <h1 className={`mt-2 text-3xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Objetivos acompanháveis</h1>
              <p className={`mt-2 max-w-3xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Transforme projetos pessoais de longo prazo em metas, marcos, hábitos vinculados e indicadores de evolução.
              </p>
            </div>
            <Button asChild className="h-11 w-auto gap-2 rounded-xl px-4">
              <Link href="/goals/criar"><Plus className="h-4 w-4" />Novo objetivo</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Target} title="Total" value={summary.total || 0} helper="Objetivos cadastrados" isDark={isDark} />
          <Metric icon={CalendarClock} title="Em andamento" value={summary.em_andamento || 0} helper="Projetos ativos" isDark={isDark} />
          <Metric icon={Trophy} title="Concluídos" value={summary.concluidos || 0} helper="Sonhos realizados" isDark={isDark} />
          <Metric icon={Flag} title="Com rotinas" value={summary.com_rotinas || 0} helper="Hábitos vinculados" isDark={isDark} />
        </div>

        <form onSubmit={submit} className={panelClass(isDark)}>
          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto]">
            <div className="relative">
              <Search className={`pointer-events-none absolute top-3 left-3 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <Input className="pl-9" placeholder="Buscar objetivo" value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} />
            </div>
            <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
              <option value="">Todos os status</option>
              {(options.statuses || []).map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
            </Select>
            <Select value={form.data.tipo_meta} onChange={(event) => form.setData('tipo_meta', event.target.value)}>
              <option value="">Todos os tipos</option>
              {(options.types || []).map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}
            </Select>
            <div className="flex gap-2">
              <Button className="h-10 w-auto rounded-xl px-4">Filtrar</Button>
              <Button type="button" variant="outline" onClick={reset} className={`h-10 w-auto rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}>Limpar</Button>
            </div>
          </div>
        </form>

        <div className="grid gap-5 xl:grid-cols-2">
          {goals.map((goal) => (
            <Link key={goal.id} href={`/goals/${goal.id}`} className={`${panelClass(isDark)} block transition hover:-translate-y-0.5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-white" style={{ backgroundColor: goal.cor || '#18181b' }}>
                      {goal.icone || '◎'}
                    </span>
                    <div>
                      <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{goal.titulo}</h2>
                      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{goal.categoria || TYPE_LABELS[goal.tipo_meta] || 'Objetivo pessoal'}</p>
                    </div>
                  </div>
                  <p className={`mt-4 line-clamp-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{goal.descricao || 'Sem descrição.'}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(goal.status, isDark)}`}>{STATUS_LABELS[goal.status]}</span>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Conclusão</span>
                  <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{percent(goal.percentual_conclusao)}</span>
                </div>
                <Progress value={Math.min(goal.percentual_conclusao || 0, 100)} className="h-2" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Mini label="Meta" value={goal.data_meta || '-'} isDark={isDark} />
                <Mini label="Dias restantes" value={goal.dias_restantes ?? '-'} isDark={isDark} />
                <Mini label="Próximo marco" value={goal.proximo_marco?.titulo || 'Sem marco'} isDark={isDark} />
              </div>
            </Link>
          ))}
        </div>

        {!goals.length ? (
          <div className={`rounded-xl border border-dashed px-6 py-14 text-center ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
            Nenhum objetivo encontrado.
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}

function Mini({ label, value, isDark }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
      <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{label}</p>
      <p className={`mt-1 truncate text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
    </div>
  )
}
