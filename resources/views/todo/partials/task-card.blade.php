@php
  $urgMap = [
    'baixa' => ['label' => 'Baixa', 'class' => 'urgency-baixa'],
    'media' => ['label' => 'Média', 'class' => 'urgency-media'],
    'alta' => ['label' => 'Alta', 'class' => 'urgency-alta'],
  ];

  $status = $tarefa->status ?? 'aguardando';
  $statusLabel = match($status) {
    'execucao' => 'Em execução',
    'finalizado' => 'Finalizado',
    default => 'Aguardando',
  };
  $isDone = $status === 'finalizado';
  $urgencia = $urgMap[$tarefa->urgencia] ?? $urgMap['media'];
@endphp

<div class="task-card {{ $isDone ? 'done' : '' }}">
  <div class="task-head">
    <div>
      <div class="font-weight-bold">{{ \Carbon\Carbon::parse($tarefa->hora)->format('H:i') }}</div>
      <div class="task-meta mt-2">
        <span class="urgency-tag {{ $urgencia['class'] }}">
          <i class="fas fa-flag"></i> {{ $urgencia['label'] }}
        </span>
        <span class="status-pill">{{ $statusLabel }}</span>
      </div>
    </div>

    <form method="POST" action="{{ route('todo.status', $tarefa->id) }}">
      @csrf
      @method('PATCH')
      <input type="hidden" name="status" value="{{ $isDone ? 'aguardando' : 'finalizado' }}">
      <input class="form-check-input mt-1" type="checkbox" onchange="this.form.submit()" {{ $isDone ? 'checked' : '' }}>
    </form>
  </div>

  <div class="task-text mb-3">{{ $tarefa->descricao }}</div>

  <div class="task-actions {{ $compacto ? 'justify-content-between' : '' }}">
    <form method="POST" action="{{ route('todo.status', $tarefa->id) }}">
      @csrf
      @method('PATCH')
      <select name="status" class="form-control form-control-sm" onchange="this.form.submit()">
        <option value="aguardando" {{ $status === 'aguardando' ? 'selected' : '' }}>Aguardando</option>
        <option value="execucao" {{ $status === 'execucao' ? 'selected' : '' }}>Em execução</option>
        <option value="finalizado" {{ $status === 'finalizado' ? 'selected' : '' }}>Finalizado</option>
      </select>
    </form>

    <div class="btn-group btn-group-sm">
      <a href="{{ route('todo.edit', $tarefa->id) }}" class="btn btn-outline-primary">
        <i class="fas fa-edit"></i>
      </a>
      <form method="POST" action="{{ route('todo.destroy', $tarefa->id) }}" onsubmit="return confirm('Excluir esta tarefa?')">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-outline-danger">
          <i class="fas fa-trash"></i>
        </button>
      </form>
    </div>
  </div>
</div>
