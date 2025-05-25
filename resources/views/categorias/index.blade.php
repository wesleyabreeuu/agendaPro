@extends('adminlte::page')

@section('title', 'Categorias')

@section('content_header')
    <h1>Lista de Categorias</h1>
@stop

@section('content')
    @if (session('success'))
        <x-adminlte-alert theme="success" title="Sucesso!">
            {{ session('success') }}
        </x-adminlte-alert>
    @endif

    <a href="{{ route('categorias.create') }}" class="btn btn-primary mb-3">+ Nova Categoria</a>

    <x-adminlte-datatable id="tabelaCategorias" :heads="['ID', 'Nome', 'Ações']" striped hoverable bordered>
        @foreach ($categorias as $categoria)
            <tr>
                <td>{{ $categoria->id }}</td>
                <td>{{ $categoria->nome }}</td>
                <td>
                    <a href="{{ route('categorias.edit', $categoria->id) }}" class="btn btn-sm btn-warning">Editar</a>
                    <form action="{{ route('categorias.destroy', $categoria->id) }}" method="POST" style="display:inline-block">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Deseja excluir esta categoria?')">Excluir</button>
                    </form>
                </td>
            </tr>
        @endforeach
    </x-adminlte-datatable>
@stop
