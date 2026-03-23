@extends('adminlte::page')

@section('title', 'Controle Financeiro')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">Controle Financeiro</h1>
        <p class="text-muted mb-0">Visão resumida do seu DRE: o que entrou, o que saiu, o que está pendente e quanto sobrou.</p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
        <a href="{{ route('financeiro.transacoes') }}" class="btn btn-primary">
            <i class="fas fa-plus-circle"></i> Lançamentos
        </a>
        <a href="{{ route('financeiro.contas') }}" class="btn btn-outline-info">
            <i class="fas fa-wallet"></i> Contas e Carteiras
        </a>
        <a href="{{ route('financeiro.relatorios') }}" class="btn btn-outline-secondary">
            <i class="fas fa-chart-bar"></i> Relatórios
        </a>
    </div>
</div>
@stop

@section('content')
@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if(session('error'))
    <div class="alert alert-danger">{{ session('error') }}</div>
@endif

@unless($financeiroAvancado)
    <div class="alert alert-warning">
        O modo completo de contas a pagar e receber ainda não está ativo neste banco. Rode as migrations para liberar pendências, quitação e forma de pagamento.
    </div>
@endunless

<div class="card mb-4">
    <div class="card-body">
        <form method="GET" action="{{ route('financeiro.dashboard') }}" class="row align-items-end">
            <div class="col-md-4">
                <label>Início</label>
                <input type="date" name="data_inicio" class="form-control" value="{{ $inicio->toDateString() }}">
            </div>
            <div class="col-md-4">
                <label>Fim</label>
                <input type="date" name="data_fim" class="form-control" value="{{ $fim->toDateString() }}">
            </div>
            <div class="col-md-4">
                <button type="submit" class="btn btn-primary">Atualizar visão</button>
            </div>
        </form>
    </div>
</div>

