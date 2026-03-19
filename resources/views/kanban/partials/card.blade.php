@php
  $urgenciaClass = match($tarefa->urgencia) {
    'alta' => 'urg-alta',
    'media' => 'urg-media',
    default => 'urg-baixa',
  };
@endphp

<div class="kanban-task {{ $urgenciaClass }}" data-id="{{ $tarefa->id }}" data-locked="{{ $tarefa->status === 'atrasado' ? 'true' : 'false' }}">
  <div class="d-flex justify-content-between align-items-start mb-2">
    <strong>{{ $tarefa->titulo }}</strong>

    <form method="POST" action="{{ route('kanban.tasks.destroy', $tarefa->id) }}" onsubmit="return confirm('Excluir esta tarefa?')">
      @csrf
      @method('DELETE')
      <button type="submit" class="btn btn-xs btn-outline-danger">
        <i class="fas fa-trash"></i>
      </button>
    </form>
  </div>

  @if($tarefa->descricao)
    <p class="text-muted mb-2">{{ $tarefa->descricao }}</p>
  @endif

  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <span class="badge badge-light">Urgência {{ ucfirst($tarefa->urgencia) }}</span>
    @if($tarefa->data_limite)
      <span class="badge badge-{{ $tarefa->status === 'atrasado' ? 'danger' : 'secondary' }}">
        Limite {{ $tarefa->data_limite->format('d/m/Y') }}
      </span>
    @endif
  </div>
</div>
