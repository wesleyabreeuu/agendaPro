@extends('adminlte::page')

@section('title', 'Quadros Kanban')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
  <div>
    <h1 class="mb-1">Quadros Kanban</h1>
    <p class="text-muted mb-0">Crie, edite e acompanhe seus quadros em aberto antes de entrar no fluxo de tarefas.</p>
  </div>

  <div class="d-flex gap-2 flex-wrap">
    <a href="{{ route('todo.index') }}" class="btn btn-outline-secondary">
      <i class="fas fa-list"></i> ToDo diário
    </a>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalBoard">
      <i class="fas fa-plus"></i> Novo quadro
    </button>
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

<div class="board-summary mb-4">
  <div class="summary-card">
    <span class="summary-label">Quadros em aberto</span>
    <strong class="summary-value">{{ $boards->count() }}</strong>
  </div>
  <div class="summary-card">
    <span class="summary-label">Cards ativos</span>
    <strong class="summary-value">{{ $boards->sum('tarefas_count') }}</strong>
  </div>
</div>

@if($boards->isEmpty())
  <div class="empty-state">
    <h4 class="mb-2">Nenhum quadro criado ainda</h4>
    <p class="text-muted mb-3">Crie seu primeiro quadro para começar a organizar tarefas por contexto.</p>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalBoard">
      Criar primeiro quadro
    </button>
  </div>
@else
  <div class="row">
    @foreach($boards as $board)
      <div class="col-lg-4 col-md-6 mb-4 d-flex">
        <div class="board-card w-100">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 class="mb-1">{{ $board->nome }}</h4>
              <p class="text-muted mb-0">{{ $board->descricao ?: 'Sem descrição cadastrada.' }}</p>
            </div>
            <span class="badge badge-primary">{{ $board->tarefas_count }} cards</span>
          </div>

          <div class="board-actions">
            <a href="{{ route('kanban.show', $board->id) }}" class="btn btn-primary">
              <i class="fas fa-columns"></i> Abrir quadro
            </a>
            <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#modalBoardEdit-{{ $board->id }}">
              <i class="fas fa-pen"></i> Editar
            </button>
            <form method="POST" action="{{ route('kanban.boards.destroy', $board->id) }}" onsubmit="return confirm('Excluir este quadro e todas as tarefas?')">
              @csrf
              @method('DELETE')
              <button type="submit" class="btn btn-outline-danger">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="modal fade" id="modalBoardEdit-{{ $board->id }}" tabindex="-1" role="dialog" aria-hidden="true">
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
    @endforeach
  </div>
@endif

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
@stop

@push('css')
<style>
  .board-summary{
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 220px));
    gap: 16px;
  }
  .summary-card{
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    border-radius: 18px;
    padding: 18px;
    display: grid;
    gap: 6px;
  }
  .summary-label{
    color: #64748b;
    font-size: .92rem;
  }
  .summary-value{
    font-size: 2rem;
    line-height: 1;
    color: #0f172a;
  }
  .board-card{
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    padding: 20px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  }
  .board-actions{
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  .empty-state{
    border: 1px dashed #cbd5e1;
    border-radius: 20px;
    padding: 40px 24px;
    text-align: center;
    background: #fff;
  }
  @media (max-width: 767px){
    .board-summary{
      grid-template-columns: 1fr;
    }
  }
</style>
@endpush
