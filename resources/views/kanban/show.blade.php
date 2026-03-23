@extends('adminlte::page')

@section('title', 'Kanban')

@php
  $statusOptions = [
    'aguardando' => ['title' => 'Aguardando', 'theme' => 'danger'],
    'execucao' => ['title' => 'Em execução', 'theme' => 'warning'],
    'finalizado' => ['title' => 'Finalizado', 'theme' => 'success'],
    'atrasado' => ['title' => 'Em atraso', 'theme' => 'dark'],
  ];
@endphp

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
  <div>
    <h1 class="mb-1">{{ $board->nome }}</h1>
    <p class="text-muted mb-0">{{ $board->descricao ?: 'Sem descrição cadastrada.' }}</p>
  </div>

  <div class="d-flex gap-2 flex-wrap">
    <a href="{{ route('kanban.index') }}" class="btn btn-outline-secondary">
      <i class="fas fa-arrow-left"></i> Voltar aos quadros
    </a>
    <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#modalBoardEdit">
      <i class="fas fa-pen"></i> Editar quadro
    </button>
    <button type="button" class="btn btn-success" data-toggle="modal" data-target="#modalTask">
      <i class="fas fa-plus-circle"></i> Nova tarefa
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

<div class="board-hero mb-4">
  <div>
    <div class="d-flex flex-wrap gap-2">
      <span class="hero-pill"><i class="fas fa-clone"></i> {{ $board->tarefas->count() }} cards</span>
      <span class="hero-pill"><i class="fas fa-tags"></i> Etiquetas por tarefa</span>
      <span class="hero-pill"><i class="fas fa-check-square"></i> Checklists e campos extras</span>
    </div>
  </div>

  <form method="POST" action="{{ route('kanban.boards.destroy', $board->id) }}" onsubmit="return confirm('Excluir este quadro e todas as tarefas?')">
    @csrf
    @method('DELETE')
    <button type="submit" class="btn btn-outline-danger btn-sm">Excluir quadro</button>
  </form>
</div>

<div class="row kanban-grid">
  @foreach($statusOptions as $status => $config)
    <div class="col-xl-3 col-md-6 mb-4 d-flex">
      <div class="card card-{{ $config['theme'] }} h-100 board-column-shell">
        <div class="card-header">
          <h3 class="card-title">{{ $config['title'] }}</h3>
          <div class="card-tools">
            <span class="badge badge-light">{{ ($tarefas[$status] ?? collect())->count() }}</span>
          </div>
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

@foreach($tarefas as $tarefasStatus)
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

    <div class="modal fade" id="modalTaskEdit-{{ $tarefa->id }}" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <form method="POST" action="{{ route('kanban.tasks.update', $tarefa->id) }}" class="modal-content task-form">
          @csrf
          @method('PUT')
          <div class="modal-header">
            <h5 class="modal-title">Editar card</h5>
            <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-8">
                <div class="form-group">
                  <label>Título</label>
                  <input type="text" name="titulo" class="form-control" value="{{ $tarefa->titulo }}" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Status</label>
                  <select name="status" class="form-control" required>
                    @foreach($statusOptions as $option => $statusConfig)
                      <option value="{{ $option }}" @selected($tarefa->status === $option)>{{ $statusConfig['title'] }}</option>
                    @endforeach
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Descrição</label>
              <textarea name="descricao" class="form-control" rows="3">{{ $tarefa->descricao }}</textarea>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Urgência</label>
                  <select name="urgencia" class="form-control" required>
                    <option value="baixa" @selected($tarefa->urgencia === 'baixa')>Baixa</option>
                    <option value="media" @selected($tarefa->urgencia === 'media')>Média</option>
                    <option value="alta" @selected($tarefa->urgencia === 'alta')>Alta</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Data limite</label>
                  <input type="date" name="data_limite" class="form-control" value="{{ $tarefa->data_limite?->format('Y-m-d') }}">
                </div>
              </div>
            </div>

            <div class="task-builder mt-4">
              <div class="builder-section">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0">Etiquetas</h6>
                  <button type="button" class="btn btn-outline-primary btn-sm add-repeater-item" data-target="#labels-edit-{{ $tarefa->id }}" data-template="label-template">
                    <i class="fas fa-plus"></i> Adicionar etiqueta
                  </button>
                </div>
                <div class="repeater-list" id="labels-edit-{{ $tarefa->id }}">
                  @forelse($tarefa->etiquetas ?? [] as $index => $etiqueta)
                    <div class="repeater-item">
                      <input type="text" name="etiquetas[{{ $index }}][nome]" class="form-control" value="{{ $etiqueta['nome'] ?? '' }}" placeholder="Nome da etiqueta">
                      <input type="color" name="etiquetas[{{ $index }}][cor]" class="form-control color-input" value="{{ $etiqueta['cor'] ?? '#2563eb' }}">
                      <button type="button" class="btn btn-outline-danger btn-sm remove-repeater-item"><i class="fas fa-trash"></i></button>
                    </div>
                  @empty
                  @endforelse
                </div>
              </div>

              <div class="builder-section">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0">Checklist</h6>
                  <button type="button" class="btn btn-outline-primary btn-sm add-repeater-item" data-target="#checklist-edit-{{ $tarefa->id }}" data-template="checklist-template">
                    <i class="fas fa-plus"></i> Adicionar item
                  </button>
                </div>
                <div class="repeater-list" id="checklist-edit-{{ $tarefa->id }}">
                  @forelse($tarefa->checklist ?? [] as $index => $item)
                    <div class="repeater-item repeater-item-check">
                      <input type="text" name="checklist[{{ $index }}][titulo]" class="form-control" value="{{ $item['titulo'] ?? '' }}" placeholder="Ex.: Validar contrato">
                      <div class="custom-control custom-checkbox mt-2 mt-md-0">
                        <input type="hidden" name="checklist[{{ $index }}][done]" value="0">
                        <input type="checkbox" name="checklist[{{ $index }}][done]" value="1" class="custom-control-input" id="check-{{ $tarefa->id }}-{{ $index }}" @checked(!empty($item['done']))>
                        <label class="custom-control-label" for="check-{{ $tarefa->id }}-{{ $index }}">Concluído</label>
                      </div>
                      <button type="button" class="btn btn-outline-danger btn-sm remove-repeater-item"><i class="fas fa-trash"></i></button>
                    </div>
                  @empty
                  @endforelse
                </div>
              </div>

              <div class="builder-section">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0">Campos personalizados</h6>
                  <button type="button" class="btn btn-outline-primary btn-sm add-repeater-item" data-target="#fields-edit-{{ $tarefa->id }}" data-template="field-template">
                    <i class="fas fa-plus"></i> Adicionar campo
                  </button>
                </div>
                <div class="repeater-list" id="fields-edit-{{ $tarefa->id }}">
                  @forelse($tarefa->campos_personalizados ?? [] as $index => $campo)
                    <div class="repeater-item repeater-item-field">
                      <input type="text" name="campos_personalizados[{{ $index }}][nome]" class="form-control" value="{{ $campo['nome'] ?? '' }}" placeholder="Nome do campo">
                      <input type="text" name="campos_personalizados[{{ $index }}][valor]" class="form-control" value="{{ $campo['valor'] ?? '' }}" placeholder="Valor">
                      <button type="button" class="btn btn-outline-danger btn-sm remove-repeater-item"><i class="fas fa-trash"></i></button>
                    </div>
                  @empty
                  @endforelse
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar alterações</button>
          </div>
        </form>
      </div>
    </div>
  @endforeach
