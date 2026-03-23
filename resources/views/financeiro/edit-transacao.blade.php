@extends('adminlte::page')

@section('title', 'Editar Lançamento')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
        <h1 class="mb-1">Editar Lançamento</h1>
        <p class="text-muted mb-0">Ajuste categoria, valor, status e a conta usada no lançamento.</p>
    </div>
    <a href="{{ route('financeiro.transacoes') }}" class="btn btn-outline-secondary">Voltar</a>
</div>
@stop

@section('content')
<div class="card">
    <form method="POST" action="{{ route('financeiro.update-transacao', $transacao->id) }}" class="card-body">
        @csrf
        @method('PUT')

        <div class="row">
            <div class="col-md-4">
                <div class="form-group">
                    <label>Tipo</label>
                    <select name="tipo" id="tipoTransacao" class="form-control" onchange="financeiroAtualizarFormulario()" required>
                        <option value="receita" @selected($transacao->tipo === 'receita')>Receita</option>
                        <option value="despesa" @selected($transacao->tipo === 'despesa')>Despesa</option>
                    </select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" id="statusTransacao" class="form-control" required></select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Forma</label>
                    <select name="forma_pagamento" class="form-control">
                        <option value="">Selecione</option>
                        <option value="conta" @selected($transacao->forma_pagamento === 'conta')>Saldo da conta</option>
                        <option value="pix" @selected($transacao->forma_pagamento === 'pix')>Pix</option>
                        <option value="dinheiro" @selected($transacao->forma_pagamento === 'dinheiro')>Dinheiro</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="form-group">
                    <label>Descrição</label>
                    <input type="text" name="descricao" class="form-control" value="{{ $transacao->descricao }}" required>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Valor</label>
                    <input type="number" name="valor" class="form-control" step="0.01" value="{{ $transacao->valor }}" required>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Complemento</label>
            <input type="text" name="complemento" class="form-control" value="{{ $transacao->complemento }}">
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Categoria</label>
                    <select name="categoria_financeira_id" id="categoriaTransacao" class="form-control" required>
                        @foreach($categorias as $cat)
                            <option value="{{ $cat->id }}" data-tipo="{{ $cat->tipo }}" @selected($transacao->categoria_financeira_id === $cat->id)>{{ $cat->nome }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Conta / Carteira</label>
                    <select name="conta_bancaria_id" class="form-control" required>
                        @foreach($contas as $conta)
                            <option value="{{ $conta->id }}" @selected($transacao->conta_bancaria_id === $conta->id)>{{ $conta->nome }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Data</label>
                    <input type="date" name="data" class="form-control" value="{{ $transacao->data->toDateString() }}" required>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group mt-4 pt-2">
                    <div class="custom-control custom-switch">
                        <input type="hidden" name="recorrente" value="0">
                        <input type="checkbox" class="custom-control-input" id="recorrente" name="recorrente" value="1" @checked($transacao->recorrente) onchange="toggleFrequencia()">
                        <label class="custom-control-label" for="recorrente">Lançamento recorrente</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="form-group" id="frequenciaDiv" style="{{ $transacao->recorrente ? '' : 'display:none;' }}">
            <label>Frequência</label>
            <select name="frequencia" class="form-control">
                <option value="mensal" @selected($transacao->frequencia === 'mensal')>Mensal</option>
                <option value="semanal" @selected($transacao->frequencia === 'semanal')>Semanal</option>
                <option value="diaria" @selected($transacao->frequencia === 'diaria')>Diária</option>
            </select>
        </div>

        <div class="form-group">
            <label>Observações</label>
            <textarea name="observacoes" class="form-control" rows="3">{{ $transacao->observacoes }}</textarea>
        </div>

        <div class="d-flex gap-2 flex-wrap">
            <button type="submit" class="btn btn-primary">Salvar alterações</button>
            <a href="{{ route('financeiro.transacoes') }}" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

@push('js')
<script>
const statusAtual = @json($transacao->status);

function toggleFrequencia() {
    document.getElementById('frequenciaDiv').style.display =
        document.getElementById('recorrente').checked ? 'block' : 'none';
}

function financeiroAtualizarFormulario() {
    const tipo = document.getElementById('tipoTransacao').value;
    const status = document.getElementById('statusTransacao');
    const categoria = document.getElementById('categoriaTransacao');

    if (tipo === 'receita') {
        status.innerHTML = '<option value="recebido">Recebido</option><option value="pendente">Pendente</option>';
    } else {
        status.innerHTML = '<option value="pago">Pago</option><option value="pendente">Pendente</option>';
    }

    status.value = statusAtual;

    Array.from(categoria.options).forEach((option) => {
        option.hidden = option.dataset.tipo !== tipo;
    });
}

document.addEventListener('DOMContentLoaded', financeiroAtualizarFormulario);
</script>
@endpush
@stop
