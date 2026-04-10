<?php

namespace App\Http\Controllers;

use App\Models\Habito;
use App\Models\HabitoLog;
use App\Services\HabitStreakService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DailyCheckinController extends Controller
{
    public function __construct(private readonly HabitStreakService $streakService)
    {
    }

    public function index(): Response
    {
        $user = Auth::user();
        $today = now()->toDateString();

        $habitos = Habito::ownedBy($user->id)
            ->with(['logs' => fn ($query) => $query->orderByDesc('data')])
            ->orderBy('nome')
            ->get();

        $recentLogs = HabitoLog::query()
            ->whereHas('habito', fn ($query) => $query->where('user_id', $user->id))
            ->with('habito')
            ->orderByDesc('data')
            ->limit(14)
            ->get();

        $serializedHabits = $habitos->map(function (Habito $habito) use ($today) {
            $stats = $this->streakService->forHabit($habito);

            return [
                'id' => $habito->id,
                'nome' => $habito->nome,
                'descricao' => $habito->descricao,
                'ativo' => (bool) $habito->ativo,
                'concluido_hoje' => $habito->logs->contains(fn ($log) => $log->data?->toDateString() === $today),
                'ultimo_registro_em' => optional($habito->logs->first()?->data)->toDateString(),
                'estatisticas' => $stats,
            ];
        })->values();

        return Inertia::render('Checkins/Index', [
            'today' => $today,
            'habitos' => $serializedHabits->all(),
            'resumo' => [
                'total_habitos' => $serializedHabits->count(),
                'concluidos_hoje' => $serializedHabits->where('concluido_hoje', true)->count(),
                'melhor_streak_atual' => (int) $serializedHabits->max('estatisticas.streak_atual'),
            ],
            'historico' => $recentLogs->map(fn (HabitoLog $log) => [
                'id' => $log->id,
                'habito' => $log->habito?->nome,
                'data' => $log->data?->format('d/m/Y'),
                'concluido_em' => $log->concluido_em?->format('H:i'),
            ])->values()->all(),
        ]);
    }
}
