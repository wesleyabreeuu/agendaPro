@extends('adminlte::page')

@section('title', 'Detalhes do Usuário')

@section('content_header')
    <h1>Usuário: {{ $usuario->name }}</h1>
@stop

@section('content')
    <p><strong>Nome:</strong> {{ $usuario->name }}</p>
    <p><strong>Email:</strong> {{ $usuario->email }}</p>
    <a href="{{ route('usuarios.index') }}" class="btn btn-secondary">Voltar</a>
@stop
