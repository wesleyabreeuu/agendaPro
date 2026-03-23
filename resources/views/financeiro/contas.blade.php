@extends('adminlte::page')

@section('title', 'Contas e Carteiras')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">Contas e Carteiras</h1>
        <p class="text-muted mb-0">Cadastre bancos, cartões ou carteiras e ajuste o saldo com depósitos quando precisar.</p>
    </div>
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
    @foreach($contas as $conta)
        <div class="col-lg-4 col-md-6 mb-4 d-flex">
            <div class="card w-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="mb-1">{{ $conta->nome }}</h5>
                            <small class="text-muted">{{ $conta->instituicao ?: 'Sem banco/instituição' }} • {{ ucfirst($conta->tipo) }}</small>
                        </div>
                        <span class="badge {{ $conta->ativa ? 'badge-success' : 'badge-secondary' }}">{{ $conta->ativa ? 'Ativa' : 'Inativa' }}</span>
                    </div>

                    <div class="mb-3">
                        <small class="text-muted d-block">Saldo atual</small>
                        <h3 class="mb-0">R$ {{ number_format($conta->saldo_atual, 2, ',', '.') }}</h3>
                    </div>

                    <div class="mb-3">
                        <small class="text-muted d-block">Saldo inicial</small>
                        <strong>R$ {{ number_format($conta->saldo_inicial, 2, ',', '.') }}</strong>
                    </div>

                    <button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal" data-target="#modalDeposito-{{ $conta->id }}">
                        <i class="fas fa-arrow-down"></i> Registrar depósito
                    </button>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalDeposito-{{ $conta->id }}" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <form method="POST" action="{{ route('financeiro.depositar-conta', $conta->id) }}" class="modal-content">
                    @csrf
                    <div class="modal-header">
                        <h5 class="modal-title">Registrar depósito</h5>
                        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>{{ $conta->nome }}</strong></p>
                        <div class="form-group mb-0">
                            <label>Valor do depósito</label>
                            <input type="number" name="valor" step="0.01" min="0.01" class="form-control" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Confirmar depósito</button>
                    </div>
                </form>
            </div>
        </div>
    @endforeach
</div>

<div class="modal fade" id="modalConta" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('financeiro.store-conta') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Nova Conta ou Carteira</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" class="form-control" placeholder="Ex.: Banco principal, Carteira, Nubank" required>
                </div>
                <div class="form-group">
                    <label>Banco / Instituição</label>
                    <input type="text" name="instituicao" class="form-control" placeholder="Ex.: Banco do Brasil, Caixa, Uso pessoal">
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <select name="tipo" class="form-control" required>
                        <option value="bancaria">Conta bancária</option>
                        <option value="cartao">Cartão</option>
                        <option value="dinheiro">Carteira / Dinheiro</option>
                    </select>
                </div>
                <div class="form-group mb-0">
                    <label>Saldo atual</label>
                    <input type="number" name="saldo_inicial" class="form-control" step="0.01" value="0" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    </div>
</div>
@stop
