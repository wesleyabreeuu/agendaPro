<?php

namespace App\Http\Controllers;

use App\Models\CategoriaFinanceira;
use App\Models\ContaBancaria;
use App\Models\MetaBemMaterial;
use App\Models\MetaEconomia;
use App\Models\TransacaoFinanceira;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class FinanceiroController extends Controller
{
    private const CATEGORIAS_PADRAO = [
        'receita' => [
            ['nome' => 'Salário', 'icone' => 'fas fa-briefcase', 'cor' => '#27ae60'],
            ['nome' => 'Freelance', 'icone' => 'fas fa-laptop', 'cor' => '#2980b9'],
            ['nome' => 'Investimento', 'icone' => 'fas fa-chart-line', 'cor' => '#8e44ad'],
            ['nome' => 'Bônus', 'icone' => 'fas fa-gift', 'cor' => '#e74c3c'],
            ['nome' => 'Outros ganhos', 'icone' => 'fas fa-plus-circle', 'cor' => '#95a5a6'],
        ],
        'despesa' => [
            ['nome' => 'Mercado', 'icone' => 'fas fa-shopping-basket', 'cor' => '#e67e22'],
            ['nome' => 'Água', 'icone' => 'fas fa-tint', 'cor' => '#3498db'],
            ['nome' => 'Luz', 'icone' => 'fas fa-bolt', 'cor' => '#f39c12'],
            ['nome' => 'Internet', 'icone' => 'fas fa-wifi', 'cor' => '#8e44ad'],
            ['nome' => 'Moradia', 'icone' => 'fas fa-home', 'cor' => '#c0392b'],
            ['nome' => 'Transporte', 'icone' => 'fas fa-car', 'cor' => '#2980b9'],
            ['nome' => 'Saúde', 'icone' => 'fas fa-heartbeat', 'cor' => '#e74c3c'],
            ['nome' => 'Educação', 'icone' => 'fas fa-graduation-cap', 'cor' => '#9b59b6'],
            ['nome' => 'Assinaturas', 'icone' => 'fas fa-star', 'cor' => '#16a34a'],
            ['nome' => 'Outros gastos', 'icone' => 'fas fa-minus-circle', 'cor' => '#95a5a6'],
        ],
    ];

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);
        $this->garantirContaPadrao($user->id);
        $financeiroAvancado = $this->hasFinanceiroFlowColumns();

        $inicio = request('data_inicio')
            ? Carbon::parse(request('data_inicio'))->startOfDay()
            : now()->startOfMonth();
        $fim = request('data_fim')
            ? Carbon::parse(request('data_fim'))->endOfDay()
            : now()->endOfMonth();

        $contas = ContaBancaria::where('user_id', $user->id)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();

        $queryPeriodo = TransacaoFinanceira::where('user_id', $user->id)
            ->with(['categoria', 'conta'])
            ->whereBetween('data', [$inicio->toDateString(), $fim->toDateString()]);

        $transacoesPeriodo = $queryPeriodo->orderBy('data', 'desc')->get();

        $recebimentos = $financeiroAvancado
            ? $transacoesPeriodo->where('tipo', 'receita')->where('status', 'recebido')->sum('valor')
            : $transacoesPeriodo->where('tipo', 'receita')->sum('valor');
        $gastosPagos = $financeiroAvancado
            ? $transacoesPeriodo->where('tipo', 'despesa')->where('status', 'pago')->sum('valor')
            : $transacoesPeriodo->where('tipo', 'despesa')->sum('valor');
        $pendencias = $financeiroAvancado
            ? $transacoesPeriodo->where('status', 'pendente')->sum('valor')
            : 0;
        $resultado = $recebimentos - $gastosPagos;
        $saldoTotal = $contas->sum('saldo_atual');

        $despesasPorCategoria = $transacoesPeriodo
            ->where('tipo', 'despesa')
            ->when($financeiroAvancado, fn ($collection) => $collection->where('status', 'pago'))
            ->groupBy(fn ($item) => $item->categoria?->nome ?? 'Sem categoria')
            ->map(fn ($group) => [
                'categoria' => $group->first()->categoria?->nome ?? 'Sem categoria',
                'valor' => $group->sum('valor'),
            ])
            ->sortByDesc('valor')
            ->values();

        $pendentes = $financeiroAvancado
            ? TransacaoFinanceira::where('user_id', $user->id)
                ->with(['categoria', 'conta'])
                ->where('status', 'pendente')
                ->orderBy('data')
                ->take(8)
                ->get()
            : collect();

        $ultimasTransacoes = TransacaoFinanceira::where('user_id', $user->id)
            ->with(['categoria', 'conta'])
            ->latest('data')
            ->take(8)
            ->get();

        $metasEconomia = $this->carregarMetasEconomia($user->id);
        $metasBens = $this->carregarMetasBens($user->id);

        return Inertia::render('Financeiro/Dashboard', [
            'filtros' => [
                'data_inicio' => $inicio->toDateString(),
                'data_fim' => $fim->toDateString(),
            ],
            'resumo' => [
                'saldo_total' => (float) $saldoTotal,
                'recebimentos' => (float) $recebimentos,
                'gastos_pagos' => (float) $gastosPagos,
                'pendencias' => (float) $pendencias,
                'resultado' => (float) $resultado,
            ],
            'contas' => $contas->map(fn (ContaBancaria $conta) => $this->serializeConta($conta))->values()->all(),
            'despesasPorCategoria' => $despesasPorCategoria->values()->all(),
            'pendentes' => $pendentes->map(fn (TransacaoFinanceira $transacao) => $this->serializeTransacao($transacao))->values()->all(),
            'ultimasTransacoes' => $ultimasTransacoes->map(fn (TransacaoFinanceira $transacao) => $this->serializeTransacao($transacao))->values()->all(),
            'metasEconomia' => $metasEconomia->map(fn (array $item) => [
                'meta' => [
                    'id' => $item['meta']->id,
                    'titulo' => $item['meta']->titulo,
                    'descricao' => $item['meta']->descricao,
                    'valor_alvo' => (float) $item['meta']->valor_alvo,
                    'valor_atual' => (float) $item['meta']->valor_atual,
                    'periodicidade' => $item['meta']->periodicidade,
                    'prazo_final' => $item['meta']->prazo_final?->format('d/m/Y'),
                ],
                'analise' => $item['analise'],
            ])->values()->all(),
            'metasBens' => $metasBens->map(fn (array $item) => [
                'meta' => [
                    'id' => $item['meta']->id,
                    'nome_bem' => $item['meta']->nome_bem,
                    'descricao' => $item['meta']->descricao,
                    'valor_bem' => (float) $item['meta']->valor_bem,
                    'valor_ja_guardado' => (float) $item['meta']->valor_ja_guardado,
                    'valor_guardar_mes' => (float) $item['meta']->valor_guardar_mes,
                ],
                'analise' => $item['analise'],
            ])->values()->all(),
            'financeiroAvancado' => $financeiroAvancado,
        ]);
    }

    public function transacoes(Request $request): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);
        $this->garantirContaPadrao($user->id);
        $financeiroAvancado = $this->hasFinanceiroFlowColumns();

        $categorias = CategoriaFinanceira::where('user_id', $user->id)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();

        $contas = ContaBancaria::where('user_id', $user->id)
            ->where('ativa', true)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();

        $query = TransacaoFinanceira::where('user_id', $user->id)
            ->with(['categoria', 'conta'])
            ->orderBy('data', 'desc')
            ->orderBy('id', 'desc');

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($financeiroAvancado && $request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('categoria')) {
            $query->where('categoria_financeira_id', $request->categoria);
        }

        if ($request->filled('conta')) {
            $query->where('conta_bancaria_id', $request->conta);
        }

        if ($request->filled('mes')) {
            [$ano, $mes] = explode('-', $request->mes);
            $query->whereYear('data', (int) $ano)->whereMonth('data', (int) $mes);
        }

        $totaisQuery = clone $query;
        $transacoes = $query->paginate(20)->withQueryString();
        $totais = $totaisQuery->get();

        $resumo = [
            'recebido' => $financeiroAvancado
                ? $totais->where('tipo', 'receita')->where('status', 'recebido')->sum('valor')
                : $totais->where('tipo', 'receita')->sum('valor'),
            'gasto' => $financeiroAvancado
                ? $totais->where('tipo', 'despesa')->where('status', 'pago')->sum('valor')
                : $totais->where('tipo', 'despesa')->sum('valor'),
            'pendente' => $financeiroAvancado ? $totais->where('status', 'pendente')->sum('valor') : 0,
        ];
        $resumo['resultado'] = $resumo['recebido'] - $resumo['gasto'];

        return Inertia::render('Financeiro/Transacoes', [
            'transacoes' => [
                'data' => $transacoes->getCollection()->map(fn (TransacaoFinanceira $transacao) => $this->serializeTransacao($transacao))->values()->all(),
                'current_page' => $transacoes->currentPage(),
                'last_page' => $transacoes->lastPage(),
                'per_page' => $transacoes->perPage(),
                'total' => $transacoes->total(),
            ],
            'categorias' => $categorias->map(fn (CategoriaFinanceira $categoria) => $this->serializeCategoria($categoria))->values()->all(),
            'contas' => $contas->map(fn (ContaBancaria $conta) => $this->serializeConta($conta))->values()->all(),
            'resumo' => array_map(fn ($value) => (float) $value, $resumo),
            'filters' => [
                'tipo' => $request->tipo,
                'status' => $request->status,
                'categoria' => $request->categoria,
                'conta' => $request->conta,
                'mes' => $request->mes,
            ],
            'financeiroAvancado' => $financeiroAvancado,
        ]);
    }

    public function storeTransacao(Request $request)
    {
        if (!$this->hasFinanceiroFlowColumns()) {
            return redirect()->route('financeiro.transacoes')
                ->with('error', 'Atualize o banco com as novas migrations do financeiro para usar esse fluxo.');
        }

        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);
        $this->garantirContaPadrao($user->id);

        $data = $this->validateTransacao($request);

        $conta = ContaBancaria::where('user_id', $user->id)->findOrFail($data['conta_bancaria_id']);
        $categoria = CategoriaFinanceira::where('user_id', $user->id)->findOrFail($data['categoria_financeira_id']);

        $status = $this->normalizeStatus($data['tipo'], $data['status'] ?? null);

        $transacao = TransacaoFinanceira::create([
            'user_id' => $user->id,
            'conta_bancaria_id' => $conta->id,
            'categoria_financeira_id' => $categoria->id,
            'tipo' => $data['tipo'],
            'status' => $status,
            'forma_pagamento' => $status === 'pendente' ? null : ($data['forma_pagamento'] ?? 'conta'),
            'descricao' => $data['descricao'],
            'complemento' => $data['complemento'] ?? null,
            'valor' => $data['valor'],
            'data' => $data['data'],
            'recorrente' => (bool) ($data['recorrente'] ?? false),
            'frequencia' => !empty($data['recorrente']) ? ($data['frequencia'] ?? null) : null,
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        if ($this->shouldImpactBalance($transacao->tipo, $transacao->status)) {
            $this->applyBalanceImpact($conta, $transacao->tipo, (float) $transacao->valor);
        }

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Lançamento salvo com sucesso!');
    }

    public function editTransacao(TransacaoFinanceira $transacao): Response
    {
        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);
        $this->garantirCategoriasPadrao($user->id);
        $this->garantirContaPadrao($user->id);

        $categorias = CategoriaFinanceira::where('user_id', $user->id)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();
        $contas = ContaBancaria::where('user_id', $user->id)
            ->where('ativa', true)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Financeiro/EditTransacao', [
            'transacao' => $this->serializeTransacaoForm($transacao),
            'categorias' => $categorias->map(fn (CategoriaFinanceira $categoria) => $this->serializeCategoria($categoria))->values()->all(),
            'contas' => $contas->map(fn (ContaBancaria $conta) => $this->serializeConta($conta))->values()->all(),
            'financeiroAvancado' => $this->hasFinanceiroFlowColumns(),
        ]);
    }

    public function updateTransacao(Request $request, TransacaoFinanceira $transacao)
    {
        if (!$this->hasFinanceiroFlowColumns()) {
            return redirect()->route('financeiro.transacoes')
                ->with('error', 'Atualize o banco com as novas migrations do financeiro para usar esse fluxo.');
        }

        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);

        $data = $this->validateTransacao($request);
        $conta = ContaBancaria::where('user_id', $user->id)->findOrFail($data['conta_bancaria_id']);
        $categoria = CategoriaFinanceira::where('user_id', $user->id)->findOrFail($data['categoria_financeira_id']);

        $contaAnterior = $transacao->conta;
        $impactavaAntes = $this->shouldImpactBalance($transacao->tipo, $transacao->status);

        if ($impactavaAntes && $contaAnterior) {
            $this->applyBalanceImpact($contaAnterior, $transacao->tipo, (float) $transacao->valor, true);
        }

        $status = $this->normalizeStatus($data['tipo'], $data['status'] ?? null);

        $transacao->update([
            'conta_bancaria_id' => $conta->id,
            'categoria_financeira_id' => $categoria->id,
            'tipo' => $data['tipo'],
            'status' => $status,
            'forma_pagamento' => $status === 'pendente' ? null : ($data['forma_pagamento'] ?? 'conta'),
            'descricao' => $data['descricao'],
            'complemento' => $data['complemento'] ?? null,
            'valor' => $data['valor'],
            'data' => $data['data'],
            'recorrente' => (bool) ($data['recorrente'] ?? false),
            'frequencia' => !empty($data['recorrente']) ? ($data['frequencia'] ?? null) : null,
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        if ($this->shouldImpactBalance($transacao->tipo, $transacao->status)) {
            $this->applyBalanceImpact($conta, $transacao->tipo, (float) $transacao->valor);
        }

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Lançamento atualizado com sucesso!');
    }

    public function destroyTransacao(TransacaoFinanceira $transacao)
    {
        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);

        if ($this->shouldImpactBalance($transacao->tipo, $transacao->status) && $transacao->conta) {
            $this->applyBalanceImpact($transacao->conta, $transacao->tipo, (float) $transacao->valor, true);
        }

        $transacao->delete();

        return redirect()->route('financeiro.transacoes')
            ->with('success', 'Lançamento removido com sucesso!');
    }

    public function settleTransacao(Request $request, TransacaoFinanceira $transacao)
    {
        if (!$this->hasFinanceiroFlowColumns()) {
            return redirect()->route('financeiro.transacoes')
                ->with('error', 'Atualize o banco com as novas migrations do financeiro para usar esse fluxo.');
        }

        $user = Auth::user();
        abort_unless($transacao->user_id === $user->id, 403);

        $request->validate([
            'conta_bancaria_id' => 'required|exists:conta_bancaria,id',
            'forma_pagamento' => 'required|in:dinheiro,pix,conta',
            'data' => 'required|date',
        ]);

        $conta = ContaBancaria::where('user_id', $user->id)->findOrFail($request->conta_bancaria_id);

        if ($this->shouldImpactBalance($transacao->tipo, $transacao->status) && $transacao->conta) {
            $this->applyBalanceImpact($transacao->conta, $transacao->tipo, (float) $transacao->valor, true);
        }

        $transacao->update([
            'conta_bancaria_id' => $conta->id,
            'forma_pagamento' => $request->forma_pagamento,
            'status' => $transacao->tipo === 'receita' ? 'recebido' : 'pago',
            'data' => $request->data,
        ]);

        $this->applyBalanceImpact($conta, $transacao->tipo, (float) $transacao->valor);

        return redirect()->route('financeiro.transacoes')
            ->with('success', $transacao->tipo === 'receita' ? 'Recebimento confirmado com sucesso!' : 'Pagamento confirmado com sucesso!');
    }

    public function contas(): Response
    {
        $user = Auth::user();
        $this->garantirContaPadrao($user->id);

        $contas = ContaBancaria::where('user_id', $user->id)
            ->orderBy('tipo')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Financeiro/Contas', [
            'contas' => $contas->map(fn (ContaBancaria $conta) => $this->serializeConta($conta))->values()->all(),
        ]);
    }

    public function storeConta(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'nome' => 'required|string|max:255',
            'instituicao' => 'nullable|string|max:255',
            'tipo' => 'required|in:bancaria,cartao,dinheiro',
            'saldo_inicial' => 'required|numeric',
        ]);

        ContaBancaria::create([
            'user_id' => $user->id,
            'nome' => $request->nome,
            'instituicao' => $request->instituicao,
            'tipo' => $request->tipo,
            'saldo_inicial' => $request->saldo_inicial,
            'saldo_atual' => $request->saldo_inicial,
        ]);

        return redirect()->route('financeiro.contas')
            ->with('success', 'Conta ou carteira criada com sucesso!');
    }

    public function depositarConta(Request $request, ContaBancaria $conta)
    {
        $user = Auth::user();
        $this->authorizeConta($conta, $user->id);

        $request->validate([
            'valor' => 'required|numeric|min:0.01',
        ]);

        $conta->increment('saldo_atual', $request->valor);

        return redirect()->route('financeiro.contas')
            ->with('success', 'Depósito registrado com sucesso!');
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

    public function relatorios(Request $request): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);
        $this->garantirContaPadrao($user->id);
        $financeiroAvancado = $this->hasFinanceiroFlowColumns();

        $ano = (int) $request->input('ano', now()->year);
        $mes = $request->input('mes');

        $query = TransacaoFinanceira::where('user_id', $user->id)
            ->with(['categoria', 'conta'])
            ->whereYear('data', $ano);

        if ($mes) {
            $query->whereMonth('data', (int) $mes);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($financeiroAvancado && $request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('categoria')) {
            $query->where('categoria_financeira_id', $request->categoria);
        }

        $transacoes = $query->orderBy('data', 'desc')->get();

        $totalReceita = $financeiroAvancado
            ? $transacoes->where('tipo', 'receita')->where('status', 'recebido')->sum('valor')
            : $transacoes->where('tipo', 'receita')->sum('valor');
        $totalDespesa = $financeiroAvancado
            ? $transacoes->where('tipo', 'despesa')->where('status', 'pago')->sum('valor')
            : $transacoes->where('tipo', 'despesa')->sum('valor');
        $totalPendente = $financeiroAvancado ? $transacoes->where('status', 'pendente')->sum('valor') : 0;
        $resultado = $totalReceita - $totalDespesa;

        $dadosPorMes = collect(range(1, 12))->map(function (int $m) use ($user, $ano, $financeiroAvancado) {
            $txMes = TransacaoFinanceira::where('user_id', $user->id)
                ->whereYear('data', $ano)
                ->whereMonth('data', $m)
                ->get();

            $receita = $financeiroAvancado
                ? $txMes->where('tipo', 'receita')->where('status', 'recebido')->sum('valor')
                : $txMes->where('tipo', 'receita')->sum('valor');
            $despesa = $financeiroAvancado
                ? $txMes->where('tipo', 'despesa')->where('status', 'pago')->sum('valor')
                : $txMes->where('tipo', 'despesa')->sum('valor');

            return [
                'mes' => Carbon::create($ano, $m, 1)->translatedFormat('M'),
                'receita' => $receita,
                'despesa' => $despesa,
                'resultado' => $receita - $despesa,
            ];
        });

        $despesasPorCategoria = $transacoes
            ->where('tipo', 'despesa')
            ->when($financeiroAvancado, fn ($collection) => $collection->where('status', 'pago'))
            ->groupBy(fn ($item) => $item->categoria?->nome ?? 'Sem categoria')
            ->map(fn ($group) => $group->sum('valor'))
            ->sortDesc();

        $receitasPorCategoria = $transacoes
            ->where('tipo', 'receita')
            ->when($financeiroAvancado, fn ($collection) => $collection->where('status', 'recebido'))
            ->groupBy(fn ($item) => $item->categoria?->nome ?? 'Sem categoria')
            ->map(fn ($group) => $group->sum('valor'))
            ->sortDesc();

        $categorias = CategoriaFinanceira::where('user_id', $user->id)->orderBy('tipo')->orderBy('nome')->get();
        $contas = ContaBancaria::where('user_id', $user->id)->where('ativa', true)->orderBy('nome')->get();

        return Inertia::render('Financeiro/Relatorios', [
            'transacoes' => $transacoes->map(fn (TransacaoFinanceira $transacao) => $this->serializeTransacao($transacao))->values()->all(),
            'totais' => [
                'receita' => (float) $totalReceita,
                'despesa' => (float) $totalDespesa,
                'pendente' => (float) $totalPendente,
                'resultado' => (float) $resultado,
            ],
            'filtros' => [
                'ano' => $ano,
                'mes' => $mes,
                'tipo' => $request->tipo,
                'status' => $request->status,
                'categoria' => $request->categoria,
            ],
            'dadosPorMes' => $dadosPorMes->values()->all(),
            'despesasPorCategoria' => $despesasPorCategoria->map(fn ($valor, $categoria) => [
                'categoria' => $categoria,
                'valor' => (float) $valor,
            ])->values()->all(),
            'receitasPorCategoria' => $receitasPorCategoria->map(fn ($valor, $categoria) => [
                'categoria' => $categoria,
                'valor' => (float) $valor,
            ])->values()->all(),
            'categorias' => $categorias->map(fn (CategoriaFinanceira $categoria) => $this->serializeCategoria($categoria))->values()->all(),
            'contas' => $contas->map(fn (ContaBancaria $conta) => $this->serializeConta($conta))->values()->all(),
            'financeiroAvancado' => $financeiroAvancado,
        ]);
    }

    public function storeMetaEconomia(Request $request)
    {
        if (!Schema::hasTable('metas_economia')) {
            return redirect()->route('financeiro.dashboard')
                ->with('error', 'As tabelas de metas ainda não foram criadas. Execute as migrations do sistema.');
        }

        $user = Auth::user();

        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:255',
            'valor_alvo' => 'required|numeric|min:0.01',
            'valor_atual' => 'nullable|numeric|min:0',
            'periodicidade' => 'required|in:dia,mes,ano',
            'prazo_final' => 'required|date|after:today',
        ]);

        MetaEconomia::create([
            'user_id' => $user->id,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'valor_alvo' => $request->valor_alvo,
            'valor_atual' => $request->input('valor_atual', 0),
            'periodicidade' => $request->periodicidade,
            'prazo_final' => $request->prazo_final,
        ]);

        return redirect()->route('financeiro.dashboard')
            ->with('success', 'Meta de economia criada com sucesso!');
    }

    public function destroyMetaEconomia(MetaEconomia $metaEconomia)
    {
        if (!Schema::hasTable('metas_economia')) {
            return redirect()->route('financeiro.dashboard')
                ->with('error', 'As tabelas de metas ainda não foram criadas. Execute as migrations do sistema.');
        }

        abort_unless($metaEconomia->user_id === Auth::id(), 403);
        $metaEconomia->delete();

        return redirect()->route('financeiro.dashboard')
            ->with('success', 'Meta de economia removida com sucesso!');
    }

    public function storeMetaBemMaterial(Request $request)
    {
        if (!Schema::hasTable('metas_bem_material')) {
            return redirect()->route('financeiro.dashboard')
                ->with('error', 'As tabelas de metas ainda não foram criadas. Execute as migrations do sistema.');
        }

        $user = Auth::user();

        $request->validate([
            'nome_bem' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:255',
            'valor_bem' => 'required|numeric|min:0.01',
            'valor_ja_guardado' => 'nullable|numeric|min:0',
            'valor_guardar_mes' => 'required|numeric|min:0.01',
        ]);

        MetaBemMaterial::create([
            'user_id' => $user->id,
            'nome_bem' => $request->nome_bem,
            'descricao' => $request->descricao,
            'valor_bem' => $request->valor_bem,
            'valor_ja_guardado' => $request->input('valor_ja_guardado', 0),
            'valor_guardar_mes' => $request->valor_guardar_mes,
        ]);

        return redirect()->route('financeiro.dashboard')
            ->with('success', 'Meta de bem material criada com sucesso!');
    }

    public function destroyMetaBemMaterial(MetaBemMaterial $metaBemMaterial)
    {
        if (!Schema::hasTable('metas_bem_material')) {
            return redirect()->route('financeiro.dashboard')
                ->with('error', 'As tabelas de metas ainda não foram criadas. Execute as migrations do sistema.');
        }

        abort_unless($metaBemMaterial->user_id === Auth::id(), 403);
        $metaBemMaterial->delete();

        return redirect()->route('financeiro.dashboard')
            ->with('success', 'Meta de bem material removida com sucesso!');
    }

    private function validateTransacao(Request $request): array
    {
        $data = $request->validate([
            'tipo' => 'required|in:receita,despesa',
            'status' => 'nullable|in:pendente,pago,recebido',
            'descricao' => 'required|string|max:255',
            'complemento' => 'nullable|string|max:255',
            'valor' => 'required|numeric|min:0.01',
            'categoria_financeira_id' => 'required|exists:categoria_financeira,id',
            'conta_bancaria_id' => 'required|exists:conta_bancaria,id',
            'forma_pagamento' => 'nullable|in:dinheiro,pix,conta',
            'data' => 'required|date',
            'recorrente' => 'nullable|boolean',
            'frequencia' => 'nullable|in:diaria,semanal,mensal',
            'observacoes' => 'nullable|string',
        ]);

        ContaBancaria::where('user_id', Auth::id())->findOrFail($data['conta_bancaria_id']);
        CategoriaFinanceira::where('user_id', Auth::id())->findOrFail($data['categoria_financeira_id']);

        return $data;
    }

    private function carregarMetasEconomia(int $userId)
    {
        if (!Schema::hasTable('metas_economia')) {
            return collect();
        }

        return MetaEconomia::where('user_id', $userId)
            ->orderBy('prazo_final')
            ->get()
            ->map(fn (MetaEconomia $meta) => [
                'meta' => $meta,
                'analise' => $this->analisarMetaEconomia($meta),
            ]);
    }

    private function carregarMetasBens(int $userId)
    {
        if (!Schema::hasTable('metas_bem_material')) {
            return collect();
        }

        return MetaBemMaterial::where('user_id', $userId)
            ->latest()
            ->get()
            ->map(fn (MetaBemMaterial $meta) => [
                'meta' => $meta,
                'analise' => $this->analisarMetaBemMaterial($meta),
            ]);
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

    private function garantirContaPadrao(int $userId): void
    {
        $jaTemConta = ContaBancaria::where('user_id', $userId)->exists();

        if ($jaTemConta) {
            return;
        }

        ContaBancaria::create([
            'user_id' => $userId,
            'nome' => 'Carteira',
            'instituicao' => 'Uso diário',
            'tipo' => 'dinheiro',
            'saldo_inicial' => 0,
            'saldo_atual' => 0,
            'ativa' => true,
        ]);
    }

    private function normalizeStatus(string $tipo, ?string $status): string
    {
        if ($status === 'pendente') {
            return 'pendente';
        }

        return $tipo === 'receita' ? 'recebido' : 'pago';
    }

    private function shouldImpactBalance(string $tipo, ?string $status): bool
    {
        return ($tipo === 'receita' && $status === 'recebido')
            || ($tipo === 'despesa' && $status === 'pago');
    }

    private function applyBalanceImpact(ContaBancaria $conta, string $tipo, float $valor, bool $reverse = false): void
    {
        $delta = $tipo === 'receita' ? $valor : -$valor;
        $delta = $reverse ? -$delta : $delta;

        $conta->increment('saldo_atual', $delta);
    }

    private function authorizeConta(ContaBancaria $conta, int $userId): void
    {
        abort_unless($conta->user_id === $userId, 403);
    }

    private function authorizeCategoria(CategoriaFinanceira $categoria, int $userId): void
    {
        abort_unless($categoria->user_id === $userId, 403);
    }

    private function hasFinanceiroFlowColumns(): bool
    {
        return Schema::hasTable('transacao_financeira')
            && Schema::hasColumn('transacao_financeira', 'status')
            && Schema::hasColumn('transacao_financeira', 'forma_pagamento')
            && Schema::hasColumn('transacao_financeira', 'complemento');
    }

    private function analisarMetaEconomia(MetaEconomia $meta): array
    {
        $hoje = Carbon::today();
        $prazo = $meta->prazo_final->copy();
        $faltante = max((float) $meta->valor_alvo - (float) $meta->valor_atual, 0);
        $progresso = (float) $meta->valor_alvo > 0
            ? min((((float) $meta->valor_atual / (float) $meta->valor_alvo) * 100), 100)
            : 0;

        $periodosRestantes = match ($meta->periodicidade) {
            'dia' => max($hoje->diffInDays($prazo, false), 1),
            'ano' => max($hoje->diffInYears($prazo, false), 1),
            default => max($hoje->diffInMonths($prazo, false), 1),
        };

        $valorPorPeriodo = $faltante > 0 ? $faltante / $periodosRestantes : 0;

        return [
            'faltante' => $faltante,
            'progresso' => $progresso,
            'periodos_restantes' => $periodosRestantes,
            'valor_por_periodo' => $valorPorPeriodo,
            'equivalente_mensal' => $meta->periodicidade === 'mes'
                ? $valorPorPeriodo
                : ($meta->periodicidade === 'dia' ? $valorPorPeriodo * 30 : $valorPorPeriodo / 12),
        ];
    }

    private function analisarMetaBemMaterial(MetaBemMaterial $meta): array
    {
        $faltante = max((float) $meta->valor_bem - (float) $meta->valor_ja_guardado, 0);
        $aporteMensal = (float) $meta->valor_guardar_mes;
        $mesesEstimados = $aporteMensal > 0 ? (int) ceil($faltante / $aporteMensal) : null;
        $progresso = (float) $meta->valor_bem > 0
            ? min((((float) $meta->valor_ja_guardado / (float) $meta->valor_bem) * 100), 100)
            : 0;

        return [
            'faltante' => $faltante,
            'meses_estimados' => $mesesEstimados,
            'progresso' => $progresso,
            'cenarios' => [
                '24 meses' => (float) $meta->valor_bem / 24,
                '12 meses' => (float) $meta->valor_bem / 12,
                '6 meses' => (float) $meta->valor_bem / 6,
            ],
        ];
    }

    private function serializeConta(ContaBancaria $conta): array
    {
        return [
            'id' => $conta->id,
            'nome' => $conta->nome,
            'instituicao' => $conta->instituicao,
            'tipo' => $conta->tipo,
            'saldo_inicial' => (float) $conta->saldo_inicial,
            'saldo_atual' => (float) $conta->saldo_atual,
            'ativa' => (bool) $conta->ativa,
        ];
    }

    private function serializeCategoria(CategoriaFinanceira $categoria): array
    {
        return [
            'id' => $categoria->id,
            'tipo' => $categoria->tipo,
            'nome' => $categoria->nome,
            'icone' => $categoria->icone,
            'cor' => $categoria->cor,
        ];
    }

    private function serializeTransacao(TransacaoFinanceira $transacao): array
    {
        return [
            'id' => $transacao->id,
            'tipo' => $transacao->tipo,
            'status' => $transacao->status,
            'forma_pagamento' => $transacao->forma_pagamento,
            'descricao' => $transacao->descricao,
            'complemento' => $transacao->complemento,
            'valor' => (float) $transacao->valor,
            'data' => $transacao->data?->format('d/m/Y'),
            'data_iso' => $transacao->data?->toDateString(),
            'recorrente' => (bool) $transacao->recorrente,
            'frequencia' => $transacao->frequencia,
            'observacoes' => $transacao->observacoes,
            'categoria' => $transacao->categoria ? $this->serializeCategoria($transacao->categoria) : null,
            'conta' => $transacao->conta ? $this->serializeConta($transacao->conta) : null,
        ];
    }

    private function serializeTransacaoForm(TransacaoFinanceira $transacao): array
    {
        return [
            'id' => $transacao->id,
            'tipo' => $transacao->tipo,
            'status' => $transacao->status,
            'forma_pagamento' => $transacao->forma_pagamento,
            'descricao' => $transacao->descricao,
            'complemento' => $transacao->complemento,
            'valor' => (float) $transacao->valor,
            'categoria_financeira_id' => $transacao->categoria_financeira_id,
            'conta_bancaria_id' => $transacao->conta_bancaria_id,
            'data' => $transacao->data?->toDateString(),
            'recorrente' => (bool) $transacao->recorrente,
            'frequencia' => $transacao->frequencia,
            'observacoes' => $transacao->observacoes,
        ];
    }
}
