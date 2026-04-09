import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Input } from '../../components/ui'

export default function SaudeEditAtividade({ atividade, categorias = [] }) {
  const form = useForm({
    categoria_atividade_fisica_id: atividade.categoria_atividade_fisica_id || '',
    descricao: atividade.descricao || '',
    data: atividade.data || '',
    hora_inicio: atividade.hora_inicio || '',
    duracao_minutos: atividade.duracao_minutos || '',
    intensidade: atividade.intensidade || 'moderada',
    notas: atividade.notas || '',
  })

  return (
    <AppLayout title="Editar Atividade">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); form.put(`/saude/atividades/${atividade.id}`) }} className="grid gap-5">
          <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.categoria_atividade_fisica_id} onChange={(e) => form.setData('categoria_atividade_fisica_id', e.target.value)}>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
          </select>
          <Input placeholder="Descrição" value={form.data.descricao} onChange={(e) => form.setData('descricao', e.target.value)} />
          <div className="grid gap-5 md:grid-cols-2">
            <Input type="date" value={form.data.data} onChange={(e) => form.setData('data', e.target.value)} />
            <Input type="time" value={form.data.hora_inicio} onChange={(e) => form.setData('hora_inicio', e.target.value)} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Input type="number" min="1" value={form.data.duracao_minutos} onChange={(e) => form.setData('duracao_minutos', e.target.value)} />
            <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.intensidade} onChange={(e) => form.setData('intensidade', e.target.value)}>
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="intensa">Intensa</option>
            </select>
          </div>
          <textarea className="min-h-28 rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="Notas" value={form.data.notas} onChange={(e) => form.setData('notas', e.target.value)} />
          <div className="flex gap-3">
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar alterações</button>
            <Link href="/saude/atividades" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
