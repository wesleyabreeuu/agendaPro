@extends('adminlte::page')

@section('title', 'Lembretes')

@section('content_header')
    <h1>Lembretes</h1>
@stop

@section('content')
    <a href="{{ route('lembretes.create') }}" class="btn btn-primary mb-3">+ Novo Lembrete</a>

    @if (session('success'))
        <x-adminlte-alert theme="success" title="Sucesso!">
            {{ session('success') }}
        </x-adminlte-alert>
    @endif

    <x-adminlte-datatable id="tabelaLembretes" :heads="['Compromisso', 'Minutos Antes', 'Ações']" striped hoverable bordered>
        @foreach ($lembretes as $lembrete)
            <tr>
                <td>{{ $lembrete->compromisso->titulo ?? '-' }}</td>
                <td>{{ $lembrete->minutos_antes }} min</td>
                <td>
                    <a href="{{ route('lembretes.edit', $lembrete->id) }}" class="btn btn-sm btn-warning">Editar</a>
                    <form action="{{ route('lembretes.destroy', $lembrete->id) }}" method="POST" style="display:inline-block">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-sm btn-danger" onclick="return confirm('Excluir este lembrete?')">Excluir</button>
                    </form>
                </td>
            </tr>
        @endforeach
    </x-adminlte-datatable>
@stop
