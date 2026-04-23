<?php

namespace App\Http\Controllers;

use App\Http\Requests\Rotinas\StoreRotinaRequest;
use App\Http\Requests\Rotinas\UpdateRotinaRequest;
use App\Models\Rotina;
use App\Models\RotinaExecucao;
use App\Services\RotinaPlannerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RotinaController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function index(Request $request, RotinaPlannerService $planner): Response
    {
        $user = Auth::user();
        $today = now()->startOfDay();

        $query = Rotina::ownedBy($user->id)
            ->orderByRaw('COALESCE(ordem, 9999)')
            ->orderBy('nome');

        if ($request->filled('search')) {
            $query->where('nome', 'like', '%'.$request->string('search')->trim().'%');
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->string('categoria'));
        }

        if ($request->filled('frequencia_tipo')) {
            $query->where('frequencia_tipo', $request->string('frequencia_tipo'));
        }

        if ($request->filled('dificuldade')) {
            $query->where('dificuldade', $request->string('dificuldade'));
        }

        if ($request->filled('ativo')) {
            $query->where('ativo', $request->string('ativo') === '1');
        }

        $rotinas = $query->get();
        $execucoes = RotinaExecucao::query()
            ->where('user_id', $user->id)
            ->whereBetween('data', [$today->copy()->subDays(30)->toDateString(), $today->toDateString()])
            ->orderByDesc('data')
            ->get()
            ->groupBy('rotina_id');

        return Inertia::render('Rotinas/Index', [
            'filters' => [
                'search' => $request->string('search')->toString(),
                'categoria' => $request->string('categoria')->toString(),
                'frequencia_tipo' => $request->string('frequencia_tipo')->toString(),
                'dificuldade' => $request->string('dificuldade')->toString(),
                'ativo' => $request->string('ativo')->toString(),
            ],
            'summary' => [
                'total' => $rotinas->count(),
                'ativas' => $rotinas->where('ativo', true)->count(),
                'previstas_hoje' => $rotinas->filter(fn (Rotina $rotina) => $planner->shouldAppearOnDate($rotina, $today))->count(),
                'com_modo_minimo' => $rotinas->where('modo_minimo_ativo', true)->count(),
            ],
            'rotinas' => $rotinas->map(fn (Rotina $rotina) => $this->serializeRotina($rotina, $execucoes->get($rotina->id, collect()), $today, $planner))->values()->all(),
            'options' => $this->options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Rotinas/Form', [
            'mode' => 'create',
            'rotina' => null,
            'options' => $this->options(),
        ]);
    }

    public function store(StoreRotinaRequest $request): RedirectResponse
    {
        Rotina::create($this->payload($request));

        return redirect()
            ->route('rotinas.index')
            ->with('success', 'Rotina criada com sucesso.');
    }

    public function edit(Rotina $rotina): Response
    {
        $this->authorize('update', $rotina);

        return Inertia::render('Rotinas/Form', [
            'mode' => 'edit',
            'rotina' => $this->serializeFormRotina($rotina),
            'options' => $this->options(),
        ]);
    }

    public function update(UpdateRotinaRequest $request, Rotina $rotina): RedirectResponse
    {
        $this->authorize('update', $rotina);
        $rotina->update($this->payload($request, $rotina));

        return redirect()
            ->route('rotinas.index')
            ->with('success', 'Rotina atualizada com sucesso.');
    }

    public function toggle(Rotina $rotina): RedirectResponse
    {
        $this->authorize('update', $rotina);
        $rotina->update(['ativo' => !$rotina->ativo]);

        return back()->with('success', $rotina->ativo ? 'Rotina ativada.' : 'Rotina pausada.');
    }

    public function destroy(Rotina $rotina): RedirectResponse
    {
        $this->authorize('delete', $rotina);
        $rotina->delete();

        return redirect()
            ->route('rotinas.index')
            ->with('success', 'Rotina removida com sucesso.');
    }

    private function payload(StoreRotinaRequest|UpdateRotinaRequest $request, ?Rotina $rotina = null): array
    {
        $userId = $rotina?->user_id ?: Auth::id();
        $ordem = $request->filled('ordem')
            ? $request->integer('ordem')
            : ($rotina?->ordem ?? ((int) Rotina::ownedBy($userId)->max('ordem') + 1));

        return [
            'user_id' => $userId,
            'nome' => $request->string('nome')->trim()->toString(),
            'descricao' => $request->filled('descricao') ? $request->string('descricao')->trim()->toString() : null,
            'categoria' => $request->string('categoria')->toString(),
            'frequencia_tipo' => $request->string('frequencia_tipo')->toString(),
            'dias_semana' => $request->input('frequencia_tipo') === 'dias_semana' ? array_values($request->input('dias_semana', [])) : null,
            'intervalo_dias' => $request->input('frequencia_tipo') === 'intervalo' ? $request->integer('intervalo_dias') : null,
            'data_inicio' => $request->input('data_inicio') ?: ($rotina?->data_inicio?->toDateString() ?: now()->toDateString()),
            'horario' => $request->input('horario') ?: null,
            'dificuldade' => $request->string('dificuldade')->toString(),
            'energia_recomendada' => $request->input('energia_recomendada') ?: null,
            'modo_minimo_ativo' => $request->boolean('modo_minimo_ativo'),
            'modo_minimo_descricao' => $request->boolean('modo_minimo_ativo') ? ($request->input('modo_minimo_descricao') ?: null) : null,
            'cor' => $request->input('cor') ?: null,
            'icone' => $request->input('icone') ?: null,
            'ativo' => $request->boolean('ativo'),
            'ordem' => $ordem,
        ];
    }

    private function serializeRotina(Rotina $rotina, Collection $execucoes, \Carbon\Carbon $today, RotinaPlannerService $planner): array
    {
        $ultimaExecucao = $execucoes->sortByDesc('data')->first();
        $previstas30 = 0;
        $concluidas30 = 0;

        for ($daysBack = 29; $daysBack >= 0; $daysBack--) {
            $date = $today->copy()->subDays($daysBack);

            if (!$planner->shouldAppearOnDate($rotina, $date)) {
                continue;
            }

            $previstas30++;
            $execucao = $execucoes->first(fn (RotinaExecucao $item) => $item->data?->toDateString() === $date->toDateString() && $item->status === 'concluida');
            if ($execucao) {
                $concluidas30++;
            }
        }

        $execucaoHoje = $execucoes->first(fn (RotinaExecucao $item) => $item->data?->toDateString() === $today->toDateString());

        return [
            'id' => $rotina->id,
            'nome' => $rotina->nome,
            'descricao' => $rotina->descricao,
            'categoria' => $rotina->categoria,
            'frequencia_tipo' => $rotina->frequencia_tipo,
            'dias_semana' => $rotina->dias_semana ?? [],
            'intervalo_dias' => $rotina->intervalo_dias,
            'data_inicio' => $rotina->data_inicio?->toDateString(),
            'horario' => $rotina->horario ? substr((string) $rotina->horario, 0, 5) : null,
            'dificuldade' => $rotina->dificuldade,
            'energia_recomendada' => $rotina->energia_recomendada,
            'modo_minimo_ativo' => (bool) $rotina->modo_minimo_ativo,
            'modo_minimo_descricao' => $rotina->modo_minimo_descricao,
            'cor' => $rotina->cor,
            'icone' => $rotina->icone,
            'ativo' => (bool) $rotina->ativo,
            'ordem' => $rotina->ordem,
            'prevista_hoje' => $planner->shouldAppearOnDate($rotina, $today),
            'status_hoje' => $execucaoHoje?->status ?: 'pendente',
            'ultima_execucao_em' => $ultimaExecucao?->data?->format('d/m/Y'),
            'consistencia_30_dias' => $planner->completionRate($previstas30, $concluidas30),
        ];
    }

    private function serializeFormRotina(Rotina $rotina): array
    {
        return [
            'id' => $rotina->id,
            'nome' => $rotina->nome,
            'descricao' => $rotina->descricao,
            'categoria' => $rotina->categoria,
            'frequencia_tipo' => $rotina->frequencia_tipo,
            'dias_semana' => $rotina->dias_semana ?? [],
            'intervalo_dias' => $rotina->intervalo_dias,
            'data_inicio' => $rotina->data_inicio?->toDateString(),
            'horario' => $rotina->horario ? substr((string) $rotina->horario, 0, 5) : '',
            'dificuldade' => $rotina->dificuldade,
            'energia_recomendada' => $rotina->energia_recomendada,
            'modo_minimo_ativo' => (bool) $rotina->modo_minimo_ativo,
            'modo_minimo_descricao' => $rotina->modo_minimo_descricao,
            'cor' => $rotina->cor,
            'icone' => $rotina->icone,
            'ativo' => (bool) $rotina->ativo,
            'ordem' => $rotina->ordem,
        ];
    }

    private function options(): array
    {
        return [
            'categorias' => ['espiritual', 'saude', 'trabalho', 'familia', 'estudos', 'financeiro', 'pessoal', 'outro'],
            'frequencias' => ['diaria', 'dias_semana', 'intervalo'],
            'dificuldades' => ['facil', 'media', 'dificil'],
            'energias' => ['baixa', 'media', 'alta'],
            'diasSemana' => ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
        ];
    }
}
