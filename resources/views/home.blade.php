@extends('adminlte::page')

@section('title', 'Painel Principal')

@section('content_header')
    <h1 class="mb-4">Painel de Controle</h1>
@stop

@section('content')
    <div class="row">
        <!-- Compromissos -->
        <div class="col-md-3">
            <a href="{{ route('compromissos.index') }}" class="text-decoration-none">
                <div class="card bg-gradient-primary text-white shadow">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6>Compromissos</h6>
                            <h3>{{ $totalCompromissos }}</h3>
                        </div>
                        <i class="fas fa-calendar-alt fa-2x"></i>
                    </div>
                </div>
            </a>
        </div>

        <!-- Lembretes -->
        <div class="col-md-3">
            <a href="{{ route('lembretes.index') }}" class="text-decoration-none">
                <div class="card bg-gradient-warning text-white shadow">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6>Lembretes</h6>
                            <h3>{{ $totalLembretes }}</h3>
                        </div>
                        <i class="fas fa-bell fa-2x"></i>
                    </div>
                </div>
            </a>
        </div>

        <!-- Tarefas -->
        <div class="col-md-3">
            <a href="{{ route('todo.index') }}" class="text-decoration-none">
                <div class="card bg-gradient-success text-white shadow">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6>Tarefas Hoje</h6>
                            <h3>{{ $totalTarefasHoje }}</h3>
                        </div>
                        <i class="fas fa-tasks fa-2x"></i>
                    </div>
                </div>
            </a>
        </div>

        <!-- Usuários (se aplicável) -->
        <div class="col-md-3">
            <div class="card bg-gradient-info text-white shadow">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6>Usuários</h6>
                        <h3>{{ $totalUsuarios ?? '1' }}</h3>
                    </div>
                    <i class="fas fa-users fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Próximos compromissos -->
    <div class="mt-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="mb-0">Próximos Compromissos</h4>
            <a href="{{ route('compromissos.index') }}" class="btn btn-sm btn-outline-primary">Ver todos</a>
        </div>
        <div class="row">
            @forelse ($proximosCompromissos as $compromisso)
                <div class="col-md-4 mb-3">
                    <a href="{{ route('compromissos.edit', $compromisso->id) }}" class="text-decoration-none">
                        <div class="card-compromisso">
                            <div class="titulo">{{ $compromisso->titulo }}</div>
                            <div class="data">
                                <strong>Início:</strong> {{ \Carbon\Carbon::parse($compromisso->data_inicio)->format('d/m/Y H:i') }}<br>
                                <strong>Fim:</strong> {{ \Carbon\Carbon::parse($compromisso->data_fim)->format('d/m/Y H:i') }}
                            </div>
                            <div class="descricao">{{ $compromisso->descricao }}</div>
                        </div>
                    </a>
                </div>
            @empty
                <div class="col-12">
                    <div class="alert alert-light">Nenhum compromisso encontrado.</div>
                </div>
            @endforelse
        </div>
    </div>
@stop

@push('css')
<style>
    body {
        font-family: 'Inter', sans-serif;
    }

    .card h6 {
        font-weight: 600;
        margin-bottom: 5px;
    }

    .card-compromisso {
        border-left: 5px solid #0d6efd;
        border-radius: 12px;
        padding: 15px;
        background-color: #f8f9fa;
        transition: box-shadow 0.3s ease;
        height: 100%;
    }

    .card-compromisso:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-compromisso .titulo {
        font-size: 1.1rem;
        font-weight: bold;
        color: #0d6efd;
        margin-bottom: 10px;
    }

    .card-compromisso .data {
        font-size: 0.9rem;
        color: #6c757d;
        line-height: 1.4;
    }

    .card-compromisso .descricao {
        margin-top: 12px;
        font-size: 0.95rem;
        color: #343a40;
    }
</style>
@endpush
