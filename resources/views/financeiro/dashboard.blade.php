@extends('adminlte::page')

@section('title', 'Controle Financeiro')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">💰 Controle Financeiro</h1>
        <p class="text-muted mb-0">Gerenciar receitas, despesas e contas bancárias</p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
        <a href="{{ route('financeiro.transacoes') }}" class="btn btn-outline-primary">
            <i class="fas fa-plus-circle"></i> Nova Transação
        </a>
        <a href="{{ route('financeiro.contas') }}" class="btn btn-outline-info">
            <i class="fas fa-university"></i> Contas
        </a>
        <a href="{{ route('financeiro.relatorios') }}" class="btn btn-outline-success">
            <i class="fas fa-chart-bar"></i> Relatórios
        </a>
    </div>
</div>
@stop

@section('content')
<!-- Cartões de Resumo -->
<div class="row mb-4">
    <div class="col-md-3">
        <div class="card bg-gradient-success text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Total Recebido</h6>
                <h3 class="mb-0">R$ {{ number_format($totalReceita, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-danger text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Total Gasto</h6>
                <h3 class="mb-0">R$ {{ number_format($totalDespesa, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card {{ $lucro >= 0 ? 'bg-gradient-info' : 'bg-gradient-warning' }} text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">{{ $lucro >= 0 ? 'Lucro' : 'Prejuízo' }}</h6>
                <h3 class="mb-0">R$ {{ number_format(abs($lucro), 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-primary text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Saldo Total</h6>
                <h3 class="mb-0">R$ {{ number_format($saldoTotal, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Contas -->
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Minhas Contas</h5>
            </div>
            <div class="card-body">
                @forelse($contas as $conta)
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div>
                            <strong>{{ $conta->nome }}</strong>
                            <br>
                            <small class="text-muted">{{ ucfirst($conta->tipo) }}</small>
                        </div>
                        <div class="text-right">
                            <strong>R$ {{ number_format($conta->saldo_atual, 2, ',', '.') }}</strong>
                        </div>
                    </div>
                @empty
                    <div class="alert alert-info mb-0">Nenhuma conta criada encore. <a href="{{ route('financeiro.contas') }}">Criar agora</a></div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Categorias de Despesa -->
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Gastos por Categoria</h5>
            </div>
            <div class="card-body">
                @forelse($categoriasDespesa as $cat)
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <strong>{{ $cat['categoria'] }}</strong>
                            <span class="badge badge-primary">{{ number_format($cat['percentual'], 1) }}%</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-danger" style="width: {{ $cat['percentual'] }}%"></div>
                        </div>
                        <small class="text-muted">R$ {{ number_format($cat['valor'], 2, ',', '.') }}</small>
                    </div>
                @empty
                    <div class="alert alert-info mb-0">Sem despesas neste período</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<!-- Últimas Transações -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Últimas Transações</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover table-sm">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Conta</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($ultimasTransacoes as $tx)
                                <tr>
                                    <td>{{ $tx->data->format('d/m/Y') }}</td>
                                    <td>{{ $tx->descricao }}</td>
                                    <td><span class="badge" style="background-color: {{ $tx->categoria->cor }}">{{ $tx->categoria->nome }}</span></td>
                                    <td>
                                        @if($tx->tipo === 'receita')
                                            <span class="badge badge-success">✓ Receita</span>
                                        @else
                                            <span class="badge badge-danger">✗ Despesa</span>
                                        @endif
                                    </td>
                                    <td class="font-weight-bold">
                                        <span class="{{ $tx->tipo === 'receita' ? 'text-success' : 'text-danger' }}">
                                            {{ $tx->tipo === 'receita' ? '+' : '-' }}R$ {{ number_format($tx->valor, 2, ',', '.') }}
                                        </span>
                                    </td>
                                    <td>{{ $tx->conta->nome }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted">Nenhuma transação registrada</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

@push('css')
<style>
    .card {
        border: none;
        border-radius: 12px;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    .bg-gradient-success { background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%) !important; }
    .bg-gradient-danger { background: linear-gradient(135deg, #ff8787 0%, #f06292 100%) !important; }
    .bg-gradient-info { background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%) !important; }
    .bg-gradient-warning { background: linear-gradient(135deg, #ffb74d 0%, #ffa726 100%) !important; }
    .bg-gradient-primary { background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%) !important; }
</style>
@endpush
@stop
