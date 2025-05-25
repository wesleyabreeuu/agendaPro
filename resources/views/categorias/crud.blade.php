@extends('adminlte::page')

@section('title', isset($categoria) ? 'Editar Categoria' : 'Nova Categoria')

@section('content_header')
    <h1>{{ isset($categoria) ? 'Editar Categoria' : 'Nova Categoria' }}</h1>
@stop

@section('content')
    <form action="{{ isset($categoria) ? route('categorias.update', $categoria->id) : route('categorias.store') }}" method="POST">
        @csrf
        @if(isset($categoria))
            @method('PUT')
        @endif

        <div class="form-group">
            <label for="nome">Nome da Categoria</label>
            <input type="text" name="nome" class="form-control" value="{{ old('nome', $categoria->nome ?? '') }}" required>
        </div>

        <button type="submit" class="btn btn-{{ isset($categoria) ? 'success' : 'primary' }}">
            {{ isset($categoria) ? 'Atualizar' : 'Salvar' }}
        </button>
        <a href="{{ route('categorias.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
@stop
