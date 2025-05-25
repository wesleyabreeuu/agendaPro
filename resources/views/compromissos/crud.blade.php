@extends('adminlte::page')

@section('title', $modo === 'edit' ? 'Editar Compromisso' : 'Novo Compromisso')

@section('content_header')
    <h1>{{ $modo === 'edit' ? 'Editar Compromisso' : 'Novo Compromisso' }}</h1>
@stop

@section('content')

@php
    $rota = $modo === 'edit'
        ? route('compromissos.update', $compromisso->id)
        : route('compromissos.store');

    $method = $modo === 'edit' ? 'PUT' : 'POST';
@endphp

<form action="{{ $rota }}" method="POST" class="mb-4 border p-3 rounded bg-light">
    @csrf
    @if ($method === 'PUT') @method('PUT') @endif

    <div class="form-row">
        <div class="form-group col-md-6">
            <label for="titulo">Título</label>
            <input name="titulo" class="form-control" value="{{ old('titulo', $compromisso->titulo ?? '') }}" required>
        </div>

        <div class="form-group col-md-3">
            <label for="data_inicio">Data Início</label>
            <input name="data_inicio" type="datetime-local" class="form-control"
                <input name="data_inicio" type="datetime-local" class="form-control"
    value="{{ old('data_inicio', isset($compromisso) && $compromisso->data_inicio ? $compromisso->data_inicio->format('Y-m-d\TH:i') : '') }}"
    required>

        </div>

        <div class="form-group col-md-3">
            <label for="data_fim">Data Fim</label>
            <input name="data_fim" type="datetime-local" class="form-control"
                value="{{ old('data_fim', isset($compromisso) && $compromisso->data_fim ? $compromisso->data_fim->format('Y-m-d\TH:i') : '') }}">
        </div>
    </div>

    <div class="form-row">
        <div class="form-group col-md-6">
            <label for="categoria_id">Categoria</label>
            <select name="categoria_id" class="form-control">
                <option value="">-- Nenhuma --</option>
                @foreach ($categorias as $categoria)
                    <option value="{{ $categoria->id }}" {{ old('categoria_id', $compromisso->categoria_id ?? '') == $categoria->id ? 'selected' : '' }}>
                        {{ $categoria->nome }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group col-md-6">
            <label for="dia_inteiro">Dia Inteiro</label>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" name="dia_inteiro" id="dia_inteiro"
                    {{ old('dia_inteiro', $compromisso->dia_inteiro ?? false) ? 'checked' : '' }}>
                <label class="form-check-label" for="dia_inteiro">Sim</label>
            </div>
        </div>
    </div>

    <div class="form-group">
        <label for="descricao">Descrição</label>
        <textarea name="descricao" rows="3" class="form-control">{{ old('descricao', $compromisso->descricao ?? '') }}</textarea>
    </div>

    <button type="submit" class="btn btn-{{ $modo === 'edit' ? 'success' : 'primary' }}">
        {{ $modo === 'edit' ? 'Atualizar' : 'Salvar' }}
    </button>
</form>

@endsection