@endforeach

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
  <div class="modal-dialog modal-lg" role="document">
    <form method="POST" action="{{ route('kanban.tasks.store', $board->id) }}" class="modal-content task-form">
      @csrf
      <div class="modal-header">
        <h5 class="modal-title">Nova tarefa no quadro</h5>
        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-8">
            <div class="form-group">
              <label>Título</label>
              <input type="text" name="titulo" class="form-control" required>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label>Urgência</label>
              <select name="urgencia" class="form-control" required>
                <option value="baixa">Baixa</option>
                <option value="media" selected>Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <textarea name="descricao" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Data limite</label>
          <input type="date" name="data_limite" class="form-control">
        </div>

        <div class="task-builder mt-4">
          <div class="builder-section">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Etiquetas</h6>
              <button type="button" class="btn btn-outline-primary btn-sm add-repeater-item" data-target="#labels-create" data-template="label-template">
                <i class="fas fa-plus"></i> Adicionar etiqueta
              </button>
            </div>
            <div class="repeater-list" id="labels-create"></div>
          </div>

          <div class="builder-section">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Checklist</h6>
              <button type="button" class="btn btn-outline-primary btn-sm add-repeater-item" data-target="#checklist-create" data-template="checklist-template">
                <i class="fas fa-plus"></i> Adicionar item
              </button>
            </div>
            <div class="repeater-list" id="checklist-create"></div>
          </div>

          <div class="builder-section">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Campos personalizados</h6>
              <button type="button" class="btn btn-outline-primary btn-sm add-repeater-item" data-target="#fields-create" data-template="field-template">
                <i class="fas fa-plus"></i> Adicionar campo
              </button>
            </div>
            <div class="repeater-list" id="fields-create"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-success">Salvar tarefa</button>
      </div>
    </form>
  </div>
</div>

<template id="label-template">
  <div class="repeater-item">
    <input type="text" data-name="nome" class="form-control" placeholder="Nome da etiqueta">
    <input type="color" data-name="cor" class="form-control color-input" value="#2563eb">
    <button type="button" class="btn btn-outline-danger btn-sm remove-repeater-item"><i class="fas fa-trash"></i></button>
  </div>
</template>

<template id="checklist-template">
  <div class="repeater-item repeater-item-check">
    <input type="text" data-name="titulo" class="form-control" placeholder="Ex.: Ligar para o fornecedor">
    <div class="custom-control custom-checkbox mt-2 mt-md-0">
      <input type="hidden" data-name="done" value="0">
      <input type="checkbox" value="1" class="custom-control-input generated-checkbox">
      <label class="custom-control-label">Concluído</label>
    </div>
    <button type="button" class="btn btn-outline-danger btn-sm remove-repeater-item"><i class="fas fa-trash"></i></button>
  </div>
