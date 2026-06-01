<?php

namespace App\Http\Controllers;

use App\Http\Requests\Goals\StoreGoalProgressRequest;
use App\Http\Requests\Goals\StoreGoalRequest;
use App\Http\Requests\Goals\UpdateGoalMilestoneRequest;
use App\Http\Requests\Goals\UpdateGoalRequest;
use App\Models\Goal;
use App\Models\GoalMilestone;
use App\Models\Rotina;
use App\Services\GoalAnalyticsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-projetos']);
    }

    public function index(Request $request, GoalAnalyticsService $analytics): Response
    {
        $query = Goal::ownedBy(Auth::id())
            ->with(['milestones', 'progress'])
            ->orderByRaw("CASE status WHEN 'em_andamento' THEN 1 WHEN 'planejamento' THEN 2 WHEN 'pausado' THEN 3 WHEN 'concluido' THEN 4 WHEN 'cancelado' THEN 5 ELSE 6 END")
            ->orderBy('data_meta');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(function ($inner) use ($search) {
                $inner->where('titulo', 'like', "%{$search}%")
                    ->orWhere('descricao', 'like', "%{$search}%")
                    ->orWhere('categoria', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('tipo_meta')) {
            $query->where('tipo_meta', $request->string('tipo_meta')->toString());
        }

        $goals = $query->get();

        return Inertia::render('Goals/Index', [
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
                'tipo_meta' => $request->string('tipo_meta')->toString(),
            ],
            'summary' => [
                'total' => $goals->count(),
                'em_andamento' => $goals->where('status', 'em_andamento')->count(),
                'concluidos' => $goals->where('status', 'concluido')->count(),
                'com_rotinas' => $goals->filter(fn (Goal $goal) => $goal->rotinas()->exists())->count(),
            ],
            'goals' => $goals->map(fn (Goal $goal) => $this->serializeGoalCard($goal, $analytics))->values()->all(),
            'options' => $this->options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Goals/Form', [
            'mode' => 'create',
            'goal' => null,
            'rotinas' => $this->rotinaOptions(),
            'options' => $this->options(),
        ]);
    }

    public function store(StoreGoalRequest $request): RedirectResponse
    {
        $goal = DB::transaction(function () use ($request) {
            $goal = Goal::create($this->payload($request));
            $this->syncRelations($goal, $request);

            return $goal;
        });

        return redirect()->route('goals.show', $goal)->with('success', 'Objetivo criado com sucesso.');
    }

    public function show(Goal $goal, GoalAnalyticsService $analytics): Response
    {
        $this->authorize('view', $goal);
        $goal->load(['milestones', 'progress', 'rotinas']);

        return Inertia::render('Goals/Show', [
            'goal' => $this->serializeGoalDetail($goal, $analytics),
            'options' => $this->options(),
        ]);
    }

    public function edit(Goal $goal): Response
    {
        $this->authorize('update', $goal);
        $goal->load(['milestones', 'rotinas']);

        return Inertia::render('Goals/Form', [
            'mode' => 'edit',
            'goal' => $this->serializeGoalForm($goal),
            'rotinas' => $this->rotinaOptions(),
            'options' => $this->options(),
        ]);
    }

    public function update(UpdateGoalRequest $request, Goal $goal): RedirectResponse
    {
        $this->authorize('update', $goal);

        DB::transaction(function () use ($request, $goal) {
            $goal->update($this->payload($request, $goal));
            $this->syncRelations($goal, $request);
        });

        return redirect()->route('goals.show', $goal)->with('success', 'Objetivo atualizado com sucesso.');
    }

    public function destroy(Goal $goal): RedirectResponse
    {
        $this->authorize('delete', $goal);
        $goal->delete();

        return redirect()->route('goals.index')->with('success', 'Objetivo removido com sucesso.');
    }

    public function storeProgress(StoreGoalProgressRequest $request, Goal $goal): RedirectResponse
    {
        $this->authorize('update', $goal);
        $goal->progress()->create($request->validated());

        return back()->with('success', 'Progresso registrado.');
    }

    public function updateMilestone(UpdateGoalMilestoneRequest $request, Goal $goal, GoalMilestone $milestone): RedirectResponse
    {
        $this->authorize('update', $goal);
        abort_unless($milestone->goal_id === $goal->id, 404);

        $completed = $request->boolean('concluido');
        $milestone->update([
            'concluido' => $completed,
            'concluido_em' => $completed ? now() : null,
        ]);

        return back()->with('success', $completed ? 'Marco concluído.' : 'Marco reaberto.');
    }

    private function payload(StoreGoalRequest|UpdateGoalRequest $request, ?Goal $goal = null): array
    {
        return [
            'user_id' => $goal?->user_id ?: Auth::id(),
            'titulo' => $request->string('titulo')->trim()->toString(),
            'descricao' => $request->filled('descricao') ? $request->string('descricao')->trim()->toString() : null,
            'categoria' => $request->input('categoria') ?: null,
            'data_inicio' => $request->input('data_inicio') ?: null,
            'data_meta' => $request->input('data_meta') ?: null,
            'status' => $request->string('status')->toString(),
            'cor' => $request->input('cor') ?: null,
            'icone' => $request->input('icone') ?: null,
            'peso_inicial' => $request->input('peso_inicial') ?: null,
            'peso_meta' => $request->input('peso_meta') ?: null,
            'distancia_meta' => $request->input('distancia_meta') ?: null,
            'valor_meta' => $request->input('valor_meta') ?: null,
            'tipo_meta' => $request->string('tipo_meta')->toString(),
        ];
    }

    private function syncRelations(Goal $goal, StoreGoalRequest|UpdateGoalRequest $request): void
    {
        $allowedRotinaIds = Rotina::ownedBy(Auth::id())
            ->whereIn('id', $request->input('rotina_ids', []))
            ->pluck('id')
            ->all();

        $goal->rotinas()->sync($allowedRotinaIds);

        if (!$request->has('milestones')) {
            return;
        }

        $goal->milestones()->delete();

        foreach ((array) $request->input('milestones', []) as $index => $item) {
            if (blank($item['titulo'] ?? null)) {
                continue;
            }

            $completed = filter_var($item['concluido'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $goal->milestones()->create([
                'titulo' => $item['titulo'],
                'descricao' => $item['descricao'] ?? null,
                'ordem' => $item['ordem'] ?? ($index + 1),
                'meta_valor' => $item['meta_valor'] ?? null,
                'concluido' => $completed,
                'concluido_em' => $completed ? now() : null,
            ]);
        }
    }

    private function serializeGoalCard(Goal $goal, GoalAnalyticsService $analytics): array
    {
        $indicators = $analytics->indicators($goal);

        return [
            'id' => $goal->id,
            'titulo' => $goal->titulo,
            'descricao' => $goal->descricao,
            'categoria' => $goal->categoria,
            'status' => $goal->status,
            'tipo_meta' => $goal->tipo_meta,
            'cor' => $goal->cor,
            'icone' => $goal->icone,
            'data_inicio' => $goal->data_inicio?->format('d/m/Y'),
            'data_meta' => $goal->data_meta?->format('d/m/Y'),
            'percentual_conclusao' => $indicators['percentual_conclusao'],
            'dias_restantes' => $indicators['dias_restantes'],
            'proximo_marco' => $indicators['proximo_marco'],
            'registros' => $indicators['quantidade_registros'],
        ];
    }

    private function serializeGoalDetail(Goal $goal, GoalAnalyticsService $analytics): array
    {
        return [
            ...$this->serializeGoalCard($goal, $analytics),
            'peso_inicial' => $goal->peso_inicial !== null ? (float) $goal->peso_inicial : null,
            'peso_meta' => $goal->peso_meta !== null ? (float) $goal->peso_meta : null,
            'distancia_meta' => $goal->distancia_meta !== null ? (float) $goal->distancia_meta : null,
            'valor_meta' => $goal->valor_meta !== null ? (float) $goal->valor_meta : null,
            'indicadores' => $analytics->indicators($goal),
            'chartData' => $analytics->chartData($goal),
            'milestones' => $goal->milestones->map(fn (GoalMilestone $item) => [
                'id' => $item->id,
                'titulo' => $item->titulo,
                'descricao' => $item->descricao,
                'ordem' => $item->ordem,
                'meta_valor' => $item->meta_valor !== null ? (float) $item->meta_valor : null,
                'concluido' => (bool) $item->concluido,
                'concluido_em' => $item->concluido_em?->format('d/m/Y'),
            ])->values()->all(),
            'progress' => $goal->progress->map(fn ($item) => [
                'id' => $item->id,
                'data' => $item->data?->format('d/m/Y'),
                'data_input' => $item->data?->toDateString(),
                'descricao' => $item->descricao,
                'valor' => $item->valor !== null ? (float) $item->valor : null,
                'tipo' => $item->tipo,
                'observacoes' => $item->observacoes,
            ])->values()->all(),
            'rotinas' => $goal->rotinas->map(fn (Rotina $rotina) => [
                'id' => $rotina->id,
                'nome' => $rotina->nome,
                'categoria' => $rotina->categoria,
            ])->values()->all(),
        ];
    }

    private function serializeGoalForm(Goal $goal): array
    {
        return [
            'id' => $goal->id,
            'titulo' => $goal->titulo,
            'descricao' => $goal->descricao,
            'categoria' => $goal->categoria,
            'data_inicio' => $goal->data_inicio?->toDateString(),
            'data_meta' => $goal->data_meta?->toDateString(),
            'status' => $goal->status,
            'cor' => $goal->cor,
            'icone' => $goal->icone,
            'peso_inicial' => $goal->peso_inicial !== null ? (float) $goal->peso_inicial : '',
            'peso_meta' => $goal->peso_meta !== null ? (float) $goal->peso_meta : '',
            'distancia_meta' => $goal->distancia_meta !== null ? (float) $goal->distancia_meta : '',
            'valor_meta' => $goal->valor_meta !== null ? (float) $goal->valor_meta : '',
            'tipo_meta' => $goal->tipo_meta,
            'rotina_ids' => $goal->rotinas->pluck('id')->all(),
            'milestones' => $goal->milestones->map(fn (GoalMilestone $item) => [
                'titulo' => $item->titulo,
                'descricao' => $item->descricao,
                'ordem' => $item->ordem,
                'meta_valor' => $item->meta_valor !== null ? (float) $item->meta_valor : '',
                'concluido' => (bool) $item->concluido,
            ])->values()->all(),
        ];
    }

    private function rotinaOptions(): array
    {
        return Rotina::ownedBy(Auth::id())
            ->orderBy('nome')
            ->get(['id', 'nome', 'categoria'])
            ->map(fn (Rotina $rotina) => [
                'id' => $rotina->id,
                'nome' => $rotina->nome,
                'categoria' => $rotina->categoria,
            ])
            ->all();
    }

    private function options(): array
    {
        return [
            'statuses' => Goal::STATUSES,
            'types' => Goal::GOAL_TYPES,
            'progressTypes' => ['distancia', 'peso', 'financeiro', 'estudo', 'treino', 'personalizado'],
        ];
    }
}
