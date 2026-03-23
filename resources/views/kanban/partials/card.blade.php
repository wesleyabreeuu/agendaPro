@php
  $urgenciaClass = match($tarefa->urgencia) {
    'alta' => 'urg-alta',
    'media' => 'urg-media',
    default => 'urg-baixa',
  };

  $checklistResumo = $tarefa->checklist_resumo;
@endphp

<div class="kanban-task {{ $urgenciaClass }}" data-id="{{ $tarefa->id }}" data-locked="{{ $tarefa->status === 'atrasado' ? 'true' : 'false' }}">
  @if(!empty($tarefa->etiquetas))
    <div class="task-labels mb-3">
      @foreach($tarefa->etiquetas as $etiqueta)
        <span class="task-label" style="background-color: {{ $etiqueta['cor'] ?? '#2563eb' }}">
          {{ $etiqueta['nome'] ?? 'Etiqueta' }}
        </span>
      @endforeach
    </div>
  @endif

  <div class="d-flex justify-content-between align-items-start mb-2">
    <strong class="task-title">{{ $tarefa->titulo }}</strong>

    <div class="d-flex gap-1">
      <button type="button" class="btn btn-xs btn-outline-primary" data-toggle="modal" data-target="#modalTaskEdit-{{ $tarefa->id }}">
        <i class="fas fa-pen"></i>
      </button>
      @if($tarefa->status === 'atrasado' && $tarefa->data_limite)
        <button type="button" class="btn btn-xs btn-outline-info" data-toggle="modal" data-target="#modalExtendDeadline-{{ $tarefa->id }}" title="Estender prazo">
          <i class="fas fa-calendar-plus"></i>
        </button>
      @endif
      <form method="POST" action="{{ route('kanban.tasks.destroy', $tarefa->id) }}" onsubmit="return confirm('Excluir esta tarefa?')" style="display: inline;">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-xs btn-outline-danger">
          <i class="fas fa-trash"></i>
        </button>
      </form>
    </div>
  </div>

  @if($tarefa->descricao)
    <p class="text-muted mb-3">{{ $tarefa->descricao }}</p>
  @endif

  @if($checklistResumo['total'] > 0)
    <div class="task-progress mb-3">
      <div class="d-flex justify-content-between mb-1">
        <small class="text-muted">Checklist</small>
        <small class="text-muted">{{ $checklistResumo['concluidos'] }}/{{ $checklistResumo['total'] }}</small>
      </div>
      <div class="progress progress-xs">
        <div class="progress-bar bg-success" style="width: {{ $checklistResumo['percentual'] }}%"></div>
      </div>
    </div>
  @endif

  @if(!empty($tarefa->campos_personalizados))
    <div class="task-fields mb-3">
      @foreach(array_slice($tarefa->campos_personalizados, 0, 2) as $campo)
        <div class="task-field-line">
          <span>{{ $campo['nome'] ?? 'Campo' }}</span>
          <strong>{{ $campo['valor'] ?? '-' }}</strong>
        </div>
      @endforeach
      @if(count($tarefa->campos_personalizados) > 2)
        <small class="text-muted">+ {{ count($tarefa->campos_personalizados) - 2 }} campo(s)</small>
      @endif
    </div>
  @endif

  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <span class="badge badge-light">Urgência {{ ucfirst($tarefa->urgencia) }}</span>
    <div class="d-flex flex-wrap gap-2">
      @if($checklistResumo['total'] > 0)
        <span class="badge badge-light">
          <i class="fas fa-check-square"></i> {{ $checklistResumo['concluidos'] }}/{{ $checklistResumo['total'] }}
        </span>
      @endif
      @if($tarefa->data_limite)
        <span class="badge badge-{{ $tarefa->status === 'atrasado' ? 'danger' : 'secondary' }}">
          Limite {{ $tarefa->data_limite->format('d/m/Y') }}
        </span>
      @endif
    </div>
  </div>
</div>
