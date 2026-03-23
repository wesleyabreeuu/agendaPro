@extends('adminlte::page')

@section('title', 'Relatórios Financeiros')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">Relatórios Financeiros</h1>
        <p class="text-muted mb-0">Relatório detalhado de ganhos, gastos, pendências e resultado final.</p>
    </div>
    <a href="{{ route('financeiro.transacoes') }}" class="btn btn-outline-secondary">Ver lançamentos</a>
</div>
@stop

@section('content')
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" action="{{ route('financeiro.relatorios') }}" class="row align-items-end">
            <div class="col-md-2">
                <label>Ano</label>
                <select name="ano" class="form-control">
                    @for($y = now()->year - 5; $y <= now()->year + 1; $y++)
                        <option value="{{ $y }}" @selected($ano == $y)>{{ $y }}</option>
                    @endfor
                </select>
            </div>
            <div class="col-md-2">
                <label>Mês</label>
                <select name="mes" class="form-control">
                    <option value="">Todos</option>
                    @for($m = 1; $m <= 12; $m++)
                        <option value="{{ $m }}" @selected((string) $mes === (string) $m)>{{ \Carbon\Carbon::create($ano, $m, 1)->translatedFormat('F') }}</option>
                    @endfor
                </select>
            </div>
            <div class="col-md-2">
                <label>Tipo</label>
                <select name="tipo" class="form-control">
                    <option value="">Todos</option>
                    <option value="receita" @selected(request('tipo') === 'receita')>Receitas</option>
                    <option value="despesa" @selected(request('tipo') === 'despesa')>Despesas</option>
                </select>
            </div>
            @if($financeiroAvancado)
                <div class="col-md-2">
                    <label>Status</label>
                    <select name="status" class="form-control">
                        <option value="">Todos</option>
                        <option value="pendente" @selected(request('status') === 'pendente')>Pendentes</option>
                        <option value="pago" @selected(request('status') === 'pago')>Pagos</option>
                        <option value="recebido" @selected(request('status') === 'recebido')>Recebidos</option>
                    </select>
                </div>
            @endif
            <div class="col-md-2">
                <label>Categoria</label>
                <select name="categoria" class="form-control">
                    <option value="">Todas</option>
                    @foreach($categorias as $categoria)
                        <option value="{{ $categoria->id }}" @selected((string) request('categoria') === (string) $categoria->id)>{{ $categoria->nome }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary btn-block">Filtrar</button>
            </div>
        </form>
    </div>
</div>

@unless($financeiroAvancado)
    <div class="alert alert-warning">
        Este relatório está em modo compatível. O detalhamento por status e forma de pagamento será liberado após a migration nova do financeiro.
    </div>
@endunless

<div class="row mb-4">
    <div class="col-md-3">
        <div class="card report-card report-green text-white">
            <div class="card-body">
                <small>Total recebido</small>
                <h3>R$ {{ number_format($totalReceita, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card report-card report-red text-white">
            <div class="card-body">
                <small>Total gasto</small>
                <h3>R$ {{ number_format($totalDespesa, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card report-card report-amber text-white">
            <div class="card-body">
                <small>Total pendente</small>
                <h3>R$ {{ number_format($totalPendente, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card report-card {{ $resultado >= 0 ? 'report-blue' : 'report-orange' }} text-white">
            <div class="card-body">
                <small>{{ $resultado >= 0 ? 'Lucro' : 'Prejuízo' }}</small>
                <h3>R$ {{ number_format(abs($resultado), 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Resumo mensal</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Mês</th>
                                <th>Recebido</th>
                                <th>Gasto</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($dadosPorMes as $dados)
                                <tr>
                                    <td>{{ $dados['mes'] }}</td>
                                    <td class="text-success">R$ {{ number_format($dados['receita'], 2, ',', '.') }}</td>
                                    <td class="text-danger">R$ {{ number_format($dados['despesa'], 2, ',', '.') }}</td>
                                    <td class="font-weight-bold {{ $dados['resultado'] >= 0 ? 'text-success' : 'text-danger' }}">
                                        R$ {{ number_format(abs($dados['resultado']), 2, ',', '.') }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Despesas por categoria</h5>
            </div>
            <div class="card-body">
                @forelse($despesasPorCategoria as $categoria => $valor)
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <strong>{{ $categoria }}</strong>
                            <span>R$ {{ number_format($valor, 2, ',', '.') }}</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-danger" style="width: {{ $totalDespesa > 0 ? ($valor / $totalDespesa) * 100 : 0 }}%"></div>
                        </div>
                    </div>
                @empty
                    <div class="text-muted">Sem despesas no filtro atual.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Receitas por categoria</h5>
            </div>
            <div class="card-body">
                @forelse($receitasPorCategoria as $categoria => $valor)
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <strong>{{ $categoria }}</strong>
                            <span>R$ {{ number_format($valor, 2, ',', '.') }}</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-success" style="width: {{ $totalReceita > 0 ? ($valor / $totalReceita) * 100 : 0 }}%"></div>
                        </div>
                    </div>
                @empty
                    <div class="text-muted">Sem receitas no filtro atual.</div>
                @endforelse
            </div>
        </div>
    </div>

    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Contas filtráveis</h5>
            </div>
            <div class="card-body">
                @forelse($contas as $conta)
                    <div class="d-flex justify-content-between py-2 border-bottom">
                        <div>
                            <strong>{{ $conta->nome }}</strong>
                            <div class="small text-muted">{{ $conta->instituicao ?: 'Sem instituição' }}</div>
                        </div>
                        <span>R$ {{ number_format($conta->saldo_atual, 2, ',', '.') }}</span>
                    </div>
                @empty
                    <div class="text-muted">Nenhuma conta cadastrada.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Relatório detalhado de lançamentos</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover table-sm align-middle">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        @if($financeiroAvancado)
                            <th>Status</th>
                            <th>Forma</th>
                        @endif
                        <th>Conta</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($transacoes as $tx)
                        <tr>
                            <td>{{ $tx->data->format('d/m/Y') }}</td>
                            <td>
                                <strong>{{ $tx->descricao }}</strong>
                                @if($tx->complemento)
                                    <div class="small text-muted">{{ $tx->complemento }}</div>
                                @endif
                            </td>
                            <td>{{ $tx->categoria->nome ?? '-' }}</td>
                            <td>{{ ucfirst($tx->tipo) }}</td>
                            @if($financeiroAvancado)
                                <td>{{ ucfirst($tx->status) }}</td>
                                <td>{{ $tx->forma_pagamento ? ucfirst($tx->forma_pagamento) : '-' }}</td>
                            @endif
                            <td>{{ $tx->conta->nome ?? '-' }}</td>
                            <td class="font-weight-bold {{ $tx->tipo === 'receita' ? 'text-success' : 'text-danger' }}">
                                {{ $tx->tipo === 'receita' ? '+' : '-' }}R$ {{ number_format($tx->valor, 2, ',', '.') }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ $financeiroAvancado ? '8' : '6' }}" class="text-center text-muted py-4">Nenhum lançamento encontrado para o filtro atual.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

@push('css')
<style>
    .report-card { border: none; border-radius: 18px; }
    .report-green { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
    .report-red { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
    .report-amber { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
    .report-blue { background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); }
    .report-orange { background: linear-gradient(135deg, #9a3412 0%, #f97316 100%); }
</style>
@endpush
@stop
