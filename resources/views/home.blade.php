@extends('adminlte::page')

@section('title', 'Dashboard')
@section('plugins.Chartjs', true)

@php
    $money = fn ($value) => 'R$ ' . number_format((float) $value, 2, ',', '.');
    $todoStatusMeta = [
        'aguardando' => ['label' => 'Aguardando', 'class' => 'status-chip status-chip-slate'],
        'execucao' => ['label' => 'Em execucao', 'class' => 'status-chip status-chip-amber'],
        'finalizado' => ['label' => 'Finalizado', 'class' => 'status-chip status-chip-emerald'],
    ];
    $todoUrgenciaMeta = [
        'baixa' => ['label' => 'Baixa', 'class' => 'urgency-chip urgency-chip-low'],
        'media' => ['label' => 'Media', 'class' => 'urgency-chip urgency-chip-medium'],
        'alta' => ['label' => 'Alta', 'class' => 'urgency-chip urgency-chip-high'],
    ];
@endphp

@section('content_header')
<div class="dashboard-hero">
    <div>
        <span class="hero-kicker">AgendaPro</span>
        <h1 class="hero-title">Dashboard Central</h1>
        <p class="hero-subtitle">Uma leitura unica da sua agenda, produtividade, financeiro e saude.</p>
    </div>
    <div class="hero-actions">
        <a href="{{ route('compromissos.calendario') }}" class="btn btn-light btn-sm">
            <i class="fas fa-calendar-week mr-1"></i> Calendario
        </a>
        <a href="{{ route('saude.dashboard') }}" class="btn btn-outline-light btn-sm">
            <i class="fas fa-heartbeat mr-1"></i> Saude
        </a>
        <a href="{{ route('financeiro.dashboard') }}" class="btn btn-outline-light btn-sm">
            <i class="fas fa-wallet mr-1"></i> Financeiro
        </a>
    </div>
</div>
@stop

@section('content')
<div class="row dashboard-row">
    <div class="col-xl-3 col-md-6">
        <div class="metric-card metric-indigo">
            <div class="metric-label">Compromissos no mes</div>
            <div class="metric-value">{{ $cards['compromissosMes'] }}</div>
            <div class="metric-foot">Hoje: {{ $cards['compromissosHoje'] }}</div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="metric-card metric-amber">
            <div class="metric-label">Lembretes ativos</div>
            <div class="metric-value">{{ $cards['totalLembretes'] }}</div>
            <div class="metric-foot">Alertas vinculados aos seus compromissos</div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="metric-card metric-emerald">
            <div class="metric-label">Saldo consolidado</div>
            <div class="metric-value metric-money">{{ $money($cards['saldoTotal']) }}</div>
            <div class="metric-foot">Painel financeiro integrado</div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="metric-card metric-cyan">
            <div class="metric-label">Horas de treino</div>
            <div class="metric-value">{{ number_format($cards['horasSemana'], 1, ',', '.') }}h</div>
            <div class="metric-foot">Acumuladas nesta semana</div>
        </div>
    </div>
</div>

