@extends('adminlte::page')

@section('title', 'Tarefas Diárias')

@section('content_header')
  <h1 class="mb-3">Tarefas Diárias</h1>
@stop

@section('content')
<div class="row">
  <div class="col-md-6">
    <label for="data">Selecione o dia:</label>
    <input
      type="date"
      id="data"
      name="data"
      class="form-control"
      value="{{ $dataSelecionada }}"
      onchange="window.location.href='?data=' + this.value;"
    >
  </div>

  <div class="col-md-6 d-flex align-items-end justify-content-end">
    <button type="button" class="btn btn-success mt-3" onclick="abrirModal()">
      <i class="fas fa-plus-circle"></i> Nova Tarefa
    </button>
  </div>
</div>

<hr class="my-4">

@if(session('success'))
  <div class="alert alert-success">
    <i class="fas fa-check-circle"></i> {{ session('success') }}
  </div>
@endif

@if($tarefas->count())
  <div class="mt-4">
    <h5>
      Tarefas para o dia
      {{ \Carbon\Carbon::parse($dataSelecionada)->format('d/m/Y') }}
    </h5>

    <ul class="list-group mt-3">
      @foreach($tarefas as $tarefa)
        @php
          $urgBadge = match($tarefa->urgencia) {
            'alta' => 'danger',
            'media' => 'warning',
            default => 'success',
          };

          $urgLabel = match($tarefa->urgencia) {
            'alta' => 'Alta',
            'media' => 'Média',
            default => 'Baixa',
          };

          $status = $tarefa->status ?? 'aguardando';

          $statusBadge = match($status) {
            'execucao' => 'primary',
            'finalizado' => 'secondary',
            default => 'info',
          };

          $statusLabel = match($status) {
            'execucao' => 'Em execução',
            'finalizado' => 'Finalizado',
            default => 'Aguardando início',
          };

          $isDone = ($status === 'finalizado');
        @endphp

        <li class="list-group-item task-item {{ $isDone ? 'task-done' : '' }}">
          <div class="d-flex justify-content-between align-items-start gap-3">

            <div class="d-flex align-items-start gap-3 w-100">
              {{-- Checkbox finaliza/desfaz --}}
              <form method="POST" action="{{ route('todo.status', $tarefa->id) }}" class="pt-1">
                @csrf
                @method('PATCH')
                <input type="hidden" name="status" value="{{ $isDone ? 'aguardando' : 'finalizado' }}">
                <input
                  class="form-check-input"
                  type="checkbox"
                  onchange="this.form.submit()"
                  {{ $isDone ? 'checked' : '' }}
                >
              </form>

              <div class="w-100">
                <div class="d-flex align-items-center flex-wrap gap-2">
                  <strong>{{ \Carbon\Carbon::parse($tarefa->hora)->format('H:i') }}</strong>

                  <span class="badge badge-{{ $urgBadge }}">
                    Urgência: {{ $urgLabel }}
                  </span>

                  <span class="badge badge-{{ $statusBadge }}">
                    {{ $statusLabel }}
                  </span>
                </div>

                <div class="mt-2">
                  <span class="task-text">{{ $tarefa->descricao }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              {{-- Seletor de status --}}
              <form method="POST" action="{{ route('todo.status', $tarefa->id) }}">
                @csrf
                @method('PATCH')
                <select name="status" class="form-control form-control-sm" onchange="this.form.submit()">
                  <option value="aguardando" {{ $status==='aguardando' ? 'selected' : '' }}>Aguardando</option>
                  <option value="execucao" {{ $status==='execucao' ? 'selected' : '' }}>Em execução</option>
                  <option value="finalizado" {{ $status==='finalizado' ? 'selected' : '' }}>Finalizado</option>
                </select>
              </form>

              <div class="btn-group btn-group-sm" role="group">
                <a href="{{ route('todo.edit', $tarefa->id) }}" class="btn btn-outline-primary">
                  <i class="fas fa-edit"></i>
                </a>

                <form
                  method="POST"
                  action="{{ route('todo.destroy', $tarefa->id) }}"
                  onsubmit="return confirm('Tem certeza que deseja excluir esta tarefa?')"
                >
                  @csrf
                  @method('DELETE')
                  <button type="submit" class="btn btn-outline-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </li>
      @endforeach
    </ul>
  </div>
@else
  <div class="mt-4 alert alert-info">
    <i class="fas fa-info-circle"></i> Nenhuma tarefa para o dia selecionado.
  </div>
@endif

{{-- Modal (AdminLTE / Bootstrap 4) --}}
<div class="modal fade" id="modalTarefa" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <form method="POST" action="{{ route('todo.store') }}" class="modal-content">
      @csrf
      <input type="hidden" name="data" id="modalData">

      <div class="modal-header">
        <h5 class="modal-title" id="modalLabel">Nova Tarefa</h5>

        {{-- FECHAR (BS4) --}}
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="hora">Hora:</label>
          <input type="time" name="hora" class="form-control" required>
        </div>

        <div class="form-group">
          <label for="descricao">Descrição:</label>
          <input type="text" name="descricao" class="form-control" required>
        </div>

        <div class="form-group">
          <label for="urgencia">Urgência:</label>
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
@stop

@push('css')
<style>
  .task-item{
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .task-done{
    opacity: .55;
  }
  .task-done .task-text{
    text-decoration: line-through;
  }
</style>
@endpush

@push('js')
<script>
  function abrirModal() {
    const dataSelecionada = document.getElementById('data').value;

    if (!dataSelecionada) {
      alert('Selecione uma data primeiro.');
      return;
    }

    document.getElementById('modalData').value = dataSelecionada;

    // AdminLTE 3 / Bootstrap 4
    if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
      $('#modalTarefa').modal('show');
    } else {
      console.error('Bootstrap modal/jQuery não carregados. Verifique AdminLTE assets.');
      alert('Erro: modal não disponível. Verifique se o AdminLTE está carregando os scripts.');
    }
  }
</script>
@endpush
