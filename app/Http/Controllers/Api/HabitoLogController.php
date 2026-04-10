<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habito;
use App\Models\HabitoLog;
use App\Services\HabitStreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class HabitoLogController extends Controller
{
    public function __construct(private readonly HabitStreakService $streakService)
    {
    }

    public function store(Habito $habito): JsonResponse
    {
        $this->authorize('markComplete', $habito);

        $today = now()->toDateString();

        $log = HabitoLog::firstOrCreate(
            [
                'habito_id' => $habito->id,
                'data' => $today,
            ],
            [
                'concluido_em' => now(),
            ]
        );

        $habito->load(['logs' => fn ($query) => $query->orderByDesc('data')]);
        $stats = $this->streakService->forHabit($habito);

        return response()->json([
            'data' => [
                'id' => $habito->id,
                'nome' => $habito->nome,
                'descricao' => $habito->descricao,
                'ativo' => (bool) $habito->ativo,
                'concluido_hoje' => true,
                'ultimo_registro_em' => $today,
                'estatisticas' => $stats,
                'owner' => Auth::user()->name,
            ],
            'meta' => [
                'duplicado' => !$log->wasRecentlyCreated,
            ],
        ], $log->wasRecentlyCreated ? 201 : 200);
    }
}
