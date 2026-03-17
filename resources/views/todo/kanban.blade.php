
@extends('adminlte::page')

@section('title', 'Kanban - Tarefas')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap">
  <h1 class="mb-2">Kanban - Tarefas</h1>

  <div class="d-flex align-items-end">
    <div>
      <label for="data" class="mb-1">Selecione o dia:</label>
      <input
        type="date"
        id="data"
        name="data"
        class="form-control"
        value="{{ $dataSelecionada }}"
        onchange="window.location.href='?data=' + this.value;"
      >
    </div>

    <a href="{{ route('todo.index', ['data' => $dataSelecionada]) }}" class="btn btn-outline-secondary ml-2">
      <i class="fas fa-list"></i> Lista
    </a>

    <button type="button" class="btn btn-success ml-2" onclick="abrirModal()">
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

    <div class="row">
  <div class="col-lg-4 col-md-6 col-sm-12">
    <div class="card card-danger">
      <div class="card-header">
        <h3 class="card-title">Aguardando</h3>
      </div>
      <div class="card-body kanban-col" data-status="aguardando">
        @foreach(($tarefas['aguardando'] ?? collect()) as $tarefa)
          @include('todo.partials.kanban-card', ['tarefa' => $tarefa])
        @endforeach
      </div>
    </div>
  </div>

  <div class="col-lg-4 col-md-6 col-sm-12">
    <div class="card card-warning">
      <div class="card-header">
        <h3 class="card-title">Em execução</h3>
      </div>
      <div class="card-body kanban-col" data-status="execucao">
        @foreach(($tarefas['execucao'] ?? collect()) as $tarefa)
          @include('todo.partials.kanban-card', ['tarefa' => $tarefa])
        @endforeach
      </div>
    </div>
  </div>

  <div class="col-lg-4 col-md-12 col-sm-12">
    <div class="card card-success">
      <div class="card-header">
        <h3 class="card-title">Finalizado</h3>
      </div>
      <div class="card-body kanban-col" data-status="finalizado">
        @foreach(($tarefas['finalizado'] ?? collect()) as $tarefa)
          @include('todo.partials.kanban-card', ['tarefa' => $tarefa])
        @endforeach
      </div>
    </div>
  </div>
</div>



<div class="modal fade" id="modalTarefa" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <form method="POST" action="{{ route('todo.store') }}" class="modal-content">
      @csrf
      <input type="hidden" name="data" id="modalData">

      <div class="modal-header">
        <h5 class="modal-title">Nova Tarefa</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Hora:</label>
          <input type="time" name="hora" class="form-control" required>
        </div>

        <div class="form-group">
          <label>Descrição:</label>
          <input type="text" name="descricao" class="form-control" required>
        </div>

        <div class="form-group">
          <label>Urgência:</label>
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
  .kanban-col{
    min-height: 60vh;
    background: #f8f9fa;
    border-radius: 6px;
    padding: 10px;
  }
  .kanban-card{
    background: #fff;
    border: 1px solid #e5e7eb;
    border-left-width: 6px;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    cursor: grab;
  }
  .kanban-card:active{ cursor: grabbing; }

  .urg-baixa{ border-left-color: #28a745; }
  .urg-media{ border-left-color: #ffc107; }
  .urg-alta{  border-left-color: #dc3545; }

  .drop-hint{
    border: 2px dashed #cbd5e1;
    background: #f1f5f9;
  }
</style>
@endpush

@push('js')
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>

<script>
  function abrirModal() {
    const dataSelecionada = document.getElementById('data').value;
    if (!dataSelecionada) {
      alert('Selecione uma data primeiro.');
      return;
    }
    document.getElementById('modalData').value = dataSelecionada;
    $('#modalTarefa').modal('show');
  }

    async function atualizarStatus(id, status) {
    const url = "{{ route('todo.status', ['todo' => '__ID__']) }}".replace('__ID__', id);


    const res = await fetch(url, {
        method: "PATCH",
        credentials: "include", // 🔥 ESSENCIAL
        headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": "{{ csrf_token() }}",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json"
        },
        body: JSON.stringify({ status })
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error(res.status, txt);
        alert("Erro ao atualizar status");
        throw new Error("PATCH falhou");
    }
    }


  document.querySelectorAll('.kanban-col').forEach(col => {
    new Sortable(col, {
      group: 'kanban',
      animation: 150,
      ghostClass: 'drop-hint',
      onEnd: async function (evt) {
        const card = evt.item;

        // ✅ atenção: no card usamos data-id
        const id = card.getAttribute('data-id');
        const novoStatus = evt.to.getAttribute('data-status');

        try {
          await atualizarStatus(id, novoStatus);
        } catch (e) {
          window.location.reload();
        }
      }
    });
  });
</script>

@endpush

