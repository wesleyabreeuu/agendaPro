@extends('adminlte::page')

@section('title', 'Editar Tarefa')

@section('content_header')
    <h1>Editar Tarefa</h1>
@stop

@section('content')
<div class="card">
    <div class="card-body">
        <form method="POST" action="{{ route('todo.update', $tarefa->id) }}">
            @csrf
            @method('PUT')

            <div class="mb-3">
                <label for="data">Data:</label>
                <input type="date" name="data" class="form-control" value="{{ $tarefa->data }}" required>
            </div>

            <div class="mb-3">
                <label for="hora">Hora:</label>
                <input type="time" name="hora" class="form-control" value="{{ $tarefa->hora }}" required>
            </div>

            <div class="mb-3">
                <label for="descricao">Descrição:</label>
                <input type="text" name="descricao" class="form-control" value="{{ $tarefa->descricao }}" required>
            </div>

            <div class="mb-3">
                <label for="urgencia">Urgência:</label>
                <select name="urgencia" class="form-control" required>
                    <option value="baixa" {{ $tarefa->urgencia == 'baixa' ? 'selected' : '' }}>Baixa</option>
                    <option value="media" {{ $tarefa->urgencia == 'media' ? 'selected' : '' }}>Média</option>
                    <option value="alta" {{ $tarefa->urgencia == 'alta' ? 'selected' : '' }}>Alta</option>
                </select>
            </div>

            <div class="d-flex justify-content-between">
                <a href="{{ route('todo.index', ['data' => $tarefa->data]) }}" class="btn btn-secondary">Cancelar</a>
                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
        </form>
    </div>
</div>
@stop
