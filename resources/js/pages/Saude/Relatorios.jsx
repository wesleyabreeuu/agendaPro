import React from 'react'
import { router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Select } from '@/components/ui'

export default function SaudeRelatorios({ resumo, topAtividades = [], periodo, ano }) {
  const form = useForm({
    periodo: periodo || 'mes',
    ano: ano || new Date().getFullYear(),
  })

  return (
    <AppLayout title="Relatórios de Saúde">
      <div className="space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); router.get('/saude/relatorios', form.data) }} className="flex gap-3 rounded-xl border border-zinc-200 bg-card p-6 shadow-xs">
          <Select value={form.data.periodo} onChange={(e) => form.setData('periodo', e.target.value)}>
            <option value="mes">Este mês</option>
            <option value="trimestre">Este trimestre</option>
            <option value="ano">Este ano</option>
          </Select>
          <Select value={form.data.ano} onChange={(e) => form.setData('ano', e.target.value)}>
            {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i).map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Button className="h-10 rounded-md px-4">Atualizar</Button>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Total de horas" value={`${Number(resumo.total_horas).toFixed(1)}h`} />
          <Metric title="Calorias queimadas" value={`${resumo.total_calorias}`} />
          <Metric title="Sessões" value={String(resumo.total_sessoes)} />
          <Metric title="Dias com atividade" value={String(resumo.dias_com_atividade)} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-card p-6 shadow-xs">
          <h3 className="mb-5 text-lg font-semibold tracking-tight text-zinc-950">Top atividades</h3>
          <div className="space-y-3">
            {topAtividades.map((atividade) => (
              <div key={atividade.categoria} className="grid grid-cols-4 gap-3 rounded-lg border border-zinc-200 p-4 text-sm">
                <span className="font-medium text-zinc-900">{atividade.categoria}</span>
                <span className="text-zinc-600">{atividade.sessoes} sessões</span>
                <span className="text-zinc-600">{Number(atividade.horas).toFixed(1)}h</span>
                <span className="text-zinc-600">{atividade.calorias} kcal</span>
              </div>
            ))}
            {topAtividades.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma atividade registrada.</p> : null}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Metric({ title, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-card p-5 shadow-xs">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
    </div>
  )
}
