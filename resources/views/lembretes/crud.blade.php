@extends('adminlte::page')

@section('title', isset($lembrete) ? 'Editar Lembrete' : 'Novo Lembrete')

@section('content_header')
    <h1>{{ isset($lembrete) ? 'Editar Lembrete' : 'Novo Lembrete' }}</h1>
@stop

@section('content')
    <form method="POST" action="{{ isset($lembrete) ? route('lembretes.update', $lembrete->id) : route('lembretes.store') }}">
        @csrf
        @if(isset($lembrete)) @method('PUT') @endif

        <div class="form-group">
            <label for="compromisso_id">Compromisso</label>
            <select name="compromisso_id" class="form-control" required>
                @foreach ($compromissos as $compromisso)
                    <option value="{{ $compromisso->id }}"
                        {{ old('compromisso_id', $lembrete->compromisso_id ?? '') == $compromisso->id ? 'selected' : '' }}>
                        {{ $compromisso->titulo }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label for="minutos_antes">Minutos Antes</label>
            <input type="number" name="minutos_antes" class="form-control" value="{{ old('minutos_antes', $lembrete->minutos_antes ?? '') }}" required>
        </div>

        <button type="submit" class="btn btn-primary">
            {{ isset($lembrete) ? 'Atualizar' : 'Salvar' }}
        </button>
    </form>
@stop
