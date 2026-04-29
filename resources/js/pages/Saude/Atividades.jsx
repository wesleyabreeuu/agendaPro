import React from 'react'
import { Link, router, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Input } from '@/components/ui'

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
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
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
              <button className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Salvar tipo</button>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Nova atividade</h2>
            <form onSubmit={(e) => { e.preventDefault(); atividadeForm.post('/saude/atividades') }} className="mt-5 grid gap-4">
              <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={atividadeForm.data.categoria_atividade_fisica_id} onChange={(e) => atividadeForm.setData('categoria_atividade_fisica_id', e.target.value)}>
                <option value="">Selecione a atividade</option>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </select>
              <Input placeholder="Descrição" value={atividadeForm.data.descricao} onChange={(e) => atividadeForm.setData('descricao', e.target.value)} />
              <Input type="date" value={atividadeForm.data.data} onChange={(e) => atividadeForm.setData('data', e.target.value)} />
              <Input type="time" value={atividadeForm.data.hora_inicio} onChange={(e) => atividadeForm.setData('hora_inicio', e.target.value)} />
              <Input type="number" min="1" placeholder="Duração em minutos" value={atividadeForm.data.duracao_minutos} onChange={(e) => atividadeForm.setData('duracao_minutos', e.target.value)} />
              <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={atividadeForm.data.intensidade} onChange={(e) => atividadeForm.setData('intensidade', e.target.value)}>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="intensa">Intensa</option>
              </select>
              <textarea className="min-h-24 rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="Notas" value={atividadeForm.data.notas} onChange={(e) => atividadeForm.setData('notas', e.target.value)} />
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar atividade</button>
            </form>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Atividades registradas</h3>
            <div className="flex gap-3">
              <Link href="/saude/calendario" className="text-sm text-zinc-600 hover:text-zinc-900">Calendário</Link>
              <Link href="/saude/relatorios" className="text-sm text-zinc-600 hover:text-zinc-900">Relatórios</Link>
            </div>
          </div>

          <div className="space-y-3">
            {atividades.data.map((atividade) => (
              <div key={atividade.id} className="rounded-2xl border border-zinc-200 p-4">
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
                      <Link href={`/saude/atividades/${atividade.id}/edit`} className="rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-700">Editar</Link>
                      <button type="button" onClick={() => router.delete(`/saude/atividades/${atividade.id}`)} className="rounded-md border border-red-200 px-3 py-2 text-xs text-red-600">Excluir</button>
                    </div>
                  </div>
                </div>
                {atividade.mapa_resumo_svg_path ? (
                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-3">
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
