import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Checkbox, Input, Label, Textarea } from '@/components/ui'
import { ActionBar, FieldGrid, PageCard, PageCardContent, PageCardHeader } from '@/components/page'
import { ShieldCheck } from 'lucide-react'

export default function RegrasForm({ regra, errors = {} }) {
  const editing = Boolean(regra?.id)
  const { data, setData, post, put, processing } = useForm({
    nome: regra?.nome || '',
    slug: regra?.slug || '',
    descricao: regra?.descricao || '',
    acesso_compromissos: Boolean(regra?.acesso_compromissos),
    acesso_dia_a_dia: Boolean(regra?.acesso_dia_a_dia),
    acesso_projetos: Boolean(regra?.acesso_projetos),
    acesso_financeiro: Boolean(regra?.acesso_financeiro),
    acesso_saude: Boolean(regra?.acesso_saude),
  })

  function submit(e) {
    e.preventDefault()
    if (editing) put(`/regras/${regra.id}`)
    else post('/regras')
  }

  const checks = [
    ['acesso_compromissos', 'Compromissos'],
    ['acesso_dia_a_dia', 'Dia a dia'],
    ['acesso_projetos', 'Projetos'],
    ['acesso_financeiro', 'Controle financeiro'],
    ['acesso_saude', 'Saúde e fitness'],
  ]

  return (
    <AppLayout title={editing ? 'Editar Regra' : 'Nova Regra'}>
      <PageCard>
        <PageCardHeader
          icon={ShieldCheck}
          title={editing ? 'Editar regra' : 'Nova regra'}
          description="Configure permissões por área do sistema."
        />
        <PageCardContent>
        <form onSubmit={submit} className="grid gap-6">
          <FieldGrid>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Nome</Label>
            <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
            {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-900">Slug</Label>
            <Input value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
            {errors.slug ? <p className="text-sm text-red-600">{errors.slug}</p> : null}
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label className="text-zinc-900">Descrição</Label>
            <Textarea className="min-h-28" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} />
          </div>
          </FieldGrid>
          <div className="grid gap-3 lg:col-span-2">
            {checks.map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                <Checkbox checked={data[key]} onCheckedChange={(checked) => setData(key, Boolean(checked))} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <ActionBar>
            <Button disabled={processing} className="w-auto">Salvar</Button>
            <Button asChild variant="outline" className="w-auto">
              <Link href="/regras">Cancelar</Link>
            </Button>
          </ActionBar>
        </form>
        </PageCardContent>
      </PageCard>
    </AppLayout>
  )
}
