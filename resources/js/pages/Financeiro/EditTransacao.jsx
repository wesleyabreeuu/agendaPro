import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui'

export default function FinanceiroEditTransacao({ transacao, categorias = [], contas = [], financeiroAvancado }) {
  const form = useForm({
    tipo: transacao.tipo || 'despesa',
    status: transacao.status || '',
    forma_pagamento: transacao.forma_pagamento || '',
    descricao: transacao.descricao || '',
    complemento: transacao.complemento || '',
    valor: transacao.valor || '',
    categoria_financeira_id: transacao.categoria_financeira_id || '',
    conta_bancaria_id: transacao.conta_bancaria_id || '',
    data: transacao.data || '',
    recorrente: transacao.recorrente || false,
    frequencia: transacao.frequencia || '',
    observacoes: transacao.observacoes || '',
  })

  const categoriasFiltradas = categorias.filter((categoria) => categoria.tipo === form.data.tipo)

  function submit(e) {
    e.preventDefault()
    form.put(`/financeiro/transacoes/${transacao.id}`)
  }

  return (
    <AppLayout title="Editar Lançamento">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-3">
            <Select value={form.data.tipo} onChange={(e) => form.setData('tipo', e.target.value)}>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </Select>
            {financeiroAvancado ? (
              <Select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                {form.data.tipo === 'receita' ? (
                  <>
                    <option value="recebido">Recebido</option>
                    <option value="pendente">Pendente</option>
                  </>
                ) : (
                  <>
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </>
                )}
              </Select>
            ) : null}
            <Select value={form.data.forma_pagamento} onChange={(e) => form.setData('forma_pagamento', e.target.value)}>
              <option value="">Selecione a forma</option>
              <option value="conta">Saldo da conta</option>
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
            </Select>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
            <Input placeholder="Descrição" value={form.data.descricao} onChange={(e) => form.setData('descricao', e.target.value)} />
            <Input type="number" step="0.01" value={form.data.valor} onChange={(e) => form.setData('valor', e.target.value)} />
          </div>

          <Input placeholder="Complemento" value={form.data.complemento} onChange={(e) => form.setData('complemento', e.target.value)} />

          <div className="grid gap-5 md:grid-cols-2">
            <Select value={form.data.categoria_financeira_id} onChange={(e) => form.setData('categoria_financeira_id', e.target.value)}>
              {categoriasFiltradas.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
            </Select>
            <Select value={form.data.conta_bancaria_id} onChange={(e) => form.setData('conta_bancaria_id', e.target.value)}>
              {contas.map((conta) => <option key={conta.id} value={conta.id}>{conta.nome}</option>)}
            </Select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input type="date" value={form.data.data} onChange={(e) => form.setData('data', e.target.value)} />
            <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
              <Checkbox checked={form.data.recorrente} onCheckedChange={(checked) => form.setData('recorrente', Boolean(checked))} />
              <span>Lançamento recorrente</span>
            </label>
          </div>

          {form.data.recorrente ? (
            <Select value={form.data.frequencia} onChange={(e) => form.setData('frequencia', e.target.value)}>
              <option value="mensal">Mensal</option>
              <option value="semanal">Semanal</option>
              <option value="diaria">Diária</option>
            </Select>
          ) : null}

          <Textarea className="min-h-28" placeholder="Observações" value={form.data.observacoes} onChange={(e) => form.setData('observacoes', e.target.value)} />

          <div className="flex gap-3">
            <Button className="w-auto">Salvar alterações</Button>
            <Link href="/financeiro/transacoes" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
