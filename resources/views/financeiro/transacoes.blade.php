@extends('adminlte::page')

@section('title', 'Transações Financeiras')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <h1>Transações</h1>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" data-toggle="modal" data-target="#modalCategoria">
            <i class="fas fa-tags"></i> Nova Categoria
        </button>
        <a href="{{ route('financeiro.contas') }}" class="btn btn-outline-info">
            <i class="fas fa-wallet"></i> Gerenciar Contas
        </a>
        <button
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#modalTransacao"
            {{ $contas->isEmpty() ? 'disabled' : '' }}
        >
            <i class="fas fa-plus-circle"></i> Nova Transação
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

@if($contas->isEmpty())
    <div class="alert alert-warning">
        Você ainda não tem nenhuma conta cadastrada. Crie uma conta em
        <a href="{{ route('financeiro.contas') }}">Contas</a>
        para conseguir lançar transações.
    </div>
@endif

<div class="alert alert-info">
    <strong>Categoria</strong> classifica o lançamento, como Salário, Mercado ou Transporte.
    <strong>Conta/Carteira</strong> indica de onde o dinheiro saiu ou entrou, como banco, cartão ou dinheiro em mãos.
    Você pode criar novas categorias aqui e gerenciar contas em <a href="{{ route('financeiro.contas') }}">Contas</a>.
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover table-sm">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Conta</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($transacoes as $tx)
                        <tr>
                            <td>{{ $tx->data->format('d/m/Y') }}</td>
                            <td>{{ $tx->descricao }}</td>
                            <td><span class="badge" style="background-color: {{ $tx->categoria->cor }}; color: white;">{{ $tx->categoria->nome }}</span></td>
                            <td>
                                @if($tx->tipo === 'receita')
                                    <span class="badge badge-success">✓ Receita</span>
                                @else
                                    <span class="badge badge-danger">✗ Despesa</span>
                                @endif
                            </td>
                            <td class="font-weight-bold">
                                <span class="{{ $tx->tipo === 'receita' ? 'text-success' : 'text-danger' }}">
                                    {{ $tx->tipo === 'receita' ? '+' : '-' }}R$ {{ number_format($tx->valor, 2, ',', '.') }}
                                </span>
                            </td>
                            <td>{{ $tx->conta->nome }}</td>
                            <td>
                                <a href="{{ route('financeiro.edit-transacao', $tx->id) }}" class="btn btn-xs btn-info" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" action="{{ route('financeiro.destroy-transacao', $tx->id) }}" onsubmit="return confirm('Tem certeza?')" style="display: inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-xs btn-danger" title="Deletar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted">Nenhuma transação registrada</td>
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

<!-- Modal Nova Categoria -->
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
                    <small class="form-text text-muted">
                        Escolha se esta categoria será usada para entradas ou saídas de dinheiro.
                    </small>
                </div>

                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" class="form-control" placeholder="Ex: Mercado, Pix, Academia" required>
                    <small class="form-text text-muted">
                        Use um nome curto e fácil de reconhecer na lista de transações.
                    </small>
                </div>

                <div class="form-group">
                    <label>Cor</label>
                    <input type="color" name="cor" class="form-control" value="#3498db">
                </div>

                <div class="form-group">
                    <label>Ícone</label>
                    <input type="text" name="icone" class="form-control" value="fas fa-tag" placeholder="Ex: fas fa-car">
                    <small class="form-text text-muted">
                        Exemplo: <code>fas fa-car</code>, <code>fas fa-home</code>, <code>fas fa-utensils</code>.
                    </small>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Categoria</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal Nova Transação -->
<div class="modal fade" id="modalTransacao" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('financeiro.store-transacao') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Nova Transação</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Tipo</label>
                    <select name="tipo" class="form-control" onchange="atualizarCategorias()" required>
                        <option value="">-- Selecione --</option>
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                    </select>
                    <small class="form-text text-muted">
                        O tipo define quais categorias aparecem abaixo.
                    </small>
                </div>

                <div class="form-group">
                    <label>Descrição</label>
                    <input type="text" name="descricao" class="form-control" placeholder="Ex: Salário de março, Almoço, Uber" required>
                </div>

                <div class="form-group">
                    <label>Categoria</label>
                    <select name="categoria_financeira_id" class="form-control" required>
                        <option value="">-- Selecione uma categoria --</option>
                        @foreach($categorias as $cat)
                            <option value="{{ $cat->id }}" data-tipo="{{ $cat->tipo }}">
                                {{ $cat->nome }}
                            </option>
                        @endforeach
                    </select>
                    <small class="form-text text-muted">
                        Categoria serve para organizar o lançamento por assunto.
                    </small>
                </div>

                <div class="form-group">
                    <label>Valor</label>
                    <input type="number" name="valor" class="form-control" step="0.01" min="0.01" placeholder="Ex: 150.00" required>
                </div>

                <div class="form-group">
                    <label>Conta / Carteira</label>
                    <select name="conta_bancaria_id" class="form-control" required>
                        <option value="">-- Selecione uma conta --</option>
                        @foreach($contas as $conta)
                            <option value="{{ $conta->id }}">{{ $conta->nome }}</option>
                        @endforeach
                    </select>
                    <small class="form-text text-muted">
                        Escolha onde o dinheiro entrou ou de onde ele saiu.
                    </small>
                </div>

                <div class="form-group">
                    <label>Data</label>
                    <input type="date" name="data" class="form-control" value="{{ now()->toDateString() }}" required>
                </div>

                <div class="form-check mb-2">
                    <input type="checkbox" name="recorrente" id="recorrente" class="form-check-input" onchange="toggleFrequencia()">
                    <label class="form-check-label" for="recorrente">
                        Transação Recorrente
                    </label>
                </div>

                <div class="form-group" id="frequenciaDiv" style="display: none;">
                    <label>Frequência</label>
                    <select name="frequencia" class="form-control">
                        <option value="diaria">Diária</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal" selected>Mensal</option>
                    </select>
                    <small class="form-text text-muted">
                        Use isso para lançamentos que se repetem automaticamente.
                    </small>
                </div>

                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes" class="form-control" rows="2" placeholder="Ex: pago no cartão, referente ao aluguel..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" {{ $contas->isEmpty() ? 'disabled' : '' }}>Salvar Transação</button>
            </div>
        </form>
    </div>
</div>

@push('js')
<script>
function toggleFrequencia() {
    document.getElementById('frequenciaDiv').style.display = 
        document.getElementById('recorrente').checked ? 'block' : 'none';
}

function atualizarCategorias() {
    const tipo = document.querySelector('select[name="tipo"]').value;
    const options = document.querySelectorAll('select[name="categoria_financeira_id"] option');
    
    options.forEach(opt => {
        if (opt.value === '' || opt.dataset.tipo === tipo) {
            opt.style.display = 'block';
        } else {
            opt.style.display = 'none';
        }
    });
}
</script>
@endpush
@stop
