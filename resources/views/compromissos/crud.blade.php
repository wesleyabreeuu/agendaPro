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

{{-- Erros de validação --}}
@if ($errors->any())
    <div class="alert alert-danger">
        <strong>Ops!</strong> Verifique os campos abaixo.
        <ul class="mb-0">
            @foreach ($errors->all() as $e)
                <li>{{ $e }}</li>
            @endforeach
        </ul>
    </div>
@endif

<form action="{{ $rota }}" method="POST" class="mb-4 border p-3 rounded bg-light">
    @csrf
    @if ($method === 'PUT') @method('PUT') @endif

    <div class="form-row">
        <div class="form-group col-md-6">
            <label for="titulo">Título</label>
            <input name="titulo" id="titulo" class="form-control"
                   value="{{ old('titulo', $compromisso->titulo ?? '') }}" required>
        </div>

        <div class="form-group col-md-3">
            <label for="data_inicio">Data Início</label>
            <input name="data_inicio" id="data_inicio" type="datetime-local" class="form-control"
                   value="{{ old('data_inicio', isset($compromisso) && $compromisso->data_inicio ? $compromisso->data_inicio->format('Y-m-d\TH:i') : '') }}"
                   required>
        </div>

        <div class="form-group col-md-3">
            <label for="data_fim">Data Fim</label>
            <input name="data_fim" id="data_fim" type="datetime-local" class="form-control"
                   value="{{ old('data_fim', isset($compromisso) && $compromisso->data_fim ? $compromisso->data_fim->format('Y-m-d\TH:i') : '') }}">
        </div>
    </div>

    <div class="form-row">
        <div class="form-group col-md-6">
            <label for="categoria_id">Categoria</label>
            <select name="categoria_id" id="categoria_id" class="form-control">
                <option value="">-- Nenhuma --</option>
                @foreach ($categorias as $categoria)
                    <option value="{{ $categoria->id }}"
                        {{ (string)old('categoria_id', $compromisso->categoria_id ?? '') === (string)$categoria->id ? 'selected' : '' }}>
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
        <textarea name="descricao" id="descricao" rows="3" class="form-control">{{ old('descricao', $compromisso->descricao ?? '') }}</textarea>
    </div>

    <div class="form-group">
        <label for="telefone">Telefone (WhatsApp)</label>
        <input type="text" name="telefone" id="telefone" class="form-control"
               value="{{ old('telefone', $compromisso->telefone ?? '') }}"
               placeholder="Ex: 5511999999999">
        <small class="form-text text-muted">Use o formato E.164: 55 + DDD + número (somente dígitos).</small>
    </div>

    <hr class="my-4">

    {{-- Envio programado por WhatsApp --}}
    <!-- <div class="form-row">
        <div class="form-group col-md-6">
            <label for="lead_time">Enviar WhatsApp:</label>
            <select id="lead_time" name="lead_time" class="form-control">
                <option value="">Não enviar</option>
                <option value="0"    {{ old('lead_time')=='0'    ? 'selected' : '' }}>Na hora</option>
                <option value="15"   {{ old('lead_time')=='15'   ? 'selected' : '' }}>15 minutos antes</option>
                <option value="30"   {{ old('lead_time')=='30'   ? 'selected' : '' }}>30 minutos antes</option>
                <option value="60"   {{ old('lead_time')=='60'   ? 'selected' : '' }}>1 hora antes</option>
                <option value="120"  {{ old('lead_time')=='120'  ? 'selected' : '' }}>2 horas antes</option>
                <option value="1440" {{ old('lead_time')=='1440' ? 'selected' : '' }}>1 dia antes</option>
            </select>
            <small class="form-text text-muted">Horário calculado no fuso America/Sao_Paulo.</small>
        </div> -->

        @if ($modo === 'edit')
        <div class="form-group col-md-6">
            <label class="d-block">Lembrete</label>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="1" id="cancelar_lembrete" name="cancelar_lembrete">
                <label class="form-check-label" for="cancelar_lembrete">
                    Cancelar lembrete pendente
                </label>
            </div>
            <small class="form-text text-muted">
                Se marcado, qualquer lembrete ainda pendente para este compromisso será cancelado.
            </small>
        </div>
        @endif
    </div>

    <hr class="my-4">

    <div class="form-row">
        <div class="form-group col-md-4">
            <label for="recorrencia">Repetir compromisso:</label>
            <select name="recorrencia" id="recorrencia" class="form-control">
                <option value="">Não repetir</option>
                <option value="diaria"  {{ old('recorrencia', $compromisso->recorrencia ?? '') == 'diaria'  ? 'selected' : '' }}>Diariamente</option>
                <option value="semanal" {{ old('recorrencia', $compromisso->recorrencia ?? '') == 'semanal' ? 'selected' : '' }}>Semanalmente</option>
                <option value="mensal"  {{ old('recorrencia', $compromisso->recorrencia ?? '') == 'mensal'  ? 'selected' : '' }}>Mensalmente</option>
            </select>
        </div>

        <div class="form-group col-md-4">
            <label for="recorrencia_intervalo">Intervalo (ex: a cada X dias/semanas/meses)</label>
            <input type="number" name="recorrencia_intervalo" id="recorrencia_intervalo" min="1" class="form-control"
                   value="{{ old('recorrencia_intervalo', $compromisso->recorrencia_intervalo ?? '') }}">
        </div>

        <div class="form-group col-md-4">
            <label for="data_fim_recorrencia">Repetir até:</label>
            <input type="date" name="data_fim_recorrencia" id="data_fim_recorrencia" class="form-control"
                   value="{{ old('data_fim_recorrencia', isset($compromisso->data_fim_recorrencia) ? $compromisso->data_fim_recorrencia->format('Y-m-d') : '') }}">
        </div>
    </div>

    <button type="submit" class="btn btn-{{ $modo === 'edit' ? 'success' : 'primary' }}">
        {{ $modo === 'edit' ? 'Atualizar' : 'Salvar' }}
    </button>
</form>

@endsection
