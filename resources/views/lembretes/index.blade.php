@extends('adminlte::page')

@section('title', 'Lembretes')

@section('content_header')
    <h1>Lembretes</h1>
@stop

@section('content')
    <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <a href="{{ route('lembretes.create') }}" class="btn btn-primary">+ Novo Lembrete</a>
        <button type="button" class="btn btn-outline-warning" onclick="Notification.requestPermission()">
            Ativar notificações do navegador
        </button>
    </div>

    @if (session('success'))
        <x-adminlte-alert theme="success" title="Sucesso!">
            {{ session('success') }}
        </x-adminlte-alert>
    @endif

    @if (session('error'))
        <x-adminlte-alert theme="danger" title="Erro!">
            {{ session('error') }}
        </x-adminlte-alert>
    @endif

    <div class="row mb-4">
        <div class="col-lg-5">
            <div class="card card-warning card-outline">
                <div class="card-header">
                    <h3 class="card-title">Central de lembretes</h3>
                </div>
                <div class="card-body">
                    <p class="mb-3">Quando o app estiver aberto, os lembretes passam a aparecer como popup e, se o navegador permitir, como notificação nativa do celular ou computador.</p>

                    @forelse($proximos as $item)
                        <div class="border rounded p-3 mb-2">
                            <div class="font-weight-bold">{{ $item->compromisso->titulo }}</div>
                            <div class="text-muted small">
                                Disparar em {{ \Carbon\Carbon::parse($item->compromisso->data_inicio)->subMinutes($item->minutos_antes)->format('d/m/Y H:i') }}
                            </div>
                        </div>
                    @empty
                        <div class="alert alert-light mb-0">Nenhum lembrete pendente no momento.</div>
                    @endforelse
                </div>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card card-light">
                <div class="card-body">
                    <h5>Como funciona agora</h5>
                    <p class="mb-2">O sistema consulta lembretes vencidos a cada minuto enquanto a agenda estiver aberta.</p>
                    <p class="mb-0">No celular, o aviso pode subir na barra de notificações quando o navegador/PWA conceder permissão. Sem permissão, ele aparece como popup dentro do sistema.</p>
                </div>
            </div>
        </div>
    </div>

    <x-adminlte-datatable id="tabelaLembretes" :heads="['Compromisso', 'Minutos Antes', 'Notificado', 'Ações']" striped hoverable bordered>
        @foreach ($lembretes as $lembrete)
            <tr>
                <td>{{ $lembrete->compromisso->titulo ?? '-' }}</td>
                <td>{{ $lembrete->minutos_antes }} min</td>
                <td>{{ $lembrete->notificado_em ? $lembrete->notificado_em->format('d/m/Y H:i') : 'Pendente' }}</td>
                <td>
                    <a href="{{ route('lembretes.edit', $lembrete->id) }}" class="btn btn-sm btn-warning">Editar</a>
                    
                    <!-- <a href="{{ route('lembretes.enviar-whatsapp', $lembrete->id) }}" 
                       class="btn btn-sm btn-success"
                       onclick="return confirm('Deseja enviar este lembrete por WhatsApp?')">Enviar WhatsApp</a> -->

                    <form action="{{ route('lembretes.destroy', $lembrete->id) }}" method="POST" style="display:inline-block">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-sm btn-danger" onclick="return confirm('Excluir este lembrete?')">Excluir</button>
                    </form>
                </td>
            </tr>
        @endforeach
    </x-adminlte-datatable>

    @include('partials.reminder-poller')
@stop
