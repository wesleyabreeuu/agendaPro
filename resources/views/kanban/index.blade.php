@extends('adminlte::page')

@section('title', 'Kanban')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
  <div>
    <h1 class="mb-1">Kanban</h1>
    <p class="text-muted mb-0">Quadros separados por contexto, com coluna fixa para itens em atraso.</p>
  </div>

  <div class="d-flex gap-2 flex-wrap">
    <a href="{{ route('todo.index') }}" class="btn btn-outline-secondary">
      <i class="fas fa-list"></i> ToDo diário
    </a>
    <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#modalBoard">
      <i class="fas fa-plus"></i> Novo quadro
    </button>
    @if($board)
      <button type="button" class="btn btn-success" data-toggle="modal" data-target="#modalTask">
        <i class="fas fa-plus-circle"></i> Nova tarefa
      </button>
    @endif
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

<div class="row mb-4">
  <div class="col-lg-3 mb-3">
    <div class="board-sidebar">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Quadros</h5>
        <span class="badge badge-light">{{ $boards->count() }}</span>
      </div>

      @forelse($boards as $item)
        <a href="{{ route('kanban.index', ['board' => $item->id]) }}" class="board-link {{ $board && $board->id === $item->id ? 'active' : '' }}">
          <span>{{ $item->nome }}</span>
          <small>{{ $item->tarefas_count }} tarefa(s)</small>
        </a>
      @empty
        <div class="empty-board">Crie seu primeiro quadro para começar.</div>
      @endforelse
    </div>
  </div>

  <div class="col-lg-9">
    @if(!$board)
      <div class="alert alert-info">Nenhum quadro criado ainda.</div>
    @else
      <div class="board-hero mb-4">
        <div>
          <h3 class="mb-1">{{ $board->nome }}</h3>
          <p class="mb-0 text-muted">{{ $board->descricao ?: 'Sem descrição cadastrada.' }}</p>
        </div>

        <div class="d-flex gap-2 flex-wrap">
          <button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal" data-target="#modalBoardEdit">
            Editar quadro
          </button>
          <form method="POST" action="{{ route('kanban.boards.destroy', $board->id) }}" onsubmit="return confirm('Excluir este quadro e todas as tarefas?')">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-outline-danger btn-sm">Excluir quadro</button>
          </form>
        </div>
      </div>

      <div class="row kanban-grid">
        @foreach([
          'aguardando' => ['title' => 'Aguardando', 'theme' => 'danger'],
          'execucao' => ['title' => 'Em execução', 'theme' => 'warning'],
          'finalizado' => ['title' => 'Finalizado', 'theme' => 'success'],
          'atrasado' => ['title' => 'Em atraso', 'theme' => 'dark'],
        ] as $status => $config)
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card card-{{ $config['theme'] }} h-100">
              <div class="card-header">
                <h3 class="card-title">{{ $config['title'] }}</h3>
              </div>
              <div class="card-body kanban-column" data-status="{{ $status }}">
                @forelse($tarefas[$status] ?? collect() as $tarefa)
                  @include('kanban.partials.card', ['tarefa' => $tarefa])
                @empty
                @endforelse
              </div>
            </div>
          </div>
        @endforeach
      </div>

      @if($board)
        @foreach($tarefas as $status => $tarefasStatus)
          @foreach($tarefasStatus as $tarefa)
            @if($tarefa->status === 'atrasado' && $tarefa->data_limite)
              <div class="modal fade" id="modalExtendDeadline-{{ $tarefa->id }}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <form method="POST" action="{{ route('kanban.tasks.extend-deadline', $tarefa->id) }}" class="modal-content">
                    @csrf
                    <div class="modal-header">
                      <h5 class="modal-title">Estender prazo - {{ $tarefa->titulo }}</h5>
                      <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                    </div>
                    <div class="modal-body">
                      <div class="form-group">
                        <label>Novo prazo</label>
                        <input type="date" name="data_limite" class="form-control" value="{{ $tarefa->data_limite->format('Y-m-d') }}" required>
                      </div>
                      <div class="alert alert-info mb-0">
                        <small>Data anterior: <strong>{{ $tarefa->data_limite->format('d/m/Y') }}</strong></small>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                      <button type="submit" class="btn btn-primary">Estender prazo</button>
                    </div>
                  </form>
                </div>
              </div>
            @endif
          @endforeach
        @endforeach
      @endif
    @endif
  </div>
</div>

<div class="modal fade" id="modalBoard" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <form method="POST" action="{{ route('kanban.boards.store') }}" class="modal-content">
      @csrf
      <div class="modal-header">
        <h5 class="modal-title">Novo quadro</h5>
        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" name="nome" class="form-control" required>
        </div>
        <div class="form-group mb-0">
          <label>Descrição</label>
          <input type="text" name="descricao" class="form-control">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Criar quadro</button>
      </div>
    </form>
  </div>
</div>

