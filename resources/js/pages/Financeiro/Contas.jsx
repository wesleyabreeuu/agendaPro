import React from 'react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Select } from '@/components/ui'

function moeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0))
}

export default function FinanceiroContas({ contas = [] }) {
  const contaForm = useForm({
    nome: '',
    instituicao: '',
    tipo: 'bancaria',
    saldo_inicial: 0,
  })

  function submitConta(e) {
    e.preventDefault()
    contaForm.post('/financeiro/contas')
  }

  return (
    <AppLayout title="Contas e Carteiras">
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6 shadow-xs">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Nova conta</h2>
          <form onSubmit={submitConta} className="mt-5 grid gap-4">
            <Input placeholder="Nome" value={contaForm.data.nome} onChange={(e) => contaForm.setData('nome', e.target.value)} />
            <Input placeholder="Banco / instituição" value={contaForm.data.instituicao} onChange={(e) => contaForm.setData('instituicao', e.target.value)} />
            <Select value={contaForm.data.tipo} onChange={(e) => contaForm.setData('tipo', e.target.value)}>
              <option value="bancaria">Conta bancária</option>
              <option value="cartao">Cartão</option>
              <option value="dinheiro">Carteira / Dinheiro</option>
            </Select>
            <Input type="number" step="0.01" value={contaForm.data.saldo_inicial} onChange={(e) => contaForm.setData('saldo_inicial', e.target.value)} />
            <Button className="h-10 rounded-md px-4">Salvar conta</Button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contas.map((conta) => (
            <ContaCard key={conta.id} conta={conta} />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

function ContaCard({ conta }) {
  const depositoForm = useForm({ valor: '' })

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">{conta.nome}</h3>
          <p className="mt-1 text-sm text-zinc-500">{conta.instituicao || 'Sem banco/instituição'} • {conta.tipo}</p>
        </div>
        <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700">{conta.ativa ? 'Ativa' : 'Inativa'}</span>
      </div>
      <div className="mt-5 space-y-1">
        <p className="text-sm text-zinc-500">Saldo atual</p>
        <p className="text-2xl font-semibold tracking-tight text-zinc-950">{moeda(conta.saldo_atual)}</p>
        <p className="text-sm text-zinc-500">Saldo inicial: {moeda(conta.saldo_inicial)}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          depositoForm.post(`/financeiro/contas/${conta.id}/deposito`)
        }}
        className="mt-5 grid gap-3"
      >
        <Input type="number" step="0.01" min="0.01" placeholder="Valor do depósito" value={depositoForm.data.valor} onChange={(e) => depositoForm.setData('valor', e.target.value)} />
        <Button variant="outline" className="h-10 rounded-md px-4">Registrar depósito</Button>
      </form>
    </div>
  )
}
