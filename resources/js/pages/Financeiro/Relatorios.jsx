import React from 'react'
import { router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'

function moeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0))
}

export default function FinanceiroRelatorios({ transacoes = [], totais, filtros, dadosPorMes = [], despesasPorCategoria = [], receitasPorCategoria = [], categorias = [], contas = [], financeiroAvancado }) {
  const form = useForm({
    ano: filtros.ano || new Date().getFullYear(),
    mes: filtros.mes || '',
    tipo: filtros.tipo || '',
    status: filtros.status || '',
    categoria: filtros.categoria || '',
  })

  function submit(e) {
    e.preventDefault()
    router.get('/financeiro/relatorios', form.data)
  }

  return (
    <AppLayout title="Relatórios Financeiros">
      <div className="space-y-6">
        <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-5">
          <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.ano} onChange={(e) => form.setData('ano', e.target.value)}>
            {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i).map((ano) => <option key={ano} value={ano}>{ano}</option>)}
          </select>
          <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.mes} onChange={(e) => form.setData('mes', e.target.value)}>
            <option value="">Todos os meses</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => <option key={mes} value={mes}>{mes}</option>)}
          </select>
          <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.tipo} onChange={(e) => form.setData('tipo', e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          {financeiroAvancado ? (
            <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="pago">Pagos</option>
              <option value="recebido">Recebidos</option>
            </select>
          ) : <div />}
          <div className="flex gap-3">
            <select className="h-10 flex-1 rounded-md border border-zinc-200 px-3 text-sm" value={form.data.categoria} onChange={(e) => form.setData('categoria', e.target.value)}>
              <option value="">Todas as categorias</option>
              {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
            </select>
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Filtrar</button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Total recebido" value={moeda(totais.receita)} />
          <Metric title="Total gasto" value={moeda(totais.despesa)} />
          <Metric title="Total pendente" value={moeda(totais.pendente)} />
          <Metric title="Resultado" value={moeda(totais.resultado)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Box title="Resumo mensal">
            <div className="space-y-3">
              {dadosPorMes.map((item) => (
                <div key={item.mes} className="grid grid-cols-4 gap-3 rounded-2xl border border-zinc-200 p-4 text-sm">
                  <span className="font-medium text-zinc-900">{item.mes}</span>
                  <span className="text-green-600">{moeda(item.receita)}</span>
                  <span className="text-red-600">{moeda(item.despesa)}</span>
                  <span className={item.resultado >= 0 ? 'text-green-600' : 'text-red-600'}>{moeda(item.resultado)}</span>
                </div>
              ))}
            </div>
          </Box>

          <Box title="Despesas por categoria">
            <div className="space-y-4">
              {despesasPorCategoria.map((item) => (
                <div key={item.categoria}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-900">{item.categoria}</span>
                    <span className="text-zinc-600">{moeda(item.valor)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${Number(totais.despesa) > 0 ? (Number(item.valor) / Number(totais.despesa)) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Box>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Box title="Receitas por categoria">
            <div className="space-y-4">
              {receitasPorCategoria.map((item) => (
                <div key={item.categoria}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-900">{item.categoria}</span>
                    <span className="text-zinc-600">{moeda(item.valor)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${Number(totais.receita) > 0 ? (Number(item.valor) / Number(totais.receita)) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Box>

          <Box title="Contas filtráveis">
            <div className="space-y-3">
              {contas.map((conta) => (
                <div key={conta.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-4">
                  <div>
                    <p className="font-medium text-zinc-950">{conta.nome}</p>
                    <p className="mt-1 text-sm text-zinc-500">{conta.instituicao || 'Sem instituição'}</p>
                  </div>
                  <p className="font-semibold text-zinc-950">{moeda(conta.saldo_atual)}</p>
                </div>
              ))}
            </div>
          </Box>
        </div>

        <Box title="Relatório detalhado de lançamentos">
          <div className="space-y-3">
            {transacoes.map((tx) => (
              <div key={tx.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-950">{tx.descricao}</p>
                    <p className="mt-1 text-sm text-zinc-500">{tx.data} • {tx.categoria?.nome || '-'} • {tx.conta?.nome || '-'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{tx.tipo}{tx.status ? ` • ${tx.status}` : ''}{tx.forma_pagamento ? ` • ${tx.forma_pagamento}` : ''}</p>
                  </div>
                  <p className={`font-semibold ${tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>{tx.tipo === 'receita' ? '+' : '-'}{moeda(tx.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </Box>
      </div>
    </AppLayout>
  )
}

function Metric({ title, value }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
    </div>
  )
}

function Box({ title, children }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
      {children}
    </div>
  )
}
