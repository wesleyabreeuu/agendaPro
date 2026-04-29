import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Input } from '@/components/ui'

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
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">Nome</label>
            <Input value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
            {errors.nome ? <p className="text-sm text-red-600">{errors.nome}</p> : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">Slug</label>
            <Input value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
            {errors.slug ? <p className="text-sm text-red-600">{errors.slug}</p> : null}
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-sm font-medium text-zinc-900">Descrição</label>
            <textarea className="min-h-28 rounded-md border border-zinc-200 px-3 py-2 text-sm" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} />
          </div>
          <div className="grid gap-3 lg:col-span-2">
            {checks.map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-3 text-sm text-zinc-700">
                <input type="checkbox" checked={data[key]} onChange={(e) => setData(key, e.target.checked)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 lg:col-span-2">
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar</button>
            <Link href="/regras" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
