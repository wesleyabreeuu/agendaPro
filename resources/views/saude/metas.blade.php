@extends('adminlte::page')

@section('title', 'Minhas Metas')

@section('content_header')
<div class="d-flex justify-content-between align-items-center">
    <h1>Metas de Saúde</h1>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalMeta">
        <i class="fas fa-plus-circle"></i> Nova Meta
    </button>
</div>
@stop

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
@endif

<div class="row">
    @forelse($metas as $meta)
        <div class="col-md-6 mb-4">
            <div class="card {{ $meta->ativa ? '' : 'opacity-50' }}">
                <div class="card-header {{ $meta->ativa ? 'bg-success' : 'bg-secondary' }} text-white">
                    <h5 class="card-title mb-0">{{ $meta->titulo }}</h5>
                </div>
                <div class="card-body">
                    <p class="mb-2"><strong>Tipo:</strong>
                        @switch($meta->tipo)
                            @case('horas_semanais')
                                Horas por Semana
                                @break
                            @case('calorias_semana')
                                Calorias por Semana
                                @break
                            @case('dias_semana')
                                Dias por Semana
                                @break
                            @case('sessoes_mes')
                                Sessões por Mês
                                @break
                        @endswitch
                    </p>
                    <p class="mb-2"><strong>Meta:</strong> {{ $meta->valor_alvo }}</p>
                    <p class="mb-2"><strong>Período:</strong> {{ ucfirst($meta->periodo) }}</p>
                    <p class="mb-0"><strong>Status:</strong> 
                        <span class="badge {{ $meta->ativa ? 'badge-success' : 'badge-secondary' }}">
                            {{ $meta->ativa ? 'Ativa' : 'Inativa' }}
                        </span>
                    </p>
                </div>
                <div class="card-footer">
                    <form method="POST" action="{{ route('saude.destroy-meta', $meta->id) }}" onsubmit="return confirm('Tem certeza?')" style="display: inline;">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </form>
                </div>
            </div>
        </div>
    @empty
        <div class="col-12">
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Nenhuma meta criada. 
                <button type="button" class="btn btn-sm btn-info" data-toggle="modal" data-target="#modalMeta">
                    Criar agora
                </button>
            </div>
        </div>
    @endforelse
</div>

<!-- Modal Nova Meta -->
<div class="modal fade" id="modalMeta" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('saude.store-meta') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Nova Meta de Saúde</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Título da Meta</label>
                    <input type="text" name="titulo" class="form-control" required>
                </div>

                <div class="form-group">
                    <label>Tipo de Meta</label>
                    <select name="tipo" class="form-control" required>
                        <option value="horas_semanais">Horas por Semana</option>
                        <option value="calorias_semana">Calorias por Semana</option>
                        <option value="dias_semana">Dias por Semana</option>
                        <option value="sessoes_mes">Sessões por Mês</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Valor Alvo</label>
                    <input type="number" name="valor_alvo" class="form-control" min="1" required>
                </div>

                <div class="form-group">
                    <label>Período</label>
                    <select name="periodo" class="form-control" required>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Criar Meta</button>
            </div>
        </form>
    </div>
</div>
@stop
