@extends('adminlte::page')

@section('title', 'Tarefas Diárias')

@section('content_header')
    <h1 class="mb-3">Tarefas Diárias</h1>
@stop

@section('content')
<div class="row">
    <div class="col-md-6">
        <label for="data">Selecione o dia:</label>
        <input type="date" id="data" name="data" class="form-control"
               value="{{ $dataSelecionada }}"
               onchange="window.location.href='?data=' + this.value;">
    </div>

    <div class="col-md-6 d-flex align-items-end justify-content-end">
        <button class="btn btn-success mt-3" onclick="abrirModal()">
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
        <h5>Tarefas para o dia {{ \Carbon\Carbon::parse($dataSelecionada)->format('d/m/Y') }}</h5>

        <ul class="list-group">
            @foreach($tarefas as $tarefa)
                <li class="list-group-item d-flex justify-content-between align-items-start
                    @if($tarefa->urgencia == 'alta') list-group-item-danger
                    @elseif($tarefa->urgencia == 'media') list-group-item-warning
                    @else list-group-item-success
                    @endif">

                    <div class="form-check">
                        <input class="form-check-input me-2" type="checkbox" value="">
                        <label class="form-check-label">
                            <strong>{{ \Carbon\Carbon::parse($tarefa->hora)->format('H:i') }}</strong> —
                            {{ $tarefa->descricao }}
                        </label>

                        <div class="progress mt-2" style="height: 5px;">
                            <div class="progress-bar 
                                @if($tarefa->urgencia == 'alta') bg-danger
                                @elseif($tarefa->urgencia == 'media') bg-warning
                                @else bg-success
                                @endif" role="progressbar" style="width: 50%;"></div>
                        </div>
                    </div>

                    <div class="d-flex flex-column align-items-end">
                        <span class="badge bg-secondary text-capitalize mb-2">{{ $tarefa->urgencia }}</span>
<div class="btn-group btn-group-sm" role="group">
    <a href="{{ route('todo.edit', $tarefa->id) }}" class="btn btn-outline-primary">
        <i class="fas fa-edit"></i>
    </a>

    <form method="POST" action="{{ route('todo.destroy', $tarefa->id) }}" onsubmit="return confirm('Tem certeza que deseja excluir esta tarefa?')">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-outline-danger">
            <i class="fas fa-trash"></i>
        </button>
    </form>
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

{{-- Modal --}}
<div class="modal fade" id="modalTarefa" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <form method="POST" action="{{ route('todo.store') }}">
            @csrf
            <input type="hidden" name="data" id="modalData">

            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nova Tarefa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>

                <div class="modal-body">
                    <div class="mb-3">
                        <label for="hora">Hora:</label>
                        <input type="time" name="hora" class="form-control" required>
                    </div>

                    <div class="mb-3">
                        <label for="descricao">Descrição:</label>
                        <input type="text" name="descricao" class="form-control" required>
                    </div>

                    <div class="mb-3">
                        <label for="urgencia">Urgência:</label>
                        <select name="urgencia" class="form-control" required>
                            <option value="baixa">Baixa</option>
                            <option value="media" selected>Média</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-success">Salvar</button>
                </div>
            </div>
        </form>
    </div>
</div>
@stop

@push('js')
<script>
    function abrirModal() {
        const dataSelecionada = document.getElementById('data').value;
        if (!dataSelecionada) {
            alert('Selecione uma data primeiro.');
            return;
        }
        document.getElementById('modalData').value = dataSelecionada;

        const modal = new bootstrap.Modal(document.getElementById('modalTarefa'));
        modal.show();
    }
</script>
@endpush
