<?php

namespace App\Http\Controllers;

use App\Models\TransacaoFinanceira;
use App\Models\CategoriaFinanceira;
use App\Models\ContaBancaria;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class FinanceiroController extends Controller
{
    private const CATEGORIAS_PADRAO = [
        'receita' => [
            ['nome' => 'Salário', 'icone' => 'fas fa-briefcase', 'cor' => '#27ae60'],
            ['nome' => 'Freelance', 'icone' => 'fas fa-laptop', 'cor' => '#2980b9'],
            ['nome' => 'Investimento', 'icone' => 'fas fa-chart-line', 'cor' => '#8e44ad'],
            ['nome' => 'Bônus', 'icone' => 'fas fa-gift', 'cor' => '#e74c3c'],
            ['nome' => 'Outros', 'icone' => 'fas fa-plus-circle', 'cor' => '#95a5a6'],
        ],
        'despesa' => [
            ['nome' => 'Alimentação', 'icone' => 'fas fa-utensils', 'cor' => '#e67e22'],
            ['nome' => 'Transporte', 'icone' => 'fas fa-car', 'cor' => '#3498db'],
            ['nome' => 'Moradia', 'icone' => 'fas fa-home', 'cor' => '#c0392b'],
            ['nome' => 'Saúde', 'icone' => 'fas fa-heartbeat', 'cor' => '#e74c3c'],
            ['nome' => 'Educação', 'icone' => 'fas fa-graduation-cap', 'cor' => '#9b59b6'],
            ['nome' => 'Entretenimento', 'icone' => 'fas fa-film', 'cor' => '#1abc9c'],
            ['nome' => 'Utilidades', 'icone' => 'fas fa-lightbulb', 'cor' => '#f39c12'],
            ['nome' => 'Compras', 'icone' => 'fas fa-shopping-cart', 'cor' => '#16a34a'],
            ['nome' => 'Assinaturas', 'icone' => 'fas fa-star', 'cor' => '#2ecc71'],
            ['nome' => 'Outros', 'icone' => 'fas fa-minus-circle', 'cor' => '#95a5a6'],
        ],
    ];

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);
        
        // Período padrão: mês atual
        $dataInicio = request('data_inicio', Carbon::now()->startOfMonth());
        $dataFim = request('data_fim', Carbon::now()->endOfMonth());

        // Contas
        $contas = ContaBancaria::where('user_id', $user->id)->get();
        $saldoTotal = $contas->sum('saldo_atual');

        // Transações do período
        $transacoes = TransacaoFinanceira::where('user_id', $user->id)
            ->whereBetween('data', [$dataInicio, $dataFim])
            ->with(['categoria', 'conta'])
            ->orderBy('data', 'desc')
            ->get();

        // Cálculos
        $totalReceita = $transacoes->where('tipo', 'receita')->sum('valor');
        $totalDespesa = $transacoes->where('tipo', 'despesa')->sum('valor');
        $lucro = $totalReceita - $totalDespesa;

        // Gráfico de categorias
        $categoriasDespesa = $transacoes->where('tipo', 'despesa')
            ->groupBy('categoria.nome')
            ->map(fn ($group) => [
                'categoria' => $group->first()->categoria->nome,
                'valor' => $group->sum('valor'),
                'percentual' => ($group->sum('valor') / $totalDespesa) * 100,
            ]);

        $categoriasReceita = $transacoes->where('tipo', 'receita')
            ->groupBy('categoria.nome')
            ->map(fn ($group) => [
                'categoria' => $group->first()->categoria->nome,
                'valor' => $group->sum('valor'),
            ]);

        // Últimas transações
        $ultimasTransacoes = TransacaoFinanceira::where('user_id', $user->id)
            ->with(['categoria', 'conta'])
            ->latest('data')
            ->take(10)
            ->get();

        return view('financeiro.dashboard', compact(
            'saldoTotal',
            'totalReceita',
            'totalDespesa',
            'lucro',
            'transacoes',
            'categoriasDespesa',
            'categoriasReceita',
            'contas',
            'ultimasTransacoes',
            'dataInicio',
            'dataFim'
        ));
    }

    public function transacoes(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

        $transacoes = TransacaoFinanceira::where('user_id', $user->id)
            ->with(['categoria', 'conta'])
            ->orderBy('data', 'desc')
            ->paginate(20);

        $categorias = CategoriaFinanceira::where('user_id', $user->id)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();
        $contas = ContaBancaria::where('user_id', $user->id)->where('ativa', true)->get();

        return view('financeiro.transacoes', compact('transacoes', 'categorias', 'contas'));
    }

    public function storeTransacao(Request $request)
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

        $request->validate([
            'tipo' => 'required|in:receita,despesa',
            'descricao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0.01',
            'categoria_financeira_id' => 'required|exists:categoria_financeira,id',
            'conta_bancaria_id' => 'required|exists:conta_bancaria,id',
            'data' => 'required|date',
            'recorrente' => 'nullable|boolean',
            'frequencia' => 'nullable|in:diaria,semanal,mensal',
            'observacoes' => 'nullable|string',
        ]);

        $conta = ContaBancaria::find($request->conta_bancaria_id);
        abort_unless($conta->user_id === $user->id, 403);

        $categoria = CategoriaFinanceira::find($request->categoria_financeira_id);
        abort_unless($categoria->user_id === $user->id, 403);

        $transacao = TransacaoFinanceira::create([
            'user_id' => $user->id,
            'tipo' => $request->tipo,
            'descricao' => $request->descricao,
            'valor' => $request->valor,
            'categoria_financeira_id' => $request->categoria_financeira_id,
            'conta_bancaria_id' => $request->conta_bancaria_id,
            'data' => $request->data,
            'recorrente' => $request->boolean('recorrente'),
            'frequencia' => $request->recorrente ? $request->frequencia : null,
            'observacoes' => $request->observacoes,
        ]);

        // Atualizar saldo da conta
        if ($request->tipo === 'receita') {
            $conta->increment('saldo_atual', $request->valor);
        } else {
            $conta->decrement('saldo_atual', $request->valor);
        }

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Transação cadastrada com sucesso!');
    }

    public function editTransacao(TransacaoFinanceira $transacao): View
    {
        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);
        $this->garantirCategoriasPadrao($user->id);

        $categorias = CategoriaFinanceira::where('user_id', $user->id)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();
        $contas = ContaBancaria::where('user_id', $user->id)->where('ativa', true)->get();

        return view('financeiro.edit-transacao', compact('transacao', 'categorias', 'contas'));
    }

    public function updateTransacao(Request $request, TransacaoFinanceira $transacao)
    {
        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);

        $request->validate([
            'tipo' => 'required|in:receita,despesa',
            'descricao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0.01',
            'categoria_financeira_id' => 'required|exists:categoria_financeira,id',
            'data' => 'required|date',
            'observacoes' => 'nullable|string',
        ]);

        // Reverter saldo anterior
        $direcao = $transacao->tipo === 'receita' ? -1 : 1;
        $transacao->conta->increment('saldo_atual', $direcao * $transacao->valor);

        // Aplicar novo saldo
        $direcao = $request->tipo === 'receita' ? 1 : -1;
        $transacao->conta->increment('saldo_atual', $direcao * $request->valor);

        $transacao->update($request->only('tipo', 'descricao', 'valor', 'categoria_financeira_id', 'data', 'observacoes'));

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Transação atualizada com sucesso!');
    }

    public function destroyTransacao(TransacaoFinanceira $transacao)
    {
        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);

        // Reverter saldo
        $direcao = $transacao->tipo === 'receita' ? -1 : 1;
        $transacao->conta->increment('saldo_atual', $direcao * $transacao->valor);

        $transacao->delete();

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Transação removida com sucesso!');
    }

    public function contas(): View
    {
        $user = Auth::user();
        $contas = ContaBancaria::where('user_id', $user->id)->get();

        return view('financeiro.contas', compact('contas'));
    }

    public function storeConta(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'required|in:bancaria,cartao,dinheiro',
            'saldo_inicial' => 'required|numeric',
        ]);

        ContaBancaria::create([
            'user_id' => $user->id,
            'nome' => $request->nome,
            'tipo' => $request->tipo,
            'saldo_inicial' => $request->saldo_inicial,
            'saldo_atual' => $request->saldo_inicial,
        ]);

        return redirect()->route('financeiro.contas')
            ->with('success', 'Conta criada com sucesso!');
    }

    public function storeCategoria(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'tipo' => 'required|in:receita,despesa',
            'nome' => 'required|string|max:255',
            'icone' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:20',
        ]);

        CategoriaFinanceira::updateOrCreate(
            [
                'user_id' => $user->id,
                'tipo' => $request->tipo,
                'nome' => $request->nome,
            ],
            [
                'icone' => $request->filled('icone') ? $request->icone : 'fas fa-tag',
                'cor' => $request->filled('cor') ? $request->cor : '#3498db',
            ]
        );

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Categoria criada com sucesso!');
    }

    public function relatorios(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

        $ano = request('ano', Carbon::now()->year);
        $mes = request('mes');

        $query = TransacaoFinanceira::where('user_id', $user->id)
            ->whereYear('data', $ano);

        if ($mes) {
            $query->whereMonth('data', $mes);
        }

        $transacoes = $query->with(['categoria', 'conta'])->get();

        $totalReceita = $transacoes->where('tipo', 'receita')->sum('valor');
        $totalDespesa = $transacoes->where('tipo', 'despesa')->sum('valor');

        // Dados por mês
        $dadosPorMes = [];
        for ($m = 1; $m <= 12; $m++) {
            $txMes = TransacaoFinanceira::where('user_id', $user->id)
                ->whereYear('data', $ano)
                ->whereMonth('data', $m)
                ->get();

            $dadosPorMes[] = [
                'mes' => Carbon::create($ano, $m, 1)->format('M'),
                'receita' => $txMes->where('tipo', 'receita')->sum('valor'),
                'despesa' => $txMes->where('tipo', 'despesa')->sum('valor'),
            ];
        }

        return view('financeiro.relatorios', compact(
            'transacoes',
            'totalReceita',
            'totalDespesa',
            'ano',
            'mes',
            'dadosPorMes'
        ));
    }

    private function garantirCategoriasPadrao(int $userId): void
    {
        $jaTemCategorias = CategoriaFinanceira::where('user_id', $userId)->exists();

        if ($jaTemCategorias) {
            return;
        }

        foreach (self::CATEGORIAS_PADRAO as $tipo => $categorias) {
            foreach ($categorias as $categoria) {
                CategoriaFinanceira::create([
                    'user_id' => $userId,
                    'tipo' => $tipo,
                    'nome' => $categoria['nome'],
                    'icone' => $categoria['icone'],
                    'cor' => $categoria['cor'],
                ]);
            }
        }
    }
}
