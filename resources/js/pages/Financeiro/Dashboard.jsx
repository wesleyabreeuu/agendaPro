import React from 'react'
import { Link, router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Input, Select } from '@/components/ui'

function moeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0))
}

function metaPrazoLabel(item) {
  return item?.meta?.meses_planejados ? `${item.meta.meses_planejados} meses` : 'Prazo flexivel'
}

export default function FinanceiroDashboard({ filtros, resumo, contas = [], categorias = [], despesasPorCategoria = [], pendentes = [], ultimasTransacoes = [], metasEconomia = [], metasBens = [], financeiroAvancado }) {
  const quickFieldClassName = 'border-zinc-300 shadow-none'

  const filterForm = useForm({
    data_inicio: filtros.data_inicio || '',
    data_fim: filtros.data_fim || '',
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

  const metaEconomiaForm = useForm({
    titulo: '',
    descricao: '',
    valor_alvo: '',
    valor_atual: 0,
    meses_planejados: 12,
  })

  const metaBemForm = useForm({
    nome_bem: '',
    descricao: '',
    valor_bem: '',
    valor_ja_guardado: 0,
    meses_planejados: 10,
  })

  const categoriasTransacao = categorias.filter((categoria) => categoria.tipo === transacaoForm.data.tipo)

  function updateTipoTransacao(tipo) {
    transacaoForm.setData((data) => ({
      ...data,
      tipo,
      status: !financeiroAvancado ? data.status : (tipo === 'receita' ? 'recebido' : 'pago'),
      categoria_financeira_id: categorias.find((categoria) => categoria.tipo === tipo)?.id || '',
    }))
  }

  function filtrar(e) {
    e.preventDefault()
    router.get('/financeiro', filterForm.data)
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

  return (
    <AppLayout title="Controle Financeiro">
      <div className="space-y-6">
        {!financeiroAvancado ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            O modo completo de contas a pagar e receber ainda não está ativo neste banco.
          </div>
        ) : null}

        <form onSubmit={filtrar} className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">Início</label>
            <Input type="date" value={filterForm.data.data_inicio} onChange={(e) => filterForm.setData('data_inicio', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">Fim</label>
            <Input type="date" value={filterForm.data.data_fim} onChange={(e) => filterForm.setData('data_fim', e.target.value)} />
          </div>
          <div className="flex items-end gap-3">
            <Button className="w-auto">Atualizar visão</Button>
            <Link href="/financeiro/transacoes" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Lançamentos</Link>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Recebido no período" value={moeda(resumo.recebimentos)} />
          <MetricCard title="Gasto no período" value={moeda(resumo.gastos_pagos)} />
          <MetricCard title="Pendente" value={moeda(resumo.pendencias)} />
          <MetricCard title={Number(resumo.resultado) >= 0 ? 'Lucro' : 'Prejuízo'} value={moeda(Math.abs(Number(resumo.resultado || 0)))} />
        </div>

        <Panel title="Cadastrar receita ou gasto" action={<Link href="/financeiro/transacoes" className="text-sm text-zinc-600 hover:text-zinc-900">Abrir tela completa</Link>}>
          <form onSubmit={submitTransacao} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Select className={quickFieldClassName} value={transacaoForm.data.tipo} onChange={(e) => updateTipoTransacao(e.target.value)}>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </Select>
              {financeiroAvancado ? (
                <Select className={quickFieldClassName} value={transacaoForm.data.status} onChange={(e) => transacaoForm.setData('status', e.target.value)}>
                  <option value={transacaoForm.data.tipo === 'receita' ? 'recebido' : 'pago'}>{transacaoForm.data.tipo === 'receita' ? 'Recebido agora' : 'Pago agora'}</option>
                  <option value="pendente">Deixar pendente</option>
                </Select>
              ) : null}
              <Input className={quickFieldClassName} type="number" step="0.01" min="0.01" placeholder="Valor" value={transacaoForm.data.valor} onChange={(e) => transacaoForm.setData('valor', e.target.value)} />
              <Input className={quickFieldClassName} type="date" value={transacaoForm.data.data} onChange={(e) => transacaoForm.setData('data', e.target.value)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Descricao" value={transacaoForm.data.descricao} onChange={(e) => transacaoForm.setData('descricao', e.target.value)} />
              <Input placeholder="Complemento" value={transacaoForm.data.complemento} onChange={(e) => transacaoForm.setData('complemento', e.target.value)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Select value={transacaoForm.data.categoria_financeira_id} onChange={(e) => transacaoForm.setData('categoria_financeira_id', e.target.value)}>
                <option value="">Selecione a categoria</option>
                {categoriasTransacao.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
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
              <Button className="w-auto">Salvar lancamento</Button>
            </div>

            {Object.keys(transacaoForm.errors).length ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {Object.values(transacaoForm.errors).join(' ')}
              </div>
            ) : null}
          </form>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Pendências financeiras">
            <div className="space-y-3">
              {pendentes.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 p-4">
                  <div>
                    <p className="font-medium text-zinc-950">{item.descricao}</p>
                    <p className="mt-1 text-sm text-zinc-500">{item.categoria?.nome || 'Sem categoria'} • {item.data}</p>
                  </div>
                  <Badge variant={item.tipo === 'receita' ? 'success' : 'danger'}>{item.tipo === 'receita' ? '+' : '-'}{moeda(item.valor)}</Badge>
                </div>
              ))}
              {pendentes.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma pendência no momento.</p> : null}
            </div>
          </Panel>

          <Panel title="Despesas pagas por categoria">
            <div className="space-y-4">
              {despesasPorCategoria.map((item) => (
                <div key={item.categoria}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-900">{item.categoria}</span>
                    <span className="text-zinc-600">{moeda(item.valor)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${Number(resumo.gastos_pagos) > 0 ? (Number(item.valor) / Number(resumo.gastos_pagos)) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              {despesasPorCategoria.length === 0 ? <p className="text-sm text-zinc-500">Sem despesas pagas neste período.</p> : null}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Contas e carteiras" action={<Link href="/financeiro/contas" className="text-sm text-zinc-600 hover:text-zinc-900">Ver contas</Link>}>
            <div className="space-y-3">
              {contas.map((conta) => (
                <div key={conta.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-4">
                  <div>
                    <p className="font-medium text-zinc-950">{conta.nome}</p>
                    <p className="mt-1 text-sm text-zinc-500">{conta.instituicao || 'Sem instituição'} • {conta.tipo}</p>
                  </div>
                  <p className="font-semibold text-zinc-950">{moeda(conta.saldo_atual)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Últimos lançamentos" action={<Link href="/financeiro/transacoes" className="text-sm text-zinc-600 hover:text-zinc-900">Ver lançamentos</Link>}>
            <div className="space-y-3">
              {ultimasTransacoes.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-4">
                  <div>
                    <p className="font-medium text-zinc-950">{item.descricao}</p>
                    <p className="mt-1 text-sm text-zinc-500">{item.data}{item.status ? ` • ${item.status}` : ''}</p>
                  </div>
                  <Badge variant={item.tipo === 'receita' ? 'success' : 'danger'}>{item.tipo === 'receita' ? '+' : '-'}{moeda(item.valor)}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Meta de economia">
            <form onSubmit={(e) => { e.preventDefault(); metaEconomiaForm.post('/financeiro/metas-economia', { preserveScroll: true }) }} className="grid gap-4 rounded-2xl border border-zinc-200 p-4">
              <Input placeholder="Título" value={metaEconomiaForm.data.titulo} onChange={(e) => metaEconomiaForm.setData('titulo', e.target.value)} />
              <Input placeholder="Descrição" value={metaEconomiaForm.data.descricao} onChange={(e) => metaEconomiaForm.setData('descricao', e.target.value)} />
              <div className="grid gap-4 md:grid-cols-3">
                <Input type="number" step="0.01" min="0.01" placeholder="Valor alvo" value={metaEconomiaForm.data.valor_alvo} onChange={(e) => metaEconomiaForm.setData('valor_alvo', e.target.value)} />
                <Input type="number" step="0.01" min="0" placeholder="Já guardado" value={metaEconomiaForm.data.valor_atual} onChange={(e) => metaEconomiaForm.setData('valor_atual', e.target.value)} />
                <Input type="number" min="1" step="1" placeholder="Prazo em meses" value={metaEconomiaForm.data.meses_planejados} onChange={(e) => metaEconomiaForm.setData('meses_planejados', e.target.value)} />
              </div>
              <Button className="h-10 w-auto rounded-md px-4">Salvar meta</Button>
              {Object.keys(metaEconomiaForm.errors).length ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {Object.values(metaEconomiaForm.errors).join(' ')}
                </div>
              ) : null}
            </form>

            <div className="mt-4 space-y-3">
              {metasEconomia.map((item) => (
                <div key={item.meta.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-950">{item.meta.titulo}</p>
                      <p className="mt-1 text-sm text-zinc-500">{item.meta.descricao || 'Sem descrição'} • {metaPrazoLabel(item)} • até {item.meta.prazo_final}</p>
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/financeiro/metas-economia/${item.meta.id}`)}>Excluir</Button>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600">Progresso: {item.analise.progresso.toFixed(1)}% • Falta {moeda(item.analise.faltante)} • Precisa guardar {moeda(item.analise.valor_mensal_planejado)}/mês no plano cadastrado</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {item.analise.cenarios.map((cenario) => (
                      <div key={`${item.meta.id}-${cenario.meses}`} className="rounded-xl bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                        <p className="font-medium text-zinc-900">{cenario.label}</p>
                        <p className="mt-1">{moeda(cenario.valor_mensal)}/mês</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Meta de bem material">
            <form onSubmit={(e) => { e.preventDefault(); metaBemForm.post('/financeiro/metas-bens', { preserveScroll: true }) }} className="grid gap-4 rounded-2xl border border-zinc-200 p-4">
              <Input placeholder="Nome do bem" value={metaBemForm.data.nome_bem} onChange={(e) => metaBemForm.setData('nome_bem', e.target.value)} />
              <Input placeholder="Descrição" value={metaBemForm.data.descricao} onChange={(e) => metaBemForm.setData('descricao', e.target.value)} />
              <div className="grid gap-4 md:grid-cols-3">
                <Input type="number" step="0.01" min="0.01" placeholder="Valor do bem" value={metaBemForm.data.valor_bem} onChange={(e) => metaBemForm.setData('valor_bem', e.target.value)} />
                <Input type="number" step="0.01" min="0" placeholder="Já guardado" value={metaBemForm.data.valor_ja_guardado} onChange={(e) => metaBemForm.setData('valor_ja_guardado', e.target.value)} />
                <Input type="number" min="1" step="1" placeholder="Prazo em meses" value={metaBemForm.data.meses_planejados} onChange={(e) => metaBemForm.setData('meses_planejados', e.target.value)} />
              </div>
              <Button className="h-10 w-auto rounded-md px-4">Salvar meta</Button>
              {Object.keys(metaBemForm.errors).length ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {Object.values(metaBemForm.errors).join(' ')}
                </div>
              ) : null}
            </form>

            <div className="mt-4 space-y-3">
              {metasBens.map((item) => (
                <div key={item.meta.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-950">{item.meta.nome_bem}</p>
                      <p className="mt-1 text-sm text-zinc-500">{item.meta.descricao || 'Sem descrição'} • {metaPrazoLabel(item)}</p>
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/financeiro/metas-bens/${item.meta.id}`)}>Excluir</Button>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600">Progresso: {item.analise.progresso.toFixed(1)}% • Falta {moeda(item.analise.faltante)} • Precisa guardar {moeda(item.analise.valor_mensal_planejado)}/mês no plano cadastrado</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {item.analise.cenarios.map((cenario) => (
                      <div key={`${item.meta.id}-${cenario.meses}`} className="rounded-xl bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                        <p className="font-medium text-zinc-900">{cenario.label}</p>
                        <p className="mt-1">{moeda(cenario.valor_mensal)}/mês</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  )
}

function MetricCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
    </div>
  )
}

function Panel({ title, action = null, children }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}
