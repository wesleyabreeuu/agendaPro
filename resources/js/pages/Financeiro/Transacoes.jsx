import React from 'react'
import { Link, router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Checkbox, Input, Select, Textarea } from '@/components/ui'

function moeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0))
}

export default function FinanceiroTransacoes({ transacoes, categorias = [], contas = [], resumo, filters, financeiroAvancado }) {
  const filterForm = useForm({
    tipo: filters.tipo || '',
    status: filters.status || '',
    categoria: filters.categoria || '',
    conta: filters.conta || '',
    mes: filters.mes || '',
  })

  const transacaoForm = useForm({
    tipo: 'despesa',
    status: financeiroAvancado ? 'pago' : '',
    descricao: '',
    complemento: '',
    valor: '',
    categoria_financeira_id: categorias.find((categoria) => categoria.tipo === 'despesa')?.id || '',
    conta_bancaria_id: contas[0]?.id || '',
    forma_pagamento: 'conta',
    data: new Date().toISOString().slice(0, 10),
    recorrente: false,
    frequencia: '',
    observacoes: '',
  })

  const categoriaForm = useForm({
    tipo: 'receita',
    nome: '',
    cor: '#3498db',
    icone: 'fas fa-tag',
  })

  function submitFilter(e) {
    e.preventDefault()
    router.get('/financeiro/transacoes', filterForm.data)
  }

  function submitTransacao(e) {
    e.preventDefault()
    transacaoForm.post('/financeiro/transacoes', {
      preserveScroll: true,
      onSuccess: () => transacaoForm.setData({
        tipo: 'despesa',
        status: financeiroAvancado ? 'pago' : '',
        descricao: '',
        complemento: '',
        valor: '',
        categoria_financeira_id: categorias.find((categoria) => categoria.tipo === 'despesa')?.id || '',
        conta_bancaria_id: contas[0]?.id || '',
        forma_pagamento: 'conta',
        data: new Date().toISOString().slice(0, 10),
        recorrente: false,
        frequencia: '',
        observacoes: '',
      }),
    })
  }

  function submitCategoria(e) {
    e.preventDefault()
    categoriaForm.post('/financeiro/categorias')
  }

  const categoriasFiltradas = categorias.filter((categoria) => !transacaoForm.data.tipo || categoria.tipo === transacaoForm.data.tipo)

  function updateTipoTransacao(tipo) {
    transacaoForm.setData((data) => ({
      ...data,
      tipo,
      status: !financeiroAvancado ? data.status : (tipo === 'receita' ? 'recebido' : 'pago'),
      categoria_financeira_id: categorias.find((categoria) => categoria.tipo === tipo)?.id || '',
    }))
  }

  return (
    <AppLayout title="Lançamentos Financeiros">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Recebido" value={moeda(resumo.recebido)} />
          <Metric title="Pago" value={moeda(resumo.gasto)} />
          <Metric title="Pendente" value={moeda(resumo.pendente)} />
          <Metric title="Resultado" value={moeda(resumo.resultado)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Box title="Filtros">
              <form onSubmit={submitFilter} className="grid gap-4">
                <Select value={filterForm.data.tipo} onChange={(e) => filterForm.setData('tipo', e.target.value)}>
                  <option value="">Todos os tipos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </Select>
                {financeiroAvancado ? (
                  <Select value={filterForm.data.status} onChange={(e) => filterForm.setData('status', e.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="pago">Pagos</option>
                    <option value="recebido">Recebidos</option>
                  </Select>
                ) : null}
                <Select value={filterForm.data.categoria} onChange={(e) => filterForm.setData('categoria', e.target.value)}>
                  <option value="">Todas as categorias</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
                </Select>
                <Select value={filterForm.data.conta} onChange={(e) => filterForm.setData('conta', e.target.value)}>
                  <option value="">Todas as contas</option>
                  {contas.map((conta) => <option key={conta.id} value={conta.id}>{conta.nome}</option>)}
                </Select>
                <Input type="month" value={filterForm.data.mes} onChange={(e) => filterForm.setData('mes', e.target.value)} />
                <Button className="w-auto">Filtrar</Button>
              </form>
            </Box>

            <Box title="Nova categoria">
              <form onSubmit={submitCategoria} className="grid gap-4">
                <Select value={categoriaForm.data.tipo} onChange={(e) => categoriaForm.setData('tipo', e.target.value)}>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </Select>
                <Input placeholder="Nome" value={categoriaForm.data.nome} onChange={(e) => categoriaForm.setData('nome', e.target.value)} />
                <Input type="color" value={categoriaForm.data.cor} onChange={(e) => categoriaForm.setData('cor', e.target.value)} />
                <Input placeholder="Ícone" value={categoriaForm.data.icone} onChange={(e) => categoriaForm.setData('icone', e.target.value)} />
                <Button variant="outline" className="w-auto">Salvar categoria</Button>
              </form>
            </Box>

            <Box title="Novo lançamento">
              <form onSubmit={submitTransacao} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select value={transacaoForm.data.tipo} onChange={(e) => updateTipoTransacao(e.target.value)}>
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </Select>
                  {financeiroAvancado ? (
                    <Select value={transacaoForm.data.status} onChange={(e) => transacaoForm.setData('status', e.target.value)}>
                      <option value={transacaoForm.data.tipo === 'receita' ? 'recebido' : 'pago'}>{transacaoForm.data.tipo === 'receita' ? 'Recebido agora' : 'Pago agora'}</option>
                      <option value="pendente">Deixar pendente</option>
                    </Select>
                  ) : null}
                </div>
                <Input placeholder="Descrição" value={transacaoForm.data.descricao} onChange={(e) => transacaoForm.setData('descricao', e.target.value)} />
                <Input placeholder="Complemento" value={transacaoForm.data.complemento} onChange={(e) => transacaoForm.setData('complemento', e.target.value)} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input type="number" step="0.01" min="0.01" placeholder="Valor" value={transacaoForm.data.valor} onChange={(e) => transacaoForm.setData('valor', e.target.value)} />
                  <Input type="date" value={transacaoForm.data.data} onChange={(e) => transacaoForm.setData('data', e.target.value)} />
                </div>
                <Select value={transacaoForm.data.categoria_financeira_id} onChange={(e) => transacaoForm.setData('categoria_financeira_id', e.target.value)}>
                  <option value="">Selecione a categoria</option>
                  {categoriasFiltradas.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
                </Select>
                <Select value={transacaoForm.data.conta_bancaria_id} onChange={(e) => transacaoForm.setData('conta_bancaria_id', e.target.value)}>
                  <option value="">Selecione a conta</option>
                  {contas.map((conta) => <option key={conta.id} value={conta.id}>{conta.nome}</option>)}
                </Select>
                {financeiroAvancado ? (
                  <Select value={transacaoForm.data.forma_pagamento} onChange={(e) => transacaoForm.setData('forma_pagamento', e.target.value)}>
                    <option value="conta">Saldo da conta</option>
                    <option value="pix">Pix</option>
                    <option value="dinheiro">Dinheiro</option>
                  </Select>
                ) : null}
                <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
                  <Checkbox checked={transacaoForm.data.recorrente} onCheckedChange={(checked) => transacaoForm.setData('recorrente', Boolean(checked))} />
                  <span>Lançamento recorrente</span>
                </label>
                {transacaoForm.data.recorrente ? (
                  <Select value={transacaoForm.data.frequencia} onChange={(e) => transacaoForm.setData('frequencia', e.target.value)}>
                    <option value="">Selecione a frequência</option>
                    <option value="mensal">Mensal</option>
                    <option value="semanal">Semanal</option>
                    <option value="diaria">Diária</option>
                  </Select>
                ) : null}
                <Textarea className="min-h-24" placeholder="Observações" value={transacaoForm.data.observacoes} onChange={(e) => transacaoForm.setData('observacoes', e.target.value)} />
                {Object.keys(transacaoForm.errors).length ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {Object.values(transacaoForm.errors).join(' ')}
                  </div>
                ) : null}
                <Button className="w-auto">Salvar lançamento</Button>
              </form>
            </Box>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Entradas, saídas e pendências</h3>
              <Link href="/financeiro/relatorios" className="text-sm text-zinc-600 hover:text-zinc-900">Ver relatórios</Link>
            </div>

            <div className="space-y-3">
              {transacoes.data.map((tx) => (
                <div key={tx.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-950">{tx.descricao}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {tx.data} • {tx.categoria?.nome || 'Sem categoria'} • {tx.conta?.nome || '-'}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {tx.tipo}{tx.status ? ` • ${tx.status}` : ''}{tx.forma_pagamento ? ` • ${tx.forma_pagamento}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>{tx.tipo === 'receita' ? '+' : '-'}{moeda(tx.valor)}</p>
                      <div className="mt-3 flex justify-end gap-2">
                        {financeiroAvancado && tx.status === 'pendente' ? (
                          <Button type="button" variant="outline" size="sm" className="w-auto border-green-200 text-green-700" onClick={() => router.patch(`/financeiro/transacoes/${tx.id}/settle`, { conta_bancaria_id: tx.conta?.id, forma_pagamento: 'conta', data: tx.data_iso })}>
                            {tx.tipo === 'receita' ? 'Receber' : 'Quitar'}
                          </Button>
                        ) : null}
                        <Link href={`/financeiro/transacoes/${tx.id}/edit`} className="rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-700">Editar</Link>
                        <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/financeiro/transacoes/${tx.id}`)}>Excluir</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-sm text-zinc-500">
              Página {transacoes.current_page} de {transacoes.last_page} • {transacoes.total} registros
            </div>
          </div>
        </div>
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
