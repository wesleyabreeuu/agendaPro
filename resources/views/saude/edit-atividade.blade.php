@extends('adminlte::page')

@section('title', 'Editar Atividade')

@section('content_header')
<h1>Editar Atividade</h1>
@stop

@section('content')
<div class="card">
    <form method="POST" action="{{ route('saude.update-atividade', $atividade->id) }}" class="card-body">
        @csrf
        @method('PUT')

        <div class="form-group">
            <label>Atividade</label>
            <select name="categoria_atividade_fisica_id" class="form-control" required>
                @foreach($categorias as $cat)
                    <option value="{{ $cat->id }}" {{ $atividade->categoria_atividade_fisica_id === $cat->id ? 'selected' : '' }}>
                        {{ $cat->nome }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label>Descrição (Opcional)</label>
            <input type="text" name="descricao" class="form-control" value="{{ $atividade->descricao }}">
        </div>

        <div class="form-group">
            <label>Data</label>
            <input type="date" name="data" class="form-control" value="{{ $atividade->data->toDateString() }}" required>
        </div>

        <div class="form-group">
            <label>Hora de Início (Opcional)</label>
            <input type="time" name="hora_inicio" class="form-control" value="{{ $atividade->hora_inicio }}">
        </div>

        <div class="form-group">
            <label>Duração (minutos)</label>
            <input type="number" name="duracao_minutos" class="form-control" value="{{ $atividade->duracao_minutos }}" min="1" required>
        </div>

        <div class="form-group">
            <label>Intensidade</label>
            <select name="intensidade" class="form-control" required>
                <option value="leve" {{ $atividade->intensidade === 'leve' ? 'selected' : '' }}>Leve</option>
                <option value="moderada" {{ $atividade->intensidade === 'moderada' ? 'selected' : '' }}>Moderada</option>
                <option value="intensa" {{ $atividade->intensidade === 'intensa' ? 'selected' : '' }}>Intensa</option>
            </select>
        </div>

        <div class="form-group">
            <label>Notas (Opcional)</label>
            <textarea name="notas" class="form-control" rows="3">{{ $atividade->notas }}</textarea>
        </div>

        <div class="form-group">
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            <a href="{{ route('saude.atividades') }}" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>
@stop