@if($board)
  <div class="modal fade" id="modalBoardEdit" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <form method="POST" action="{{ route('kanban.boards.update', $board->id) }}" class="modal-content">
        @csrf
        @method('PUT')
        <div class="modal-header">
          <h5 class="modal-title">Editar quadro</h5>
          <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" name="nome" class="form-control" value="{{ $board->nome }}" required>
          </div>
          <div class="form-group mb-0">
            <label>Descrição</label>
            <input type="text" name="descricao" class="form-control" value="{{ $board->descricao }}">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal fade" id="modalTask" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <form method="POST" action="{{ route('kanban.tasks.store', $board->id) }}" class="modal-content">
        @csrf
        <div class="modal-header">
          <h5 class="modal-title">Nova tarefa no quadro</h5>
          <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Título</label>
            <input type="text" name="titulo" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea name="descricao" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Urgência</label>
            <select name="urgencia" class="form-control" required>
              <option value="baixa">Baixa</option>
              <option value="media" selected>Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label>Data limite</label>
            <input type="date" name="data_limite" class="form-control">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-success">Salvar tarefa</button>
        </div>
      </form>
    </div>
  </div>
@endif

@include('partials.reminder-poller')
@stop

@push('css')
<style>
  .board-sidebar{
    background: #f8fafc;
    border: 1px solid #dbe5f0;
    border-radius: 20px;
    padding: 18px;
    height: 100%;
  }
  .board-link{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    color: #1f2937;
    text-decoration: none;
    background: #fff;
    border: 1px solid transparent;
    margin-bottom: 10px;
  }
  .board-link.active{
    border-color: #1f6feb;
    box-shadow: 0 10px 24px rgba(31, 111, 235, 0.12);
  }
  .board-link small{
    color: #64748b;
  }
  .board-hero{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    border-radius: 22px;
    padding: 20px;
  }
  .kanban-column{
    min-height: 62vh;
    background: #f8fafc;
    border-radius: 12px;
    padding: 12px;
  }
  .kanban-task{
    background: #fff;
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 12px;
    border-left: 5px solid #94a3b8;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  }
  .kanban-task.urg-alta{ border-left-color: #dc2626; }
  .kanban-task.urg-media{ border-left-color: #d97706; }
  .kanban-task.urg-baixa{ border-left-color: #16a34a; }
  .kanban-empty, .empty-board{
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    color: #64748b;
    background: rgba(255,255,255,.75);
  }
</style>
@endpush

@push('js')
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
<script>
  let pendingMove = null;

  document.querySelectorAll('.kanban-column').forEach((column) => {
    new Sortable(column, {
      group: 'agenda-kanban',
      animation: 150,
      onEnd: async function (evt) {
        const item = evt.item;
        const id = item.dataset.id;
        const status = evt.to.dataset.status;
        const ordem = Array.from(evt.to.children).filter((node) => node.dataset && node.dataset.id).indexOf(item);
        const url = "{{ route('kanban.tasks.status', ['task' => '__ID__']) }}".replace('__ID__', id);

        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': "{{ csrf_token() }}",
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ status, ordem })
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          // Se requer confirmação para mover para atrasado
          if (data && data.requiresConfirmation) {
            pendingMove = { id, status, ordem };
            showMoveToDelayedConfirmation(data.message, data.currentDeadline);
            // Não recarrega aqui, deixa o modal aparecer
          } else if (data && data.message) {
            alert(data.message);
            window.location.reload();
          } else {
            window.location.reload();
          }
        }
      }
    });
  });

  function showMoveToDelayedConfirmation(message, currentDeadline) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalMoveDelayed';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Mover para Em Atraso</h5>
            <button type="button" class="close" onclick="cancelMoveToDelayed()"><span>&times;</span></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
            <div class="alert alert-warning mb-0">
              <small><strong>Data atual:</strong> ${new Date().toLocaleDateString('pt-BR')}</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="cancelMoveToDelayed()">Cancelar</button>
            <button type="button" class="btn btn-danger" onclick="confirmMoveToDelayed()">Confirmar e Marcar como Atrasado</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    $('#modalMoveDelayed').modal('show');
  }

  function cancelMoveToDelayed() {
    pendingMove = null;
    window.location.reload();
  }

  function confirmMoveToDelayed() {
    if (!pendingMove) return;

    const { id, status, ordem } = pendingMove;
    const url = "{{ route('kanban.tasks.status', ['task' => '__ID__']) }}".replace('__ID__', id);

    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': "{{ csrf_token() }}",
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ status, ordem, confirmed: true })
    }).then(response => {
      if (response.ok) {
        $('#modalMoveDelayed').modal('hide');
        setTimeout(() => window.location.reload(), 300);
      } else {
        alert('Erro ao mover tarefa. Tente novamente.');
        window.location.reload();
      }
    }).catch(() => {
      alert('Erro ao conectar com o servidor.');
      window.location.reload();
    });
  }
</script>
@endpush
