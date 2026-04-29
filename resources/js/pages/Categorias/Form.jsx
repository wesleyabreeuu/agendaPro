import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Input } from '@/components/ui'

export default function CategoriasForm({ categoria = null, errors = {} }) {
  const editing = Boolean(categoria?.id)
  const { data, setData, post, put, processing } = useForm({
    nome: categoria?.nome || '',
  })

  function submit(e) {
    e.preventDefault()
    if (editing) put(`/categorias/${categoria.id}`)
    else post('/categorias')
  }

  return (
    <AppLayout title={editing ? 'Editar Categoria' : 'Nova Categoria'}>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">Nome</label>
            <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
            {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
          </div>
          <div className="flex gap-3">
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar</button>
            <Link href="/categorias" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
