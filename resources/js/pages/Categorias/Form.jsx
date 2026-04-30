import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Label } from '@/components/ui'
import { ActionBar, FieldGrid, PageCard, PageCardContent, PageCardHeader } from '@/components/page'
import { Tags } from 'lucide-react'

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
      <PageCard>
        <PageCardHeader
          icon={Tags}
          title={editing ? 'Editar categoria' : 'Nova categoria'}
          description="Defina o nome usado para organizar compromissos e lembretes."
        />
        <PageCardContent>
        <form onSubmit={submit} className="grid gap-6">
          <FieldGrid>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Nome</Label>
            <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
            {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
          </div>
          </FieldGrid>
          <ActionBar>
            <Button disabled={processing} className="w-auto">Salvar</Button>
            <Button asChild variant="outline" className="h-10 w-auto rounded-md px-4">
              <Link href="/categorias">Cancelar</Link>
            </Button>
          </ActionBar>
        </form>
        </PageCardContent>
      </PageCard>
    </AppLayout>
  )
}
