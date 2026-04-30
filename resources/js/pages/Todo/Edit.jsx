import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Checkbox, Input, Label, Select, Textarea } from '@/components/ui'
import { ActionBar, FieldGrid, PageCard, PageCardContent, PageCardHeader } from '@/components/page'
import { CheckSquare } from 'lucide-react'

export default function TodoEdit({ tarefa, errors = {} }) {
  const { data, setData, put, processing } = useForm({
    data: tarefa.data,
    hora: tarefa.hora,
    descricao: tarefa.descricao,
    observacao: tarefa.observacao || '',
    urgencia: tarefa.urgencia,
    status: tarefa.status,
    concluida: tarefa.status === 'finalizado',
  })

  function submit(e) {
    e.preventDefault()
    put(`/todo/${tarefa.id}`)
  }

  return (
    <AppLayout title="Editar Tarefa">
      <PageCard>
        <PageCardHeader
          icon={CheckSquare}
          title="Editar tarefa"
          description="Atualize data, status, urgência e observações da tarefa."
        />
        <PageCardContent>
        <form onSubmit={submit} className="grid gap-6">
          <FieldGrid>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Data</Label>
            <Input type="date" value={data.data} onChange={(e) => setData('data', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Hora</Label>
            <Input type="time" value={data.hora} onChange={(e) => setData('hora', e.target.value)} />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label className="text-zinc-900">Descrição</Label>
            <Input value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label className="text-zinc-900">Observação</Label>
            <Textarea className="min-h-28" value={data.observacao} onChange={(e) => setData('observacao', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Urgência</Label>
            <Select value={data.urgencia} onChange={(e) => setData('urgencia', e.target.value)}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Status</Label>
            <Select
              value={data.status}
              onChange={(e) => {
                setData('status', e.target.value)
                setData('concluida', e.target.value === 'finalizado')
              }}
            >
              <option value="aguardando">Aguardando</option>
              <option value="execucao">Execução</option>
              <option value="finalizado">Finalizado</option>
            </Select>
          </div>
          </FieldGrid>
          <label className="inline-flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 shadow-xs">
            <Checkbox
              checked={data.concluida}
              onCheckedChange={(checked) => {
                const next = Boolean(checked)
                setData('concluida', next)
                setData('status', next ? 'finalizado' : 'aguardando')
              }}
            />
            <span>Marcar como concluída</span>
          </label>
          {Object.values(errors).length ? <div className="text-sm text-red-600 lg:col-span-2">{Object.values(errors)[0]}</div> : null}
          <ActionBar>
            <Button disabled={processing} className="w-auto">Salvar</Button>
            <Button asChild variant="outline" className="w-auto">
              <Link href={`/todo?data=${tarefa.data}`}>Cancelar</Link>
            </Button>
          </ActionBar>
        </form>
        </PageCardContent>
      </PageCard>
    </AppLayout>
  )
}