<div class="row mb-4">
    <div class="col-md-3">
        <div class="card finance-card finance-green text-white">
            <div class="card-body">
                <small>Recebido no período</small>
                <h3>R$ {{ number_format($recebimentos, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card finance-card finance-red text-white">
            <div class="card-body">
                <small>Gasto no período</small>
                <h3>R$ {{ number_format($gastosPagos, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card finance-card finance-amber text-white">
            <div class="card-body">
                <small>Pendente</small>
                <h3>R$ {{ number_format($pendencias, 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card finance-card {{ $resultado >= 0 ? 'finance-blue' : 'finance-orange' }} text-white">
            <div class="card-body">
                <small>{{ $resultado >= 0 ? 'Lucro' : 'Prejuízo' }}</small>
                <h3>R$ {{ number_format(abs($resultado), 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-5 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Pendências financeiras</h5>
            </div>
            <div class="card-body">
                @if($financeiroAvancado)
                    @forelse($pendentes as $item)
                        <div class="pending-line">
                            <div>
                                <strong>{{ $item->descricao }}</strong>
                                <div class="text-muted small">{{ $item->categoria->nome ?? 'Sem categoria' }} • {{ $item->data->format('d/m/Y') }}</div>
                            </div>
                            <div class="text-right">
                                <span class="badge badge-warning">Pendente</span>
                                <div class="mt-1 font-weight-bold {{ $item->tipo === 'receita' ? 'text-success' : 'text-danger' }}">
                                    {{ $item->tipo === 'receita' ? '+' : '-' }}R$ {{ number_format($item->valor, 2, ',', '.') }}
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="text-muted">Nenhuma pendência no momento.</div>
                    @endforelse
                @else
                    <div class="text-muted">As pendências aparecerão aqui quando o modo avançado estiver ativo no banco.</div>
                @endif
            </div>
        </div>
    </div>

    <div class="col-lg-7 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Despesas pagas por categoria</h5>
            </div>
            <div class="card-body">
                @forelse($despesasPorCategoria as $item)
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <strong>{{ $item['categoria'] }}</strong>
                            <span>R$ {{ number_format($item['valor'], 2, ',', '.') }}</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-danger" style="width: {{ $gastosPagos > 0 ? ($item['valor'] / $gastosPagos) * 100 : 0 }}%"></div>
                        </div>
                    </div>
                @empty
                    <div class="text-muted">Sem despesas pagas neste período.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Contas e carteiras</h5>
            </div>
            <div class="card-body">
                @foreach($contas as $conta)
                    <div class="pending-line">
                        <div>
                            <strong>{{ $conta->nome }}</strong>
                            <div class="text-muted small">{{ $conta->instituicao ?: 'Sem instituição informada' }} • {{ ucfirst($conta->tipo) }}</div>
                        </div>
                        <div class="font-weight-bold">R$ {{ number_format($conta->saldo_atual, 2, ',', '.') }}</div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Últimos lançamentos</h5>
            </div>
            <div class="card-body">
                @forelse($ultimasTransacoes as $item)
                    <div class="pending-line">
                        <div>
                            <strong>{{ $item->descricao }}</strong>
                            <div class="text-muted small">
                                {{ $item->data->format('d/m/Y') }}
                                @if($financeiroAvancado)
                                    • {{ ucfirst($item->status) }}
                                @endif
                            </div>
                        </div>
                        <div class="font-weight-bold {{ $item->tipo === 'receita' ? 'text-success' : 'text-danger' }}">
                            {{ $item->tipo === 'receita' ? '+' : '-' }}R$ {{ number_format($item->valor, 2, ',', '.') }}
                        </div>
                    </div>
                @empty
                    <div class="text-muted">Nenhum lançamento encontrado.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header border-0">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h5 class="card-title mb-1">Meta de economia</h5>
                        <small class="text-muted">Defina quanto quer juntar e o sistema calcula o ritmo necessário.</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseMetaEconomia">
                        <i class="fas fa-plus"></i> Nova meta
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="collapse mb-4" id="collapseMetaEconomia">
                    <div class="goal-form-panel">
                        <form method="POST" action="{{ route('financeiro.store-meta-economia') }}">
                            @csrf
                            <div class="form-group">
                                <label>Título</label>
                                <input type="text" name="titulo" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Descrição</label>
                                <input type="text" name="descricao" class="form-control">
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Valor alvo</label>
                                        <input type="number" step="0.01" min="0.01" name="valor_alvo" class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Já guardado</label>
                                        <input type="number" step="0.01" min="0" name="valor_atual" class="form-control" value="0">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Periodicidade</label>
                                        <select name="periodicidade" class="form-control">
                                            <option value="dia">Dia</option>
                                            <option value="mes" selected>Mês</option>
                                            <option value="ano">Ano</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Prazo final</label>
                                <input type="date" name="prazo_final" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Salvar meta</button>
                        </form>
                    </div>
                </div>

                <div class="goal-list">
                    @forelse($metasEconomia as $item)
                        @php($meta = $item['meta'])
                        @php($analise = $item['analise'])
                        <div class="goal-card">
                            <div class="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <h6 class="mb-1">{{ $meta->titulo }}</h6>
                                    <small class="text-muted d-block mb-2">{{ $meta->descricao ?: 'Meta de economia personalizada.' }}</small>
                                </div>
                                <form method="POST" action="{{ route('financeiro.destroy-meta-economia', $meta->id) }}">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-outline-danger btn-xs"><i class="fas fa-trash"></i></button>
                                </form>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-primary" style="width: {{ $analise['progresso'] }}%"></div>
                            </div>
                            <div class="metric-grid">
                                <div class="metric-box">
                                    <small>Falta</small>
                                    <strong>R$ {{ number_format($analise['faltante'], 2, ',', '.') }}</strong>
                                </div>
                                <div class="metric-box">
                                    <small>Por {{ $meta->periodicidade }}</small>
                                    <strong>R$ {{ number_format($analise['valor_por_periodo'], 2, ',', '.') }}</strong>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="text-muted">Nenhuma meta de economia cadastrada.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header border-0">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h5 class="card-title mb-1">Meta de bem material</h5>
                        <small class="text-muted">Veja em quanto tempo consegue comprar algo juntando por mês.</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseMetaBem">
                        <i class="fas fa-plus"></i> Novo bem
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="collapse mb-4" id="collapseMetaBem">
                    <div class="goal-form-panel">
                        <form method="POST" action="{{ route('financeiro.store-meta-bem-material') }}">
                            @csrf
                            <div class="form-group">
                                <label>Bem desejado</label>
                                <input type="text" name="nome_bem" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Descrição</label>
                                <input type="text" name="descricao" class="form-control">
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Valor do bem</label>
                                        <input type="number" step="0.01" min="0.01" name="valor_bem" class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Já guardado</label>
                                        <input type="number" step="0.01" min="0" name="valor_ja_guardado" class="form-control" value="0">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Guardar por mês</label>
                                        <input type="number" step="0.01" min="0.01" name="valor_guardar_mes" class="form-control" required>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">Salvar meta</button>
                        </form>
                    </div>
                </div>

                <div class="goal-list">
                    @forelse($metasBens as $item)
                        @php($meta = $item['meta'])
                        @php($analise = $item['analise'])
                        <div class="goal-card">
                            <div class="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <h6 class="mb-1">{{ $meta->nome_bem }}</h6>
                                    <small class="text-muted d-block mb-2">{{ $meta->descricao ?: 'Planejamento de compra.' }}</small>
                                </div>
                                <form method="POST" action="{{ route('financeiro.destroy-meta-bem-material', $meta->id) }}">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-outline-danger btn-xs"><i class="fas fa-trash"></i></button>
                                </form>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" style="width: {{ $analise['progresso'] }}%"></div>
                            </div>
                            <div class="metric-grid">
                                <div class="metric-box">
                                    <small>Falta</small>
                                    <strong>R$ {{ number_format($analise['faltante'], 2, ',', '.') }}</strong>
                                </div>
                                <div class="metric-box">
                                    <small>Tempo estimado</small>
                                    <strong>{{ $analise['meses_estimados'] ?? 0 }} mês(es)</strong>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="text-muted">Nenhuma meta de bem material cadastrada.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>

@push('css')
<style>
    .finance-card { border: none; border-radius: 18px; }
    .finance-green { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
    .finance-red { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
    .finance-amber { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
    .finance-blue { background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); }
    .finance-orange { background: linear-gradient(135deg, #9a3412 0%, #f97316 100%); }
    .pending-line {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #edf2f7;
    }
    .pending-line:last-child { border-bottom: none; }
    .goal-form-panel, .goal-card {
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px;
        background: #fff;
    }
    .goal-list { display: grid; gap: 12px; }
    .metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .metric-box {
        background: #f8fafc;
        border-radius: 12px;
        padding: 12px;
        display: grid;
        gap: 4px;
    }
    @media (max-width: 767px) {
        .metric-grid { grid-template-columns: 1fr; }
    }
</style>
@endpush
@stop
