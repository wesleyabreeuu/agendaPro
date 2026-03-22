@extends('adminlte::page')

@section('title', 'Editar Transação')

@section('content_header')
<h1>Editar Transação</h1>
@stop

@section('content')
<div class="card">
    <form method="POST" action="{{ route('financeiro.update-transacao', $transacao->id) }}" class="card-body">
        @csrf
        @method('PUT')

        <div class="form-group">
            <label>Tipo</label>
            <select name="tipo" class="form-control" required>
                <option value="receita" {{ $transacao->tipo === 'receita' ? 'selected' : '' }}>Receita</option>
                <option value="despesa" {{ $transacao->tipo === 'despesa' ? 'selected' : '' }}>Despesa</option>
            </select>
        </div>

        <div class="form-group">
            <label>Descrição</label>
            <input type="text" name="descricao" class="form-control" value="{{ $transacao->descricao }}" required>
        </div>

        <div class="form-group">
            <label>Categoria</label>
            <select name="categoria_financeira_id" class="form-control" required>
                @foreach($categorias as $cat)
                    <option value="{{ $cat->id }}" {{ $transacao->categoria_financeira_id === $cat->id ? 'selected' : '' }}>
                        {{ $cat->nome }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label>Valor</label>
            <input type="number" name="valor" class="form-control" step="0.01" value="{{ $transacao->valor }}" required>
        </div>

        <div class="form-group">
            <label>Data</label>
            <input type="date" name="data" class="form-control" value="{{ $transacao->data->toDateString() }}" required>
        </div>

        <div class="form-group">
            <label>Observações</label>
            <textarea name="observacoes" class="form-control" rows="3">{{ $transacao->observacoes }}</textarea>
        </div>

        <div class="form-group">
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            <a href="{{ route('financeiro.transacoes') }}" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>
@stop
