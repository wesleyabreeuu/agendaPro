import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { LayoutTemplate, Plus } from 'lucide-react'
import { Input, Select, Textarea } from '@/components/ui'

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
        <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="h-5 w-5 text-zinc-700" />
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Seus quadros</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/kanban/boards/${board.id}`}
                className="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`h-32 ${boardBackgrounds[board.background_style] || boardBackgrounds.violet}`} />
                <div className="space-y-2 p-4">
                  <h3 className="min-h-12 text-[15px] font-medium leading-6 text-zinc-950">{board.nome}</h3>
                  <p className="line-clamp-2 text-sm text-zinc-500">{board.descricao || 'Sem descrição cadastrada.'}</p>
                  <p className="pt-1 text-xs text-zinc-400">{board.listas_count} listas • {board.tarefas_count} cartões</p>
                </div>
              </Link>
            ))}

            <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
              <form onSubmit={submit} className="grid h-full gap-3">
                <div>
                  <h3 className="text-lg font-medium text-zinc-950">Criar novo quadro</h3>
                  <p className="mt-1 text-sm text-zinc-500">Monte um quadro no estilo Trello para organizar suas listas e cartões.</p>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Nome</label>
                  <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} placeholder="Ex.: Roadmap de Produto" />
                  {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Descrição</label>
                  <Textarea className="min-h-24" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} placeholder="Uma frase curta sobre o contexto do quadro" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-900">Fundo</label>
                  <Select value={data.background_style} onChange={(e) => setData('background_style', e.target.value)}>
                    {backgroundOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>

                <button disabled={processing} className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                  <Plus className="h-4 w-4" />
                  Criar quadro
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
