@extends('adminlte::page')

@section('title', 'Lançamentos Financeiros')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">Lançamentos Financeiros</h1>
        <p class="text-muted mb-0">Registre tudo o que entra e tudo o que sai, com categorias, complemento, recorrência e status.</p>
    </div>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" data-toggle="modal" data-target="#modalCategoria">
            <i class="fas fa-tags"></i> Nova Categoria
        </button>
        <a href="{{ route('financeiro.contas') }}" class="btn btn-outline-info">
            <i class="fas fa-wallet"></i> Contas e Carteiras
        </a>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalTransacao">
            <i class="fas fa-plus-circle"></i> Novo Lançamento
        </button>
    </div>
</div>
@stop

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show">
        {{ session('error') }}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
@endif

@unless($financeiroAvancado)
    <div class="alert alert-warning">
        O banco ainda está no modo antigo. Você pode lançar receitas e despesas normalmente, mas pendências, quitação e forma de pagamento serão liberadas após rodar as migrations novas.
    </div>
@endunless

<div class="row mb-4">
    <div class="col-md-3">
        <div class="card metric-card metric-positive">
            <div class="card-body">
                <small>Recebido</small>
                <h3>R$ {{ number_format($resumo['recebido'], 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card metric-card metric-negative">
            <div class="card-body">
                <small>Pago</small>
                <h3>R$ {{ number_format($resumo['gasto'], 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card metric-card metric-neutral">
            <div class="card-body">
                <small>Pendente</small>
                <h3>R$ {{ number_format($resumo['pendente'], 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card metric-card {{ $resumo['resultado'] >= 0 ? 'metric-balance-positive' : 'metric-balance-negative' }}">
            <div class="card-body">
                <small>Resultado</small>
                <h3>R$ {{ number_format(abs($resumo['resultado']), 2, ',', '.') }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="card mb-4">
    <div class="card-body">
        <form method="GET" action="{{ route('financeiro.transacoes') }}" class="row align-items-end">
            <div class="col-md-2">
                <label>Tipo</label>
                <select name="tipo" class="form-control">
                    <option value="">Todos</option>
                    <option value="receita" @selected(request('tipo') === 'receita')>Receitas</option>
                    <option value="despesa" @selected(request('tipo') === 'despesa')>Despesas</option>
                </select>
            </div>
            @if($financeiroAvancado)
                <div class="col-md-2">
                    <label>Status</label>
                    <select name="status" class="form-control">
                        <option value="">Todos</option>
                        <option value="pendente" @selected(request('status') === 'pendente')>Pendentes</option>
                        <option value="pago" @selected(request('status') === 'pago')>Pagos</option>
                        <option value="recebido" @selected(request('status') === 'recebido')>Recebidos</option>
                    </select>
                </div>
            @endif
            <div class="col-md-3">
                <label>Categoria</label>
                <select name="categoria" class="form-control">
                    <option value="">Todas</option>
                    @foreach($categorias as $categoria)
                        <option value="{{ $categoria->id }}" @selected((string) request('categoria') === (string) $categoria->id)>{{ $categoria->nome }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label>Conta</label>
                <select name="conta" class="form-control">
                    <option value="">Todas</option>
                    @foreach($contas as $conta)
                        <option value="{{ $conta->id }}" @selected((string) request('conta') === (string) $conta->id)>{{ $conta->nome }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label>Mês</label>
                <input type="month" name="mes" class="form-control" value="{{ request('mes') }}">
            </div>
            <div class="col-md-1 d-flex gap-2">
                <button type="submit" class="btn btn-primary btn-block">Filtrar</button>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Entradas, saídas e contas pendentes</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        @if($financeiroAvancado)
                            <th>Status</th>
                            <th>Forma</th>
                        @endif
                        <th>Valor</th>
                        <th>Conta/Carteira</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($transacoes as $tx)
                        <tr>
                            <td>{{ $tx->data->format('d/m/Y') }}</td>
                            <td>
                                <strong>{{ $tx->descricao }}</strong>
                                @if($tx->complemento)
                                    <div class="small text-muted">{{ $tx->complemento }}</div>
                                @endif
                                @if($tx->recorrente)
                                    <div class="small text-info">Recorrente {{ $tx->frequencia ? '(' . $tx->frequencia . ')' : '' }}</div>
                                @endif
                            </td>
                            <td>
                                <span class="badge" style="background-color: {{ $tx->categoria->cor ?? '#64748b' }}; color: white;">
                                    {{ $tx->categoria->nome ?? 'Sem categoria' }}
                                </span>
                            </td>
                            <td>
                                <span class="badge {{ $tx->tipo === 'receita' ? 'badge-success' : 'badge-danger' }}">
                                    {{ $tx->tipo === 'receita' ? 'Receita' : 'Despesa' }}
                                </span>
                            </td>
                            @if($financeiroAvancado)
                                <td>
                                    <span class="badge
                                        {{ $tx->status === 'pendente' ? 'badge-warning' : '' }}
                                        {{ $tx->status === 'pago' ? 'badge-danger' : '' }}
                                        {{ $tx->status === 'recebido' ? 'badge-success' : '' }}">
                                        {{ ucfirst($tx->status ?? '-') }}
                                    </span>
                                </td>
                                <td>{{ $tx->forma_pagamento ? ucfirst($tx->forma_pagamento) : '-' }}</td>
                            @endif
                            <td class="font-weight-bold {{ $tx->tipo === 'receita' ? 'text-success' : 'text-danger' }}">
                                {{ $tx->tipo === 'receita' ? '+' : '-' }}R$ {{ number_format($tx->valor, 2, ',', '.') }}
                            </td>
                            <td>{{ $tx->conta->nome ?? '-' }}</td>
                            <td class="text-nowrap">
                                @if($financeiroAvancado && $tx->status === 'pendente')
                                    <button type="button" class="btn btn-xs btn-success" data-toggle="modal" data-target="#modalSettle-{{ $tx->id }}">
                                        {{ $tx->tipo === 'receita' ? 'Receber' : 'Quitar' }}
                                    </button>
                                @endif
                                <a href="{{ route('financeiro.edit-transacao', $tx->id) }}" class="btn btn-xs btn-info">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" action="{{ route('financeiro.destroy-transacao', $tx->id) }}" style="display:inline;" onsubmit="return confirm('Remover este lançamento?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-xs btn-danger">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ $financeiroAvancado ? '9' : '7' }}" class="text-center text-muted py-4">Nenhum lançamento encontrado.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="d-flex justify-content-center mt-3">
            {{ $transacoes->links() }}
        </div>
    </div>
</div>

<div class="modal fade" id="modalCategoria" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('financeiro.store-categoria') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Nova Categoria</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Tipo</label>
                    <select name="tipo" class="form-control" required>
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Cor</label>
                    <input type="color" name="cor" class="form-control" value="#3498db">
                </div>
                <div class="form-group mb-0">
                    <label>Ícone</label>
                    <input type="text" name="icone" class="form-control" value="fas fa-tag">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Categoria</button>
            </div>
        </form>
    </div>
</div>

<div class="modal fade" id="modalTransacao" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
        <form method="POST" action="{{ route('financeiro.store-transacao') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Novo Lançamento</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label>Tipo</label>
                            <select name="tipo" id="tipoTransacao" class="form-control" onchange="financeiroAtualizarFormulario()" required>
                                <option value="despesa">Despesa</option>
                                <option value="receita">Receita</option>
                            </select>
                        </div>
                    </div>
                    @if($financeiroAvancado)
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status" id="statusTransacao" class="form-control" required>
                                    <option value="pago">Pago agora</option>
                                    <option value="pendente">Deixar pendente</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label>Forma</label>
                                <select name="forma_pagamento" class="form-control">
                                    <option value="conta">Saldo da conta</option>
                                    <option value="pix">Pix</option>
                                    <option value="dinheiro">Dinheiro</option>
                                </select>
                            </div>
                        </div>
                    @endif
                </div>

                <div class="row">
                    <div class="col-md-8">
                        <div class="form-group">
                            <label>Descrição</label>
                            <input type="text" name="descricao" class="form-control" placeholder="Ex.: Conta de água, Mercado, Salário" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label>Valor</label>
                            <input type="number" name="valor" class="form-control" step="0.01" min="0.01" required>
                        </div>
                    </div>
                </div>

                @if($financeiroAvancado)
                    <div class="form-group">
                        <label>Complemento</label>
                        <input type="text" name="complemento" class="form-control" placeholder="Ex.: mês de março, apartamento, cliente João">
                    </div>
                @endif

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Categoria</label>
                            <select name="categoria_financeira_id" id="categoriaTransacao" class="form-control" required>
                                <option value="">Selecione</option>
                                @foreach($categorias as $categoria)
                                    <option value="{{ $categoria->id }}" data-tipo="{{ $categoria->tipo }}">{{ $categoria->nome }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Conta / Carteira</label>
                            <select name="conta_bancaria_id" class="form-control" required>
                                @foreach($contas as $conta)
                                    <option value="{{ $conta->id }}">{{ $conta->nome }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Data</label>
                            <input type="date" name="data" class="form-control" value="{{ now()->toDateString() }}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group mt-4 pt-2">
                            <div class="custom-control custom-switch">
                                <input type="hidden" name="recorrente" value="0">
                                <input type="checkbox" class="custom-control-input" id="recorrente" name="recorrente" value="1" onchange="toggleFrequencia()">
                                <label class="custom-control-label" for="recorrente">Lançamento recorrente</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group" id="frequenciaDiv" style="display:none;">
                    <label>Frequência</label>
                    <select name="frequencia" class="form-control">
                        <option value="mensal">Mensal</option>
                        <option value="semanal">Semanal</option>
                        <option value="diaria">Diária</option>
                    </select>
                </div>

                <div class="form-group mb-0">
                    <label>Observações</label>
                    <textarea name="observacoes" class="form-control" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Lançamento</button>
            </div>
        </form>
    </div>
</div>

@if($financeiroAvancado)
@foreach($transacoes as $tx)
    @if($tx->status === 'pendente')
        <div class="modal fade" id="modalSettle-{{ $tx->id }}" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <form method="POST" action="{{ route('financeiro.settle-transacao', $tx->id) }}" class="modal-content">
                    @csrf
                    @method('PATCH')
                    <div class="modal-header">
                        <h5 class="modal-title">{{ $tx->tipo === 'receita' ? 'Confirmar recebimento' : 'Confirmar pagamento' }}</h5>
                        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-3"><strong>{{ $tx->descricao }}</strong> - R$ {{ number_format($tx->valor, 2, ',', '.') }}</p>
                        <div class="form-group">
                            <label>Forma</label>
                            <select name="forma_pagamento" class="form-control" required>
                                <option value="conta">Saldo da conta</option>
                                <option value="pix">Pix</option>
                                <option value="dinheiro">Dinheiro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Conta / Carteira</label>
                            <select name="conta_bancaria_id" class="form-control" required>
                                @foreach($contas as $conta)
                                    <option value="{{ $conta->id }}" @selected($tx->conta_bancaria_id === $conta->id)>{{ $conta->nome }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="form-group mb-0">
                            <label>Data</label>
                            <input type="date" name="data" class="form-control" value="{{ now()->toDateString() }}" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success">{{ $tx->tipo === 'receita' ? 'Marcar como recebido' : 'Marcar como pago' }}</button>
                    </div>
                </form>
            </div>
        </div>
    @endif
@endforeach
@endif

@push('css')
<style>
    .metric-card {
        border: none;
        border-radius: 16px;
        color: #fff;
    }
    .metric-positive { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
    .metric-negative { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
    .metric-neutral { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
    .metric-balance-positive { background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); color: #fff; }
    .metric-balance-negative { background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%); color: #fff; }
</style>
@endpush

@push('js')
<script>
function toggleFrequencia() {
    document.getElementById('frequenciaDiv').style.display =
        document.getElementById('recorrente').checked ? 'block' : 'none';
}

function financeiroAtualizarFormulario() {
    const tipo = document.getElementById('tipoTransacao').value;
    const status = document.getElementById('statusTransacao');
    const categoria = document.getElementById('categoriaTransacao');

    if (tipo === 'receita') {
        status.innerHTML = '<option value="recebido">Recebido agora</option><option value="pendente">Deixar pendente</option>';
    } else {
        status.innerHTML = '<option value="pago">Pago agora</option><option value="pendente">Deixar pendente</option>';
    }

    Array.from(categoria.options).forEach((option) => {
        if (!option.value) {
            option.hidden = false;
            return;
        }

        option.hidden = option.dataset.tipo !== tipo;
    });

    categoria.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tipoTransacao') && document.getElementById('statusTransacao')) {
        financeiroAtualizarFormulario();
    }
});
</script>
@endpush
@stop
