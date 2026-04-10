<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habito;
use App\Models\User;
use App\Services\HabitStreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HabitoController extends Controller
{
    public function __construct(private readonly HabitStreakService $streakService)
    {
    }

    public function index(): JsonResponse
    {
        $user = Auth::user();

        $habitos = Habito::ownedBy($user->id)
            ->with(['logs' => fn ($query) => $query->orderByDesc('data')])
            ->orderBy('nome')
            ->get();

        return response()->json([
            'data' => $habitos->map(fn (Habito $habito) => $this->serializeHabito($habito, $user))->values()->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:120',
            'descricao' => 'nullable|string|max:1000',
            'ativo' => 'nullable|boolean',
        ]);

        $habito = Habito::create([
            'user_id' => Auth::id(),
            'nome' => $validated['nome'],
            'descricao' => $validated['descricao'] ?? null,
            'ativo' => $validated['ativo'] ?? true,
        ]);

        $habito->load('logs');

        return response()->json([
            'data' => $this->serializeHabito($habito, Auth::user()),
        ], 201);
    }

    public function show(Habito $habito): JsonResponse
    {
        $this->authorize('view', $habito);
        $habito->load(['logs' => fn ($query) => $query->orderByDesc('data')]);

        return response()->json([
            'data' => $this->serializeHabito($habito, Auth::user()),
        ]);
    }

    public function update(Request $request, Habito $habito): JsonResponse
    {
        $this->authorize('update', $habito);

        $validated = $request->validate([
            'nome' => 'required|string|max:120',
            'descricao' => 'nullable|string|max:1000',
            'ativo' => 'required|boolean',
        ]);

        $habito->update($validated);
        $habito->load(['logs' => fn ($query) => $query->orderByDesc('data')]);

        return response()->json([
            'data' => $this->serializeHabito($habito, Auth::user()),
        ]);
    }

    public function destroy(Habito $habito): JsonResponse
    {
        $this->authorize('delete', $habito);
        $habito->delete();

        return response()->json([
            'message' => 'Habito removido com sucesso.',
        ]);
    }

    public function stats(Habito $habito): JsonResponse
    {
        $this->authorize('view', $habito);
        $habito->load(['logs' => fn ($query) => $query->orderByDesc('data')]);

        return response()->json([
            'data' => $this->serializeStats($habito),
        ]);
    }

    private function serializeHabito(Habito $habito, User $user): array
    {
        $stats = $this->serializeStats($habito);
        $logs = $habito->relationLoaded('logs') ? $habito->logs : $habito->logs()->orderByDesc('data')->get();
        $today = now()->toDateString();

        return [
            'id' => $habito->id,
            'nome' => $habito->nome,
            'descricao' => $habito->descricao,
            'ativo' => (bool) $habito->ativo,
            'concluido_hoje' => $logs->contains(fn ($log) => $log->data?->toDateString() === $today),
            'ultimo_registro_em' => optional($logs->first()?->data)->toDateString(),
            'estatisticas' => $stats,
            'owner' => $user->name,
        ];
    }

    private function serializeStats(Habito $habito): array
    {
        $stats = $this->streakService->forHabit($habito);

        return [
            'streak_atual' => $stats['streak_atual'],
            'maior_streak' => $stats['maior_streak'],
            'total_registros' => $stats['total_registros'],
        ];
    }
}