<div class="card dashboard-card dashboard-spotlight">
    <div class="card-body">
        <div class="spotlight-grid">
            <div class="spotlight-box">
                <span class="spotlight-label">Foco de tarefas</span>
                @if($radar['tarefaFoco'])
                    <strong>{{ $radar['tarefaFoco']->descricao }}</strong>
                    <small>{{ $radar['tarefaFoco']->hora ?: 'Sem horario definido' }}</small>
                @else
                    <strong>Dia livre</strong>
                    <small>Nenhuma tarefa em aberto para hoje</small>
                @endif
            </div>
            <div class="spotlight-box">
                <span class="spotlight-label">Proximo compromisso</span>
                @if($radar['proximoCompromisso'])
                    <strong>{{ $radar['proximoCompromisso']->titulo }}</strong>
                    <small>{{ $radar['proximoCompromisso']->data_inicio->format('d/m H:i') }}</small>
                @else
                    <strong>Agenda tranquila</strong>
                    <small>Sem compromissos restantes hoje</small>
                @endif
            </div>
            <div class="spotlight-box">
                <span class="spotlight-label">Kanban</span>
                <strong>{{ $kanban['atrasadas'] }} em atraso</strong>
                <small>{{ $kanban['total'] }} cards em {{ $kanban['boardsAtivos'] }} quadro(s)</small>
            </div>
            <div class="spotlight-box spotlight-box-action">
                <span class="spotlight-label">Acesso rapido</span>
                <div class="spotlight-actions">
                    <a href="{{ route('todo.index') }}" class="btn btn-sm btn-outline-primary">Tarefas</a>
                    <a href="{{ route('kanban.index') }}" class="btn btn-sm btn-outline-dark">Kanban</a>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row dashboard-row">
    <div class="col-xl-8">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Ritmo da semana</h3>
                    <p class="dashboard-card-subtitle">Compromissos previstos para os proximos dias</p>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-shell chart-shell-lg">
                    <canvas id="compromissosSemanaChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-4">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Status das tarefas</h3>
                    <p class="dashboard-card-subtitle">Panorama da sua fila atual</p>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-shell chart-shell-md">
                    <canvas id="tarefasStatusChart"></canvas>
                </div>
                <div class="status-legend mt-4">
                    <span><strong>{{ $cards['tarefasPendentes'] }}</strong> tarefas em aberto</span>
                    <span><strong>{{ $cards['totalTarefasHoje'] }}</strong> programadas para hoje</span>
                    <span><strong>{{ $cards['totalQuadrosKanban'] }}</strong> quadros kanban</span>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row dashboard-row">
    <div class="col-xl-7">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Fluxo financeiro</h3>
                    <p class="dashboard-card-subtitle">Receitas e despesas dos ultimos 6 meses</p>
                </div>
                <a href="{{ route('financeiro.dashboard') }}" class="btn btn-sm btn-outline-primary">Abrir financeiro</a>
            </div>
            <div class="card-body">
                <div class="finance-summary">
                    <div>
                        <span class="summary-label">Receitas no mes</span>
                        <strong class="text-success">{{ $money($financeiro['receitasMes']) }}</strong>
                    </div>
                    <div>
                        <span class="summary-label">Despesas no mes</span>
                        <strong class="text-danger">{{ $money($financeiro['despesasMes']) }}</strong>
                    </div>
                    <div>
                        <span class="summary-label">Resultado</span>
                        <strong class="{{ $financeiro['resultadoMes'] >= 0 ? 'text-success' : 'text-danger' }}">
                            {{ $money($financeiro['resultadoMes']) }}
                        </strong>
                    </div>
                </div>
                <div class="chart-shell chart-shell-lg">
                    <canvas id="financeiroChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-5">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Saude da semana</h3>
                    <p class="dashboard-card-subtitle">Duracao e calorias por dia</p>
                </div>
                <a href="{{ route('saude.dashboard') }}" class="btn btn-sm btn-outline-success">Abrir saude</a>
            </div>
            <div class="card-body">
                <div class="health-summary">
                    <div class="pill">
                        <span>Atividades</span>
                        <strong>{{ $saude['atividadesSemana'] }}</strong>
                    </div>
                    <div class="pill">
                        <span>Calorias</span>
                        <strong>{{ number_format($saude['caloriasSemana'], 0, ',', '.') }}</strong>
                    </div>
                </div>
                <div class="chart-shell chart-shell-md">
                    <canvas id="saudeChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row dashboard-row">
    <div class="col-xl-4">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Agenda de hoje</h3>
                    <p class="dashboard-card-subtitle">Seus compromissos do dia</p>
                </div>
            </div>
            <div class="card-body">
                @forelse($agendaHoje as $compromisso)
                    <a href="{{ route('compromissos.edit', $compromisso->id) }}" class="agenda-item text-decoration-none">
                        <div class="agenda-time">{{ $compromisso->data_inicio->format('H:i') }}</div>
                        <div class="agenda-content">
                            <strong>{{ $compromisso->titulo }}</strong>
                            <span>{{ $compromisso->data_inicio->format('d/m H:i') }} ate {{ $compromisso->data_fim->format('H:i') }}</span>
                        </div>
                    </a>
                @empty
                    <div class="empty-state">Nenhum compromisso marcado para hoje.</div>
                @endforelse
            </div>
        </div>
    </div>

    <div class="col-xl-4">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Tarefas do dia</h3>
                    <p class="dashboard-card-subtitle">Prioridades imediatas</p>
                </div>
            </div>
            <div class="card-body">
                @forelse($tarefasHoje as $tarefa)
                    @php($statusInfo = $todoStatusMeta[$tarefa->status] ?? $todoStatusMeta['aguardando'])
                    @php($urgenciaInfo = $todoUrgenciaMeta[$tarefa->urgencia] ?? $todoUrgenciaMeta['media'])
                    <div class="task-item task-item-modern">
                        <div class="task-main">
                            <div class="task-copy">
                                <strong>{{ $tarefa->descricao }}</strong>
                                <span>{{ $tarefa->hora ?: 'Sem horario definido' }}</span>
                            </div>
                            <div class="task-tags">
                                <span class="{{ $urgenciaInfo['class'] }}">
                                    <i class="fas fa-flag mr-1"></i>{{ $urgenciaInfo['label'] }}
                                </span>
                                <span class="{{ $statusInfo['class'] }}">{{ $statusInfo['label'] }}</span>
                            </div>
                        </div>
                        <a href="{{ route('todo.edit', $tarefa->id) }}" class="btn btn-sm btn-outline-primary task-cta">Abrir</a>
                    </div>
                @empty
                    <div class="empty-state">Nenhuma tarefa para hoje.</div>
                @endforelse
            </div>
        </div>
    </div>

    <div class="col-xl-4">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Proximos compromissos</h3>
                    <p class="dashboard-card-subtitle">Visao rapida do que vem por ai</p>
                </div>
            </div>
            <div class="card-body">
                @forelse($proximosCompromissos as $compromisso)
                    <div class="next-item">
                        <strong>{{ $compromisso->titulo }}</strong>
                        <span>{{ $compromisso->data_inicio->format('d/m/Y H:i') }}</span>
                    </div>
                @empty
                    <div class="empty-state">Sem compromissos futuros cadastrados.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<div class="row dashboard-row">
    <div class="col-xl-6">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Produtividade recente</h3>
                    <p class="dashboard-card-subtitle">Tarefas concluidas nos ultimos 7 dias</p>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-shell chart-shell-sm">
                    <canvas id="tarefasConcluidasChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-6">
        <div class="card dashboard-card">
            <div class="card-header border-0">
                <div>
                    <h3 class="dashboard-card-title">Kanban em foco</h3>
                    <p class="dashboard-card-subtitle">Visao consolidada dos quadros</p>
                </div>
            </div>
            <div class="card-body">
                <div class="kanban-grid">
                    <div class="kanban-box">
                        <span>Pendentes</span>
                        <strong>{{ $kanban['pendentes'] }}</strong>
                    </div>
                    <div class="kanban-box">
                        <span>Em andamento</span>
                        <strong>{{ $kanban['andamento'] }}</strong>
                    </div>
                    <div class="kanban-box">
                        <span>Finalizadas</span>
                        <strong>{{ $kanban['finalizadas'] }}</strong>
                    </div>
                    <div class="kanban-box danger">
                        <span>Atrasadas</span>
                        <strong>{{ $kanban['atrasadas'] }}</strong>
                    </div>
                </div>
                <div class="kanban-footer">
                    @if($kanban['proximoPrazo'])
                        <div class="kanban-next-deadline">
                            <span>Proximo prazo</span>
                            <strong>{{ $kanban['proximoPrazo']->titulo }}</strong>
                            <small>
                                {{ $kanban['proximoPrazo']->data_limite?->format('d/m/Y') }}
                                @if($kanban['proximoPrazo']->quadro)
                                    • {{ $kanban['proximoPrazo']->quadro->nome }}
                                @endif
                            </small>
                        </div>
                    @else
                        <div class="kanban-next-deadline">
                            <span>Proximo prazo</span>
                            <strong>Nada no radar</strong>
                            <small>Sem cards abertos com prazo futuro</small>
                        </div>
                    @endif
                    <a href="{{ route('kanban.index') }}" class="btn btn-sm btn-outline-dark">Abrir kanban</a>
                </div>
            </div>
        </div>
    </div>
