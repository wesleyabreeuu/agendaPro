import React from 'react'
import { Link, router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Select, Textarea, Input } from '@/components/ui'

export default function SaudeAtividades({ atividades, categorias = [] }) {
  const categoriaForm = useForm({
    nome: '',
    cor: '#e74c3c',
    icone: 'fas fa-dumbbell',
    caloria_leve: 4,
    caloria_moderada: 6,
    caloria_intensa: 8,
  })

  const atividadeForm = useForm({
    categoria_atividade_fisica_id: '',
    descricao: '',
    data: '',
    hora_inicio: '',
    duracao_minutos: '',
    intensidade: 'moderada',
    notas: '',
  })

  return (
    <AppLayout title="Atividades Físicas">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-card p-6 shadow-xs">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Novo tipo de atividade</h2>
            <form onSubmit={(e) => { e.preventDefault(); categoriaForm.post('/saude/categorias') }} className="mt-5 grid gap-4">
              <Input placeholder="Nome" value={categoriaForm.data.nome} onChange={(e) => categoriaForm.setData('nome', e.target.value)} />
              <Input type="color" value={categoriaForm.data.cor} onChange={(e) => categoriaForm.setData('cor', e.target.value)} />
              <Input placeholder="Ícone" value={categoriaForm.data.icone} onChange={(e) => categoriaForm.setData('icone', e.target.value)} />
              <div className="grid gap-4 md:grid-cols-3">
                <Input type="number" step="0.01" min="0" value={categoriaForm.data.caloria_leve} onChange={(e) => categoriaForm.setData('caloria_leve', e.target.value)} />
                <Input type="number" step="0.01" min="0" value={categoriaForm.data.caloria_moderada} onChange={(e) => categoriaForm.setData('caloria_moderada', e.target.value)} />
                <Input type="number" step="0.01" min="0" value={categoriaForm.data.caloria_intensa} onChange={(e) => categoriaForm.setData('caloria_intensa', e.target.value)} />
              </div>
              <Button variant="outline" className="w-auto">Salvar tipo</Button>
            </form>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-card p-6 shadow-xs">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Nova atividade</h2>
            <form onSubmit={(e) => { e.preventDefault(); atividadeForm.post('/saude/atividades') }} className="mt-5 grid gap-4">
              <Select value={atividadeForm.data.categoria_atividade_fisica_id} onChange={(e) => atividadeForm.setData('categoria_atividade_fisica_id', e.target.value)}>
                <option value="">Selecione a atividade</option>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </Select>
              <Input placeholder="Descrição" value={atividadeForm.data.descricao} onChange={(e) => atividadeForm.setData('descricao', e.target.value)} />
              <Input type="date" value={atividadeForm.data.data} onChange={(e) => atividadeForm.setData('data', e.target.value)} />
              <Input type="time" value={atividadeForm.data.hora_inicio} onChange={(e) => atividadeForm.setData('hora_inicio', e.target.value)} />
              <Input type="number" min="1" placeholder="Duração em minutos" value={atividadeForm.data.duracao_minutos} onChange={(e) => atividadeForm.setData('duracao_minutos', e.target.value)} />
              <Select value={atividadeForm.data.intensidade} onChange={(e) => atividadeForm.setData('intensidade', e.target.value)}>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="intensa">Intensa</option>
              </Select>
              <Textarea className="min-h-24" placeholder="Notas" value={atividadeForm.data.notas} onChange={(e) => atividadeForm.setData('notas', e.target.value)} />
              <Button className="w-auto">Salvar atividade</Button>
            </form>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-card p-6 shadow-xs">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Atividades registradas</h3>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm" className="w-auto">
                <Link href="/saude/calendario">Calendário</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-auto">
                <Link href="/saude/relatorios">Relatórios</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {atividades.data.map((atividade) => (
              <div key={atividade.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-950">{atividade.categoria?.nome || 'Atividade'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{atividade.descricao || '-'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{atividade.data} • {atividade.duracao_minutos} min • {atividade.intensidade}</p>
                    {atividade.fonte ? <p className="mt-1 text-xs text-zinc-400">Origem: {atividade.fonte}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-950">{atividade.calorias_queimadas} kcal</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" className="w-auto">
                        <Link href={`/saude/atividades/${atividade.id}/edit`}>Editar</Link>
                      </Button>
                      <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/saude/atividades/${atividade.id}`)}>Excluir</Button>
                    </div>
                  </div>
                </div>
                {atividade.mapa_resumo_svg_path ? (
                  <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <svg viewBox="0 0 260 96" className="h-24 w-full">
                      <path d={atividade.mapa_resumo_svg_path} fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-5 text-sm text-zinc-500">
            Página {atividades.current_page} de {atividades.last_page} • {atividades.total} registros
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
