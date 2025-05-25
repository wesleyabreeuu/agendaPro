@extends('adminlte::page')

@section('title', 'Compromissos')

@section('content_header')
    <h1>Meus Compromissos</h1>
@stop

@section('content')
    @if (session('success'))
        <x-adminlte-alert theme="success" title="Sucesso!">
            {{ session('success') }}
        </x-adminlte-alert>
    @endif

    <a href="{{ route('compromissos.create') }}" class="btn btn-primary mb-3">+ Novo Compromisso</a>





    {{-- Tabela de compromissos --}}
    <x-adminlte-datatable id="tabelaCompromissos" :heads="['Título', 'Início', 'Fim', 'Categoria', 'Dia Inteiro', 'Ações']" striped hoverable bordered>
        @foreach ($compromissos as $compromisso)
            <tr>
                <td>{{ $compromisso->titulo }}</td>
                <td>{{ $compromisso->data_inicio->format('d/m/Y H:i') }}</td>
                <td>{{ $compromisso->data_fim ? $compromisso->data_fim->format('d/m/Y H:i') : '-' }}</td>
                <td>{{ $compromisso->categoria->nome ?? '-' }}</td>
                <td>{{ $compromisso->dia_inteiro ? 'Sim' : 'Não' }}</td>
                <td>
                    {{-- Editar --}}
                    <a href="{{ route('compromissos.edit', $compromisso->id) }}" class="btn btn-sm btn-warning">Editar</a>


                    {{-- Excluir --}}
                    <form action="{{ route('compromissos.destroy', $compromisso->id) }}" method="POST" style="display:inline-block">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Deseja excluir este compromisso?')">Excluir</button>
                    </form>
                </td>
            </tr>

        @endforeach
    </x-adminlte-datatable>

    <script>
        function toggleEdit(id) {
            const el = document.getElementById('edit-form-' + id);
            el.style.display = (el.style.display === 'none') ? 'table-row' : 'none';
        }
    </script>
@stop
