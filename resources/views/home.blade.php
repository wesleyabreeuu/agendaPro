@extends('adminlte::page')

@section('title', 'Minha Tela')

@section('content_header')
    <h1>Minha Tela</h1>
@stop

@section('content')
    <p>Agenda Resumo:</p>

    <div class="row mt-4">
        <!-- Compromissos -->
        <div class="col-md-6">
            <a href="{{ route('compromissos.index') }}" class="text-decoration-none">
                <div class="card text-white bg-primary shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">Compromissos</h5>
                            <h2>{{ $totalCompromissos }}</h2>
                        </div>
                        <div>
                            <i class="fas fa-calendar-alt fa-3x"></i>
                        </div>
                    </div>
                </div>
            </a>
        </div>

        <!-- Lembretes -->
        <div class="col-md-6">
            <a href="{{ route('lembretes.index') }}" class="text-decoration-none">
                <div class="card text-dark bg-warning shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">Lembretes</h5>
                            <h2>{{ $totalLembretes }}</h2>
                        </div>
                        <div>
                            <i class="fas fa-bell fa-3x"></i>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </div>

    <!-- Compromissos mais próximos -->
    <div class="mt-5">
        <h4>Próximos Compromissos</h4>
        <div class="row">
            @foreach ($proximosCompromissos as $compromisso)
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
            @endforeach
        </div>
    </div>
@stop

@push('css')
    <style>
        /* Cards personalizados dos próximos compromissos */
        .card-compromisso {
            border-left: 5px solid #0d6efd;
            border-radius: 12px;
            padding: 15px;
            background-color: #ffffff;
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