</div>
@stop

@push('css')
<style>
    .dashboard-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1rem;
        padding: 1.75rem 1.75rem 1.4rem;
        border-radius: 22px;
        color: #fff;
        background:
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.24), transparent 28%),
            linear-gradient(135deg, #163b68 0%, #0f7b6c 55%, #f39c12 115%);
        box-shadow: 0 18px 45px rgba(12, 36, 62, 0.25);
    }

    .dashboard-row {
        margin-bottom: 1.5rem;
    }

    .dashboard-spotlight {
        margin: 0 0 1.5rem;
        background: linear-gradient(180deg, #ffffff, #f8fbff);
    }

    .dashboard-row:last-child {
        margin-bottom: 0;
    }

    .hero-kicker {
        display: inline-block;
        margin-bottom: .65rem;
        font-size: .8rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        opacity: .72;
    }

    .hero-title {
        margin: 0;
        font-size: 2.2rem;
        font-weight: 800;
        line-height: 1.05;
    }

    .hero-subtitle {
        margin: .55rem 0 0;
        max-width: 640px;
        opacity: .88;
    }

    .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: .65rem;
    }

    .dashboard-card {
        border: 0;
        border-radius: 20px;
        margin-bottom: 1.5rem;
        box-shadow: 0 8px 20px rgba(26, 41, 57, 0.06);
    }

    .dashboard-card .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.3rem 1.3rem 0;
        background: transparent;
        border-bottom: 0;
    }

    .dashboard-card .card-body {
        padding: 1.2rem 1.3rem 1.35rem;
    }

    .spotlight-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
    }

    .spotlight-box {
        padding: 1rem 1.05rem;
        border-radius: 16px;
        background: #f8fafc;
        border: 1px solid #e8eef5;
    }

    .spotlight-box strong,
    .spotlight-box small,
    .spotlight-label {
        display: block;
    }

    .spotlight-box strong {
        margin: .35rem 0;
        color: #182635;
    }

    .spotlight-box small,
    .spotlight-label {
        color: #6b7a89;
    }

    .spotlight-label {
        font-size: .78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .08em;
    }

    .spotlight-box-action {
        background: linear-gradient(135deg, #eff6ff, #f8fafc);
    }

    .spotlight-actions {
        display: flex;
        flex-wrap: wrap;
        gap: .65rem;
        margin-top: .8rem;
    }

    .dashboard-card-title {
        font-size: 1.05rem;
        font-weight: 800;
        margin: 0;
        color: #1b2a38;
        float: none;
    }

    .dashboard-card-subtitle {
        margin: .35rem 0 0;
        color: #6b7a89;
        font-size: .92rem;
    }

    .chart-shell {
        position: relative;
        width: 100%;
        min-height: 180px;
    }

    .chart-shell-sm {
        height: 240px;
    }

    .chart-shell-md {
        height: 280px;
    }

    .chart-shell-lg {
        height: 260px;
    }

    .chart-shell canvas {
        width: 100% !important;
        height: 100% !important;
    }

    .metric-card {
        position: relative;
        overflow: hidden;
        min-height: 158px;
        margin-bottom: 1.5rem;
        padding: 1.35rem;
        border-radius: 20px;
        color: #fff;
        box-shadow: 0 16px 32px rgba(17, 24, 39, 0.15);
    }

    .metric-card::after {
        content: "";
        position: absolute;
        right: -18px;
        bottom: -20px;
        width: 95px;
        height: 95px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.12);
    }

    .metric-indigo { background: linear-gradient(135deg, #334eac 0%, #506fd4 100%); }
    .metric-amber { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); }
    .metric-emerald { background: linear-gradient(135deg, #047857 0%, #10b981 100%); }
    .metric-cyan { background: linear-gradient(135deg, #0f4c81 0%, #0ea5e9 100%); }

    .metric-label {
        font-size: .85rem;
        text-transform: uppercase;
        letter-spacing: .08em;
        opacity: .8;
    }

    .metric-value {
        margin-top: .7rem;
        font-size: 2rem;
        font-weight: 800;
        line-height: 1;
    }

    .metric-money {
        font-size: 1.65rem;
    }

    .metric-foot {
        margin-top: .8rem;
        font-size: .9rem;
        opacity: .85;
    }

    .finance-summary,
    .health-summary,
    .status-legend {
        display: grid;
        gap: .9rem;
    }

    .finance-summary {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-bottom: 1rem;
    }

    .summary-label,
    .pill span,
    .status-legend span {
        display: block;
        color: #6b7a89;
        font-size: .83rem;
    }

    .health-summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-bottom: 1rem;
    }

    .pill,
    .kanban-box {
        padding: 1rem;
        border-radius: 16px;
        background: #f7fafc;
    }

    .pill strong,
    .kanban-box strong {
        display: block;
        margin-top: .35rem;
        font-size: 1.3rem;
        color: #1b2a38;
    }

    .agenda-item,
    .task-item,
    .next-item {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: .95rem 0;
        border-bottom: 1px solid #eef2f6;
        color: inherit;
    }

    .agenda-item:last-child,
    .task-item:last-child,
    .next-item:last-child {
        border-bottom: 0;
    }

    .agenda-time {
        min-width: 56px;
        font-size: 1.05rem;
        font-weight: 800;
        color: #1d4ed8;
    }

    .agenda-content,
    .task-item > div,
    .next-item {
        display: flex;
        flex-direction: column;
    }

    .agenda-content span,
    .task-item span:not(.badge),
    .next-item span {
        color: #6b7a89;
        font-size: .9rem;
    }

    .empty-state {
        padding: 1.5rem 0;
        color: #7a8896;
        text-align: center;
    }

    .task-item-modern {
        align-items: center;
    }

    .task-main {
        min-width: 0;
        flex: 1;
    }

    .task-copy strong,
    .task-copy span {
        display: block;
    }

    .task-copy strong {
        margin-bottom: .2rem;
        font-size: 1rem;
        color: #162433;
    }

    .task-tags {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
        margin-top: .75rem;
    }

    .status-chip,
    .urgency-chip {
        display: inline-flex;
        align-items: center;
        padding: .35rem .7rem;
        border-radius: 999px;
        font-size: .78rem;
        font-weight: 700;
        white-space: nowrap;
    }

    .status-chip-slate {
        color: #334155;
        background: #e2e8f0;
    }

    .status-chip-amber {
        color: #92400e;
        background: #fef3c7;
    }

    .status-chip-emerald {
        color: #166534;
        background: #dcfce7;
    }

    .urgency-chip-low {
        color: #0f766e;
        background: #ccfbf1;
    }

    .urgency-chip-medium {
        color: #9a3412;
        background: #ffedd5;
    }

    .urgency-chip-high {
        color: #991b1b;
        background: #fee2e2;
    }

    .task-cta {
        flex-shrink: 0;
    }

    .kanban-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
    }

    .kanban-box.danger {
        background: #fff1f2;
    }

    .kanban-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eef2f6;
    }

    .kanban-next-deadline span,
    .kanban-next-deadline strong,
    .kanban-next-deadline small {
        display: block;
    }

    .kanban-next-deadline span,
    .kanban-next-deadline small {
        color: #6b7a89;
    }

    .kanban-next-deadline strong {
        color: #182635;
        margin: .2rem 0;
    }

    .main-sidebar,
    .main-sidebar::before,
    .layout-fixed .main-sidebar,
    .layout-fixed .main-sidebar::before,
    .layout-navbar-fixed .main-sidebar,
    .layout-navbar-fixed .main-sidebar::before {
        min-height: 100vh !important;
        height: 100vh !important;
        bottom: 0 !important;
    }

    .layout-fixed .main-sidebar .sidebar,
    .layout-navbar-fixed .main-sidebar .sidebar {
        height: calc(100vh - 3.5rem) !important;
        overflow-y: auto !important;
    }

    @media (max-width: 991.98px) {
        .dashboard-hero {
            flex-direction: column;
            align-items: flex-start;
        }

        .finance-summary {
            grid-template-columns: 1fr;
        }

        .spotlight-grid {
            grid-template-columns: 1fr 1fr;
        }

        .kanban-footer {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    @media (max-width: 575.98px) {
        .hero-title {
            font-size: 1.8rem;
        }

        .spotlight-grid,
        .kanban-grid,
        .health-summary {
            grid-template-columns: 1fr;
        }

        .task-item-modern {
            align-items: flex-start;
            flex-direction: column;
        }
    }
</style>
@endpush

@push('js')
<script>
    const chartData = @json($chartData);

    function makeLineChart(id, datasetLabel, data, labels, color, fillColor) {
        const canvas = document.getElementById(id);

        if (!canvas) {
            return;
        }

        new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: datasetLabel,
                    data,
                    borderColor: color,
                    backgroundColor: fillColor,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    lineTension: 0.35,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    yAxes: [{ ticks: { beginAtZero: true, precision: 0 }, gridLines: { color: 'rgba(148, 163, 184, 0.15)' } }],
                    xAxes: [{ gridLines: { display: false } }]
                }
            }
        });
    }

    makeLineChart(
        'compromissosSemanaChart',
        'Compromissos',
        chartData.compromissosSemana.values,
        chartData.compromissosSemana.labels,
        '#2563eb',
        'rgba(37, 99, 235, 0.12)'
    );

    new Chart(document.getElementById('tarefasStatusChart'), {
        type: 'doughnut',
        data: {
            labels: chartData.tarefasStatus.labels,
            datasets: [{
                data: chartData.tarefasStatus.values,
                backgroundColor: ['#64748b', '#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            },
            cutoutPercentage: 68
        }
    });

    new Chart(document.getElementById('financeiroChart'), {
        type: 'bar',
        data: {
            labels: chartData.financeiro.labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: chartData.financeiro.receitas,
                    backgroundColor: '#16a34a'
                },
                {
                    label: 'Despesas',
                    data: chartData.financeiro.despesas,
                    backgroundColor: '#dc2626'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{ ticks: { beginAtZero: true } }],
                xAxes: [{ gridLines: { display: false } }]
            }
        }
    });

    new Chart(document.getElementById('saudeChart'), {
        type: 'bar',
        data: {
            labels: chartData.saude.labels,
            datasets: [
                {
                    label: 'Minutos',
                    data: chartData.saude.duracao,
                    backgroundColor: '#0ea5e9'
                },
                {
                    label: 'Calorias',
                    data: chartData.saude.calorias,
                    backgroundColor: '#f97316'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{ ticks: { beginAtZero: true } }],
                xAxes: [{ gridLines: { display: false } }]
            }
        }
    });

    makeLineChart(
        'tarefasConcluidasChart',
        'Concluidas',
        chartData.tarefasConcluidas.values,
        chartData.tarefasConcluidas.labels,
        '#7c3aed',
        'rgba(124, 58, 237, 0.12)'
    );
</script>
@endpush

@include('partials.reminder-poller')
