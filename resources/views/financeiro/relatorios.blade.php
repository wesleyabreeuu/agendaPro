@extends('adminlte::page')

@section('title', 'Relatórios Financeiros')

@section('content_header')
<div class="d-flex justify-content-between align-items-center">
    <h1>Relatórios Financeiros</h1>
    <div>
        <select onchange="location.href='{{ route('financeiro.relatorios') }}?ano=' + this.value" class="form-control d-inline w-auto">
            @for($y = Carbon\Carbon::now()->year - 5; $y <= Carbon\Carbon::now()->year; $y++)
                <option value="{{ $y }}" {{ $ano == $y ? 'selected' : '' }}>{{ $y }}</option>
            @endfor
        </select>
    </div>
</div>
@stop

@section('content')
<div class="row mb-4">
    <div class="col-md-4">
        <div class="card bg-gradient-success text-white">
            <div class="card-body">
                <h6>Total Recebido</h6>
                <h3>R$ {{ number_format($totalReceita, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card bg-gradient-danger text-white">
            <div class="card-body">
                <h6>Total Gasto</h6>
                <h3>R$ {{ number_format($totalDespesa, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card {{ ($totalReceita - $totalDespesa) >= 0 ? 'bg-gradient-info' : 'bg-gradient-warning' }} text-white">
            <div class="card-body">
                <h6>Saldo</h6>
                <h3>R$ {{ number_format($totalReceita - $totalDespesa, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Transações do Ano</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Receitas</th>
                        <th>Despesas</th>
                        <th>Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($dadosPorMes as $dados)
                        <tr>
                            <td><strong>{{ $dados['mes'] }}</strong></td>
                            <td class="text-success">+R$ {{ number_format($dados['receita'], 2, ',', '.') }}</td>
                            <td class="text-danger">-R$ {{ number_format($dados['despesa'], 2, ',', '.') }}</td>
                            <td class="font-weight-bold">R$ {{ number_format($dados['receita'] - $dados['despesa'], 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

@push('css')
<style>
    .bg-gradient-success { background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%) !important; }
    .bg-gradient-danger { background: linear-gradient(135deg, #ff8787 0%, #f06292 100%) !important; }
    .bg-gradient-info { background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%) !important; }
    .bg-gradient-warning { background: linear-gradient(135deg, #ffb74d 0%, #ffa726 100%) !important; }
</style>
@endpush
@stop
