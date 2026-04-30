import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { LayoutTemplate, Plus } from 'lucide-react'
import { Button, Card, CardContent, Input, Label, Select, Textarea } from '@/components/ui'
import { PageCard, PageCardHeader } from '@/components/page'

const boardBackgrounds = {
  violet: 'bg-[radial-gradient(circle_at_top_left,#a78bfa_0%,#818cf8_40%,#e5e7eb_100%)]',
  ocean: 'bg-[linear-gradient(135deg,#1d4ed8_0%,#0ea5e9_55%,#dbeafe_100%)]',
  sunset: 'bg-[linear-gradient(135deg,#fb923c_0%,#fdba74_50%,#ffedd5_100%)]',
  forest: 'bg-[linear-gradient(135deg,#166534_0%,#4ade80_50%,#dcfce7_100%)]',
  paper: 'bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)]',
}

export default function KanbanIndex({ boards = [], backgroundOptions = [], errors = {} }) {
  const { data, setData, post, processing, reset } = useForm({
    nome: '',
    descricao: '',
    background_style: 'violet',
  })

  function submit(e) {
    e.preventDefault()
    post('/kanban/boards', {
      onSuccess: () => reset(),
    })
  }

  return (
    <AppLayout title="Kanban">
      <div className="space-y-6">
        <PageCard>
          <PageCardHeader
            icon={LayoutTemplate}
            title="Seus quadros"
            description="Organize projetos e tarefas em listas visuais."
          />

          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/kanban/boards/${board.id}`}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-card shadow-xs transition hover:border-zinc-300"
              >
                <div className={`h-32 ${boardBackgrounds[board.background_style] || boardBackgrounds.violet}`} />
                <div className="space-y-2 p-4">
                  <h3 className="min-h-12 text-[15px] font-medium leading-6 text-zinc-950">{board.nome}</h3>
                  <p className="line-clamp-2 text-sm text-zinc-500">{board.descricao || 'Sem descrição cadastrada.'}</p>
                  <p className="pt-1 text-xs text-zinc-400">{board.listas_count} listas • {board.tarefas_count} cartões</p>
                </div>
              </Link>
            ))}

            <Card className="rounded-xl border-zinc-200 bg-zinc-50 shadow-xs">
              <CardContent className="p-4">
              <form onSubmit={submit} className="grid h-full gap-3">
                <div>
                  <h3 className="text-lg font-medium text-zinc-950">Criar novo quadro</h3>
                  <p className="mt-1 text-sm text-zinc-500">Monte um quadro no estilo Trello para organizar suas listas e cartões.</p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-zinc-900">Nome</Label>
                  <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} placeholder="Ex.: Roadmap de Produto" />
                  {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
                </div>

                <div className="grid gap-2">
                  <Label className="text-zinc-900">Descrição</Label>
                  <Textarea className="min-h-24" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} placeholder="Uma frase curta sobre o contexto do quadro" />
                </div>

                <div className="grid gap-2">
                  <Label className="text-zinc-900">Fundo</Label>
                  <Select value={data.background_style} onChange={(e) => setData('background_style', e.target.value)}>
                    {backgroundOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>

                <Button disabled={processing} className="mt-auto h-11 gap-2 rounded-xl px-4 shadow-xs">
                  <Plus className="h-4 w-4" />
                  Criar quadro
                </Button>
              </form>
              </CardContent>
            </Card>
          </CardContent>
        </PageCard>
      </div>
    </AppLayout>
  )
}
