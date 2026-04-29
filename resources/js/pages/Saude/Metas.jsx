import React from 'react'
import { router, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Input, Select } from '@/components/ui'

export default function SaudeMetas({ metas = [] }) {
  const form = useForm({
    titulo: '',
    tipo: 'horas_semanais',
    valor_alvo: '',
    periodo: 'semanal',
  })

  return (
    <AppLayout title="Metas de Saúde">
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Nova meta</h2>
          <form onSubmit={(e) => { e.preventDefault(); form.post('/saude/metas') }} className="mt-5 grid gap-4">
            <Input placeholder="Título da meta" value={form.data.titulo} onChange={(e) => form.setData('titulo', e.target.value)} />
            <Select value={form.data.tipo} onChange={(e) => form.setData('tipo', e.target.value)}>
              <option value="horas_semanais">Horas por semana</option>
              <option value="calorias_semana">Calorias por semana</option>
              <option value="dias_semana">Dias por semana</option>
              <option value="sessoes_mes">Sessões por mês</option>
            </Select>
            <Input type="number" min="1" placeholder="Valor alvo" value={form.data.valor_alvo} onChange={(e) => form.setData('valor_alvo', e.target.value)} />
            <Select value={form.data.periodo} onChange={(e) => form.setData('periodo', e.target.value)}>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </Select>
            <Button className="w-auto">Criar meta</Button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {metas.map((meta) => (
            <div key={meta.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-950">{meta.titulo}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{meta.tipo} • {meta.periodo}</p>
                </div>
                <Badge variant={meta.ativa ? 'success' : 'secondary'}>{meta.ativa ? 'Ativa' : 'Inativa'}</Badge>
              </div>
              <p className="mt-4 text-sm text-zinc-600">Meta: {meta.valor_alvo}</p>
              <Button type="button" variant="destructive" className="mt-5 w-auto" onClick={() => router.delete(`/saude/metas/${meta.id}`)}>Remover</Button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