</template>

<template id="field-template">
  <div class="repeater-item repeater-item-field">
    <input type="text" data-name="nome" class="form-control" placeholder="Nome do campo">
    <input type="text" data-name="valor" class="form-control" placeholder="Valor">
    <button type="button" class="btn btn-outline-danger btn-sm remove-repeater-item"><i class="fas fa-trash"></i></button>
  </div>
</template>

@include('partials.reminder-poller')
@stop

@push('css')
<style>
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
  .hero-pill{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.85);
    border: 1px solid #dbeafe;
    color: #334155;
    font-size: .85rem;
  }
  .board-column-shell .card-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .board-column-shell{
    width: 100%;
  }
  .kanban-column{
    min-height: 62vh;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    padding: 12px;
  }
  .kanban-task{
    background: #fff;
    border-radius: 18px;
    padding: 14px;
    margin-bottom: 12px;
    border-left: 5px solid #94a3b8;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  }
  .kanban-task.urg-alta{ border-left-color: #dc2626; }
  .kanban-task.urg-media{ border-left-color: #d97706; }
  .kanban-task.urg-baixa{ border-left-color: #16a34a; }
  .task-title{
    font-size: 1rem;
    line-height: 1.35;
  }
  .task-labels{
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .task-label{
    color: #fff;
    font-size: .72rem;
    font-weight: 600;
    padding: 5px 9px;
    border-radius: 999px;
  }
  .task-fields{
    background: #f8fafc;
    border-radius: 12px;
    padding: 10px;
    border: 1px solid #e2e8f0;
  }
  .task-field-line{
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: .84rem;
    margin-bottom: 6px;
  }
  .task-field-line:last-child{
    margin-bottom: 0;
  }
  .kanban-grid{
    margin-left: -8px;
    margin-right: -8px;
  }
  .kanban-grid > [class*='col-']{
    padding-left: 8px;
    padding-right: 8px;
  }
  .task-builder{
    display: grid;
    gap: 18px;
  }
  .builder-section{
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px;
    background: #f8fafc;
  }
  .repeater-list{
    display: grid;
    gap: 10px;
  }
  .repeater-item{
    display: grid;
    grid-template-columns: 1.6fr 120px 44px;
    gap: 10px;
    align-items: center;
  }
  .repeater-item-check{
    grid-template-columns: 1.8fr auto 44px;
  }
  .repeater-item-field{
    grid-template-columns: 1fr 1.2fr 44px;
  }
  .color-input{
    min-height: 38px;
  }
  @media (max-width: 767px){
    .board-hero{
      padding: 16px;
    }
    .repeater-item,
    .repeater-item-check,
    .repeater-item-field{
      grid-template-columns: 1fr;
    }
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
          if (data && data.requiresConfirmation) {
            pendingMove = { id, status, ordem };
            showMoveToDelayedConfirmation(data.message);
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

  function showMoveToDelayedConfirmation(message) {
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

  function buildInputName(prefix, index, field) {
    return `${prefix}[${index}][${field}]`;
  }

  function ensureCheckboxId(wrapper, prefix, index) {
    const checkbox = wrapper.querySelector('.generated-checkbox');
    const label = wrapper.querySelector('.custom-control-label');

    if (!checkbox || !label) {
      return;
    }

    const id = `${prefix.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
    checkbox.id = id;
    checkbox.name = buildInputName(prefix, index, 'done');
    label.setAttribute('for', id);
  }

  function reindexRepeater(container) {
    const prefix = container.id === 'labels-create' || container.id.startsWith('labels-')
      ? 'etiquetas'
      : (container.id === 'checklist-create' || container.id.startsWith('checklist-') ? 'checklist' : 'campos_personalizados');

    Array.from(container.children).forEach((item, index) => {
      item.querySelectorAll('[data-name]').forEach((input) => {
        input.name = buildInputName(prefix, index, input.dataset.name);
      });

      item.querySelectorAll('input[type="hidden"][data-name="done"]').forEach((input) => {
        input.name = buildInputName(prefix, index, 'done');
      });

      ensureCheckboxId(item, prefix, index);
    });
  }

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-repeater-item');

    if (addButton) {
      const container = document.querySelector(addButton.dataset.target);
      const template = document.getElementById(addButton.dataset.template);

      if (!container || !template) {
        return;
      }

      const fragment = template.content.cloneNode(true);
      container.appendChild(fragment);
      reindexRepeater(container);
      return;
    }

    const removeButton = event.target.closest('.remove-repeater-item');

    if (removeButton) {
      const item = removeButton.closest('.repeater-item');
      const container = item ? item.parentElement : null;

      if (item) {
        item.remove();
      }

      if (container) {
        reindexRepeater(container);
      }
    }
  });

  document.querySelectorAll('.repeater-list').forEach(reindexRepeater);
</script>
@endpush
