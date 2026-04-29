import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Label } from '@/components/ui'

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
            <Label className="text-zinc-900">Nome</Label>
            <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
            {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
          </div>
          <div className="flex gap-3">
            <Button disabled={processing} className="h-10 w-auto rounded-md px-4">Salvar</Button>
            <Button asChild variant="outline" className="h-10 w-auto rounded-md px-4">
              <Link href="/categorias">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
