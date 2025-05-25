@extends('adminlte::page')

@section('title', 'Editar Usuário')

@section('content_header')
    <h1>Editar Usuário</h1>
@stop

@section('content')
    <form action="{{ route('usuarios.update', $usuario->id) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="form-group">
            <label for="name">Nome</label>
            <input name="name" class="form-control" required value="{{ old('name', $usuario->name) }}">
        </div>

        <div class="form-group">
            <label for="email">E-mail</label>
            <input name="email" type="email" class="form-control" required value="{{ old('email', $usuario->email) }}">
        </div>

        <div class="form-group">
            <label for="password">Nova senha <small>(opcional)</small></label>
            <input name="password" type="password" class="form-control">
        </div>

        <button type="submit" class="btn btn-success">Atualizar</button>
        <a href="{{ route('usuarios.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
@stop
