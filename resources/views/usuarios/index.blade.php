@extends('adminlte::page')

@section('title', 'Usuários')

@section('content_header')
    <h1>Lista de Usuários</h1>
@stop

@section('content')
    @if (session('success'))
        <x-adminlte-alert theme="success" title="Sucesso!">
            {{ session('success') }}
        </x-adminlte-alert>
    @endif

    <a href="{{ route('usuarios.create') }}" class="btn btn-primary mb-3">+ Novo Usuário</a>

    <x-adminlte-datatable id="tabelaUsuarios" :heads="['ID', 'Nome', 'E-mail', 'Ações']" striped hoverable bordered>
        @foreach ($usuarios as $usuario)
            <tr>
                <td>{{ $usuario->id }}</td>
                <td>{{ $usuario->name }}</td>
                <td>{{ $usuario->email }}</td>
                <td>
                    <a href="{{ route('usuarios.edit', $usuario->id) }}" class="btn btn-sm btn-warning">Editar</a>
                    <form action="{{ route('usuarios.destroy', $usuario->id) }}" method="POST" style="display:inline-block">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Tem certeza que deseja excluir este usuário?')">Excluir</button>
                    </form>
                </td>
            </tr>
        @endforeach
    </x-adminlte-datatable>
@stop
