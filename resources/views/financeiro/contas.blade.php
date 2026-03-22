@extends('adminlte::page')

@section('title', 'Minhas Contas')

@section('content_header')
<div class="d-flex justify-content-between align-items-center">
    <h1>Contas Bancárias</h1>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalConta">
        <i class="fas fa-plus-circle"></i> Nova Conta
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
    @forelse($contas as $conta)
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">{{ $conta->nome }}</h5>
                    <small class="text-muted">{{ ucfirst($conta->tipo) }}</small>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="text-muted">Saldo Atual</label>
                        <h3 class="mb-0">R$ {{ number_format($conta->saldo_atual, 2, ',', '.') }}</h3>
                    </div>
                    <div>
                        <label class="text-muted">Saldo Inicial</label>
                        <p class="mb-0">R$ {{ number_format($conta->saldo_inicial, 2, ',', '.') }}</p>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <div class="badge {{ $conta->ativa ? 'badge-success' : 'badge-secondary' }}">
                        {{ $conta->ativa ? 'Ativa' : 'Inativa' }}
                    </div>
                </div>
            </div>
        </div>
    @empty
        <div class="col-12">
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Nenhuma conta criada. 
                <button type="button" class="btn btn-sm btn-info" data-toggle="modal" data-target="#modalConta">
                    Criar agora
                </button>
            </div>
        </div>
    @endforelse
</div>

<!-- Modal Nova Conta -->
<div class="modal fade" id="modalConta" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('financeiro.store-conta') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Nova Conta</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Nome da Conta</label>
                    <input type="text" name="nome" class="form-control" placeholder="Ex: Conta Santander" required>
                </div>

                <div class="form-group">
                    <label>Tipo</label>
                    <select name="tipo" class="form-control" required>
                        <option value="bancaria">Conta Bancária</option>
                        <option value="cartao">Cartão de Crédito</option>
                        <option value="dinheiro">Dinheiro</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Saldo Inicial</label>
                    <input type="number" name="saldo_inicial" class="form-control" step="0.01" value="0" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Criar Conta</button>
            </div>
        </form>
    </div>
</div>
@stop
