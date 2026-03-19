@extends('adminlte::page')

@section('title', 'Tarefas Diárias')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
  <h1 class="mb-2">Tarefas Diárias</h1>

  <div class="d-flex align-items-end flex-wrap gap-2">
    <div>
      <label for="data" class="mb-1">Selecione o dia</label>
      <input
        type="date"
        id="data"
        name="data"
        class="form-control"
        value="{{ $dataSelecionada }}"
        onchange="mudarData(this.value)"
      >
    </div>

    <div>
      <label for="view" class="mb-1">Visualização</label>
      <select id="view" class="form-control" onchange="mudarVisualizacao(this.value)">
        <option value="lista" {{ $visualizacao === 'lista' ? 'selected' : '' }}>Lista</option>
        <option value="cards" {{ $visualizacao === 'cards' ? 'selected' : '' }}>Cards</option>
      </select>
    </div>

    <a href="{{ route('kanban.index') }}" class="btn btn-outline-secondary">
      <i class="fas fa-columns"></i> Kanban
    </a>

    <button type="button" class="btn btn-success" onclick="abrirModal()">
      <i class="fas fa-plus-circle"></i> Nova Tarefa
    </button>
  </div>
</div>
@stop

@section('content')
@if(session('success'))
  <div class="alert alert-success">
    <i class="fas fa-check-circle"></i> {{ session('success') }}
  </div>
@endif

@php
  $periodos = [
    'manha' => ['label' => 'Manhã', 'icon' => 'fa-sun'],
    'tarde' => ['label' => 'Tarde', 'icon' => 'fa-cloud-sun'],
    'noite' => ['label' => 'Noite', 'icon' => 'fa-moon'],
  ];

  $tarefasPorPeriodo = $tarefas->groupBy(function ($tarefa) {
    $hora = \Carbon\Carbon::parse($tarefa->hora)->format('H');
    if ($hora < 12) {
      return 'manha';
    }
    if ($hora < 18) {
      return 'tarde';
    }
    return 'noite';
  });
@endphp

@if($tarefas->isEmpty())
  <div class="alert alert-info mt-4">
    <i class="fas fa-info-circle"></i> Nenhuma tarefa para {{ \Carbon\Carbon::parse($dataSelecionada)->format('d/m/Y') }}.
  </div>
@else
  <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
    <h5 class="mb-2">Agenda de {{ \Carbon\Carbon::parse($dataSelecionada)->format('d/m/Y') }}</h5>
    <span class="text-muted">{{ $tarefas->count() }} tarefa(s)</span>
  </div>

  @if($visualizacao === 'cards')
    <div class="row">
      @foreach($periodos as $chave => $periodo)
        <div class="col-lg-4 mb-4">
          <div class="period-card h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0"><i class="fas {{ $periodo['icon'] }} mr-2"></i>{{ $periodo['label'] }}</h5>
              <span class="badge badge-light">{{ ($tarefasPorPeriodo[$chave] ?? collect())->count() }}</span>
            </div>

            @forelse($tarefasPorPeriodo[$chave] ?? collect() as $tarefa)
              @include('todo.partials.task-card', ['tarefa' => $tarefa, 'compacto' => false])
            @empty
              <div class="empty-slot">Nenhuma tarefa neste período.</div>
            @endforelse
          </div>
        </div>
      @endforeach
    </div>
  @else
    <div class="timeline-wrapper">
      @foreach($tarefas as $tarefa)
        @include('todo.partials.task-card', ['tarefa' => $tarefa, 'compacto' => true])
      @endforeach
    </div>
  @endif
@endif

<div class="modal fade" id="modalTarefa" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <form method="POST" action="{{ route('todo.store') }}" class="modal-content">
      @csrf
      <input type="hidden" name="data" id="modalData">

      <div class="modal-header">
        <h5 class="modal-title">Nova tarefa do dia</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Hora</label>
          <input type="time" name="hora" class="form-control" required>
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <input type="text" name="descricao" class="form-control" required>
        </div>

        <div class="form-group">
          <label>Urgência</label>
          <select name="urgencia" class="form-control" required>
            <option value="baixa">Baixa</option>
            <option value="media" selected>Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-success">Salvar</button>
      </div>
    </form>
  </div>
</div>

@include('partials.reminder-poller')
@stop

@push('css')
<style>
  .timeline-wrapper{
    display: grid;
    gap: 14px;
  }
  .task-card{
    background: #fff;
    border: 1px solid #e8ecf3;
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  }
  .task-card.done{
    opacity: .65;
  }
  .task-card.done .task-text{
    text-decoration: line-through;
  }
  .task-head{
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .task-meta{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .urgency-tag{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: .8rem;
    font-weight: 700;
  }
  .urgency-baixa{ background: #e8f7ed; color: #157347; }
  .urgency-media{ background: #fff4d6; color: #9a6700; }
  .urgency-alta{ background: #fde8e7; color: #b42318; }
  .status-pill{
    border-radius: 999px;
    padding: 4px 10px;
    font-size: .78rem;
    background: #eff4ff;
    color: #2457d6;
    font-weight: 600;
  }
  .period-card{
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    border: 1px solid #dbe5f0;
    border-radius: 22px;
    padding: 18px;
  }
  .empty-slot{
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    padding: 22px 14px;
    text-align: center;
    color: #64748b;
    background: rgba(255,255,255,.6);
  }
  .task-actions{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
</style>
@endpush

@push('js')
<script>
  function abrirModal() {
    document.getElementById('modalData').value = document.getElementById('data').value;
    $('#modalTarefa').modal('show');
  }

  function mudarData(valor) {
    const url = new URL(window.location.href);
    url.searchParams.set('data', valor);
    window.location.href = url.toString();
  }

  function mudarVisualizacao(valor) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', valor);
    window.location.href = url.toString();
  }
</script>
@endpush
