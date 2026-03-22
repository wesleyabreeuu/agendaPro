@extends('adminlte::page')

@section('title', 'Saúde & Fitness')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">🏋️ Saúde & Fitness</h1>
        <p class="text-muted mb-0">Acompanhe suas atividades físicas e metas</p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
        <a href="{{ route('saude.atividades') }}" class="btn btn-outline-primary">
            <i class="fas fa-plus-circle"></i> Nova Atividade
        </a>
        <a href="{{ route('saude.calendario') }}" class="btn btn-outline-info">
            <i class="fas fa-calendar"></i> Calendário
        </a>
        <a href="{{ route('saude.metas') }}" class="btn btn-outline-warning">
            <i class="fas fa-bullseye"></i> Metas
        </a>
        <a href="{{ route('saude.relatorios') }}" class="btn btn-outline-success">
            <i class="fas fa-chart-line"></i> Relatórios
        </a>
    </div>
</div>
@stop

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show">
        {{ session('error') }}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
@endif

<div class="card border-0 shadow-sm mb-4">
    <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
                <h5 class="mb-0">Integracao com Strava</h5>
                @if(auth()->user()->hasStravaConnected())
                    <span class="badge badge-success">Conectado</span>
                @else
                    <span class="badge badge-secondary">Desconectado</span>
                @endif
            </div>
            <p class="text-muted mb-0 mt-2">
                Quando voce salvar uma nova atividade no Strava, o sistema vai importar automaticamente para o modulo de saude.
            </p>
        </div>
        <div>
            @if(auth()->user()->hasStravaConnected())
                <form method="POST" action="{{ route('strava.disconnect') }}">
                    @csrf
                    <button type="submit" class="btn btn-outline-danger">
                        <i class="fab fa-strava"></i> Desconectar Strava
                    </button>
                </form>
            @else
                <a href="{{ route('strava.connect') }}" class="btn btn-outline-warning">
                    <i class="fab fa-strava"></i> Conectar Strava
                </a>
            @endif
        </div>
    </div>
</div>

<!-- Estatísticas da Semana -->
<div class="row mb-4">
    <div class="col-md-3">
        <div class="card bg-gradient-primary text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Total de Horas</h6>
                <h3 class="mb-0">{{ number_format($totalHoras, 1) }}h</h3>
                <small>Esta semana</small>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-success text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Calorias Queimadas</h6>
                <h3 class="mb-0">{{ number_format($totalCalorias, 0) }}</h3>
                <small>kcal</small>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-warning text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Sessões</h6>
                <h3 class="mb-0">{{ $sessoes }}</h3>
                <small>Esta semana</small>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-gradient-info text-white shadow">
            <div class="card-body">
                <h6 class="mb-2">Atividades</h6>
                <h3 class="mb-0">{{ $atividadesPorCategoria->count() }}</h3>
                <small>Diferentes tipos</small>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Metas -->
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Suas Metas</h5>
            </div>
            <div class="card-body">
                @forelse($metasProgresso as $item)
                    <div class="mb-4">
                        <div class="d-flex justify-content-between mb-2">
                            <strong>{{ $item['meta']->titulo }}</strong>
                            <span class="badge badge-primary">{{ number_format($item['percentual'], 0) }}%</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar {{ $item['percentual'] >= 100 ? 'bg-success' : 'bg-warning' }}" 
                                 style="width: {{ min($item['percentual'], 100) }}%"></div>
                        </div>
                        <small class="text-muted">
                            {{ number_format($item['progresso'], 1) }} / {{ $item['meta']->valor_alvo }}
                            @switch($item['meta']->tipo)
                                @case('horas_semanais')
                                    horas
                                    @break
                                @case('calorias_semana')
                                    kcal
                                    @break
                                @case('dias_semana')
                                    dias
                                    @break
                                @case('sessoes_mes')
                                    sessões
                                    @break
                            @endswitch
                        </small>
                    </div>
                @empty
                    <div class="alert alert-info mb-0">
                        Nenhuma meta criada. 
                        <a href="{{ route('saude.metas') }}">Criar agora</a>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Atividades por Categoria -->
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Distribuição de Atividades</h5>
            </div>
            <div class="card-body">
                @forelse($atividadesPorCategoria as $atividade)
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <strong>{{ $atividade['categoria'] }}</strong>
                            <span class="badge badge-light">{{ $atividade['sessoes'] }}x</span>
                        </div>
                        <div class="d-flex gap-2">
                            <small class="text-primary">⏱ {{ number_format($atividade['horas'], 1) }}h</small>
                            <small class="text-success">🔥 {{ $atividade['calorias'] }}kcal</small>
                        </div>
                    </div>
                @empty
                    <div class="alert alert-info mb-0">Sem atividades nesta semana</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<!-- Últimas Atividades -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Últimas Atividades</h5>
            </div>
            <div class="card-body">
                <div class="list-group">
                    @forelse($ultimasAtividades as $ativ)
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1">
                                        <i class="{{ $ativ->categoria->icone }}"></i>
                                        {{ $ativ->categoria->nome }}
                                        @if($ativ->fonte === 'strava')
                                            <span class="badge badge-warning ml-2">
                                                <i class="fab fa-strava"></i> Strava
                                            </span>
                                        @endif
                                    </h6>
                                    @if($ativ->descricao)
                                        <p class="mb-1 text-muted">{{ $ativ->descricao }}</p>
                                    @endif
                                    <small class="text-muted">
                                        📅 {{ $ativ->data->format('d/m/Y') }}
                                        @if($ativ->hora_inicio)
                                            • ⏰ {{ $ativ->hora_inicio }}
                                        @endif
                                    </small>
                                </div>
                                <div class="text-right">
                                    <div class="font-weight-bold">{{ $ativ->duracao_minutos }}min</div>
                                    <small class="text-success">{{ $ativ->calorias_queimadas }}kcal</small>
                                    <br>
                                    <small class="badge badge-secondary">{{ ucfirst($ativ->intensidade) }}</small>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="text-center text-muted py-4">Nenhuma atividade registrada</div>
                    @endforelse
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
    .bg-gradient-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }
    .bg-gradient-success { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important; }
    .bg-gradient-warning { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important; }
    .bg-gradient-info { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important; }
</style>
@endpush
@stop
