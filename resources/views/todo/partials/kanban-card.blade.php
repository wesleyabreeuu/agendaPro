
@php
  $urgClass = match($tarefa->urgencia) {
    'alta' => 'urg-alta',
    'media' => 'urg-media',
    default => 'urg-baixa',
  };
@endphp

<div class="kanban-card {{ $urgClass }}" data-id="{{ $tarefa->id }}">
  <div class="d-flex justify-content-between align-items-center">
    <strong>{{ \Carbon\Carbon::parse($tarefa->hora)->format('H:i') }}</strong>

    <div class="btn-group btn-group-sm">
      <a href="{{ route('todo.edit', $tarefa->id) }}" class="btn btn-outline-primary" title="Editar">
        <i class="fas fa-edit"></i>
      </a>

      <form method="POST" action="{{ route('todo.destroy', $tarefa->id) }}"
            onsubmit="return confirm('Excluir esta tarefa?')">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-outline-danger" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </form>
    </div>
  </div>

  <div class="mt-2">
    {{ $tarefa->descricao }}
  </div>
</div>

