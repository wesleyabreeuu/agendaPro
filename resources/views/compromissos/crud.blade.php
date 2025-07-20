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

    <div class="form-group">
        <label for="telefone">Telefone (WhatsApp)</label>
        <input type="text" name="telefone" class="form-control"
               value="{{ old('telefone', $compromisso->telefone ?? '') }}"
               placeholder="Ex: 5511999999999">
    </div>

    <hr class="my-4">

    <div class="form-row">
        <div class="form-group col-md-4">
            <label for="recorrencia">Repetir compromisso:</label>
            <select name="recorrencia" class="form-control">
                <option value="">Não repetir</option>
                <option value="diaria" {{ old('recorrencia', $compromisso->recorrencia ?? '') == 'diaria' ? 'selected' : '' }}>Diariamente</option>
                <option value="semanal" {{ old('recorrencia', $compromisso->recorrencia ?? '') == 'semanal' ? 'selected' : '' }}>Semanalmente</option>
                <option value="mensal" {{ old('recorrencia', $compromisso->recorrencia ?? '') == 'mensal' ? 'selected' : '' }}>Mensalmente</option>
            </select>
        </div>

        <div class="form-group col-md-4">
            <label for="recorrencia_intervalo">Intervalo (ex: a cada X dias/semanas/meses)</label>
            <input type="number" name="recorrencia_intervalo" min="1" class="form-control"
                   value="{{ old('recorrencia_intervalo', $compromisso->recorrencia_intervalo ?? '') }}">
        </div>

        <div class="form-group col-md-4">
            <label for="data_fim_recorrencia">Repetir até:</label>
            <input type="date" name="data_fim_recorrencia" class="form-control"
                   value="{{ old('data_fim_recorrencia', isset($compromisso->data_fim_recorrencia) ? $compromisso->data_fim_recorrencia->format('Y-m-d') : '') }}">
        </div>
    </div>

    <button type="submit" class="btn btn-{{ $modo === 'edit' ? 'success' : 'primary' }}">
        {{ $modo === 'edit' ? 'Atualizar' : 'Salvar' }}
    </button>
</form>

@endsection
