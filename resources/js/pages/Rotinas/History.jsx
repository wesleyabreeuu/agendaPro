import React from 'react'
import { router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Select } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import { CATEGORY_OPTIONS, categoryBadgeStyle, categoryLabel, statusBadgeClass, statusLabel } from './support'

function SummaryCard({ title, value, helper, isDark = false }) {
  return (
    <div className={`rounded-xl border p-5 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
      {helper ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p> : null}
    </div>
  )
}

export default function RotinasHistory({ filters, summary, historico = [] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const form = useForm({
    data_inicio: filters.data_inicio || '',
    data_fim: filters.data_fim || '',
    status: filters.status || '',
    categoria: filters.categoria || '',
  })

  function submit(event) {
    event.preventDefault()
    router.get('/rotinas/historico', form.data, { preserveState: true, preserveScroll: true })
  }

  return (
    <AppLayout title="Histórico de Rotinas" chrome="dashboard">
      <div className="space-y-6">
        <div className={`rounded-xl border p-6 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
          <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Histórico</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Revise o que foi concluído, o que entrou no modo mínimo e o que acabou sendo pulado.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Registros" value={summary.total} helper="Execuções no período filtrado" isDark={isDark} />
          <SummaryCard title="Concluídas" value={summary.concluidas} helper="Modo normal + mínimo" isDark={isDark} />
          <SummaryCard title="Modo mínimo" value={summary.modo_minimo} helper="Concluídas com versão reduzida" isDark={isDark} />
          <SummaryCard title="Puladas" value={summary.puladas} helper="Rotinas sinalizadas para revisão" isDark={isDark} />
        </div>

        <form onSubmit={submit} className={`rounded-xl border p-6 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input type="date" value={form.data.data_inicio} onChange={(event) => form.setData('data_inicio', event.target.value)} />
            <Input type="date" value={form.data.data_fim} onChange={(event) => form.setData('data_fim', event.target.value)} />
            <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
              <option value="">Todos os status</option>
              <option value="concluida">Concluídas</option>
              <option value="pulada">Puladas</option>
              <option value="pendente">Pendentes</option>
            </Select>
            <Select value={form.data.categoria} onChange={(event) => form.setData('categoria', event.target.value)}>
              <option value="">Todas as categorias</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="h-10 w-auto rounded-xl px-4">Aplicar filtros</Button>
            <Button type="button" onClick={() => router.get('/rotinas/historico')} variant="outline" className={`h-10 w-auto rounded-xl px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : ''}`}>Limpar</Button>
          </div>
        </form>

        <div className="space-y-5">
          {historico.map((grupo) => (
            <section key={grupo.data} className={`rounded-xl border p-5 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
              <div className="flex items-center justify-between gap-4">
                <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{grupo.data_formatada}</h2>
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{grupo.items.length} registro(s)</span>
              </div>

              <div className="mt-4 space-y-3">
                {grupo.items.map((item) => (
                  <div key={item.id} className={`rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.rotina}</p>
                          <span className="rounded-full border px-2.5 py-1 text-xs font-medium" style={categoryBadgeStyle(item.categoria, isDark)}>{categoryLabel(item.categoria)}</span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(item.status, isDark)}`}>{statusLabel(item.status)}{item.modo_usado === 'minimo' ? ' • mínimo' : ''}</span>
                        </div>
                        {item.observacao ? <p className={`mt-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.observacao}</p> : null}
                      </div>
                      <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.atualizado_em}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {!historico.length ? (
            <div className={`rounded-xl border border-dashed px-6 py-12 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
              Nenhum registro encontrado para o período selecionado.
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
