@extends('adminlte::page')

@section('title', 'Relatórios de Saúde')

@section('content_header')
<div class="d-flex justify-content-between align-items-center">
    <h1>Relatórios de Saúde</h1>
    <div>
        <select onchange="location.href='{{ route('saude.relatorios') }}?periodo=' + this.value" class="form-control d-inline w-auto">
            <option value="mes" {{ $periodo === 'mes' ? 'selected' : '' }}>Este Mês</option>
            <option value="trimestre" {{ $periodo === 'trimestre' ? 'selected' : '' }}>Este Trimestre</option>
            <option value="ano" {{ $periodo === 'ano' ? 'selected' : '' }}>Este Ano</option>
        </select>
    </div>
</div>
@stop

@section('content')
<div class="row mb-4">
    <div class="col-md-3">
        <div class="card bg-gradient-primary text-white">
            <div class="card-body">
                <h6 class="mb-2">Total de Horas</h6>
                <h3 class="mb-0">{{ number_format($totalHoras, 1) }}h</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-success text-white">
            <div class="card-body">
                <h6 class="mb-2">Calorias Queimadas</h6>
                <h3 class="mb-0">{{ number_format($totalCalorias, 0) }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-warning text-white">
            <div class="card-body">
                <h6 class="mb-2">Sessões</h6>
                <h3 class="mb-0">{{ $totalSessoes }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-info text-white">
            <div class="card-body">
                <h6 class="mb-2">Dias com Atividade</h6>
                <h3 class="mb-0">{{ $diasComAtividade }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Top Atividades</h5>
    </div>
    <div class="card-body">
        <table class="table">
            <thead>
                <tr>
                    <th>Atividade</th>
                    <th>Sessões</th>
                    <th>Horas</th>
                    <th>Calorias</th>
                </tr>
            </thead>
            <tbody>
                @forelse($topAtividades as $top)
                    <tr>
                        <td><strong>{{ $top['categoria'] }}</strong></td>
                        <td>{{ $top['sessoes'] }}</td>
                        <td>{{ number_format($top['horas'], 1) }}h</td>
                        <td class="text-danger">{{ $top['calorias'] }}kcal</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="text-center text-muted">Nenhuma atividade registrada</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

@push('css')
<style>
    .bg-gradient-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }
    .bg-gradient-success { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important; }
    .bg-gradient-warning { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important; }
    .bg-gradient-info { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important; }
</style>
@endpush
@stop
