<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\GoalProgress;
use App\Models\RotinaExecucao;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GoalAnalyticsService
{
    public function indicators(Goal $goal): array
    {
        $progress = $goal->relationLoaded('progress')
            ? $goal->progress
            : $goal->progress()->get();

        $milestones = $goal->relationLoaded('milestones')
            ? $goal->milestones
            : $goal->milestones()->get();

        $today = now()->startOfDay();
        $start = $goal->data_inicio?->copy()->startOfDay() ?: $goal->created_at?->copy()->startOfDay() ?: $today->copy();
        $target = $goal->data_meta?->copy()->startOfDay();
        $daysElapsed = max(0, (int) $start->diffInDays($today, false));
        $daysRemaining = $target ? max(0, (int) $today->diffInDays($target, false)) : null;

        $progressByType = $progress->groupBy('tipo');
        $distanceProgress = $progressByType->get('distancia', collect());
        $weightProgress = $progressByType->get('peso', collect())->sortByDesc('data')->values();
        $currentWeight = $weightProgress->first()?->valor;
        $accumulatedDistance = (float) $distanceProgress->sum(fn (GoalProgress $item) => (float) $item->valor);
        $maxValue = (float) $progress->max(fn (GoalProgress $item) => (float) $item->valor);
        $largestDistance = (float) $distanceProgress->max(fn (GoalProgress $item) => (float) $item->valor);
        $completedMilestones = $milestones->where('concluido', true)->count();
        $milestonePercent = $milestones->count() > 0 ? ($completedMilestones / $milestones->count()) * 100 : 0;
        $metricPercent = $this->metricPercent($goal, $progress);
        $routineIds = $goal->rotinas()->pluck('rotinas.id');
        $completedTrainings = $routineIds->isEmpty()
            ? 0
            : RotinaExecucao::query()
                ->whereIn('rotina_id', $routineIds)
                ->where('user_id', $goal->user_id)
                ->where('status', 'concluida')
                ->count();

        return [
            'percentual_conclusao' => round(max($milestonePercent, $metricPercent), 1),
            'dias_decorridos' => $daysElapsed,
            'dias_restantes' => $daysRemaining,
            'peso_atual' => $currentWeight !== null ? (float) $currentWeight : null,
            'peso_perdido' => $currentWeight !== null && $goal->peso_inicial !== null ? round((float) $goal->peso_inicial - (float) $currentWeight, 2) : null,
            'quilometragem_acumulada' => round($accumulatedDistance, 2),
            'quantidade_registros' => $progress->count(),
            'maior_valor_registrado' => round($maxValue, 2),
            'maior_pedal' => round($largestDistance, 2),
            'treinos_realizados' => $completedTrainings,
            'sequencia_atual_dias' => $this->currentStreak($progress),
            'melhor_sequencia' => $this->bestStreak($progress),
            'proximo_marco' => $milestones->firstWhere('concluido', false)?->only(['id', 'titulo', 'meta_valor']),
        ];
    }

    public function chartData(Goal $goal): array
    {
        $progress = ($goal->relationLoaded('progress') ? $goal->progress : $goal->progress()->get())
            ->sortBy('data')
            ->values();

        return $progress->map(function (GoalProgress $item) {
            return [
                'data' => $item->data?->format('d/m'),
                'tipo' => $item->tipo,
                'valor' => (float) $item->valor,
                'descricao' => $item->descricao,
            ];
        })->all();
    }

    private function metricPercent(Goal $goal, Collection $progress): float
    {
        if ($goal->tipo_meta === 'distancia' && (float) $goal->distancia_meta > 0) {
            return min(100, ($progress->where('tipo', 'distancia')->max(fn ($item) => (float) $item->valor) / (float) $goal->distancia_meta) * 100);
        }

        if ($goal->tipo_meta === 'financeiro' && (float) $goal->valor_meta > 0) {
            return min(100, ($progress->where('tipo', 'financeiro')->sum(fn ($item) => (float) $item->valor) / (float) $goal->valor_meta) * 100);
        }

        if ($goal->tipo_meta === 'peso' && $goal->peso_inicial !== null && $goal->peso_meta !== null) {
            $latestWeight = $progress->where('tipo', 'peso')->sortByDesc('data')->first()?->valor;
            $targetLoss = (float) $goal->peso_inicial - (float) $goal->peso_meta;
            $actualLoss = (float) $goal->peso_inicial - (float) ($latestWeight ?: $goal->peso_inicial);

            return $targetLoss > 0 ? min(100, max(0, ($actualLoss / $targetLoss) * 100)) : 0;
        }

        return 0;
    }

    private function currentStreak(Collection $progress): int
    {
        $dates = $this->progressDates($progress);
        $cursor = Carbon::today();
        $streak = 0;

        while ($dates->contains($cursor->toDateString())) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    private function bestStreak(Collection $progress): int
    {
        $dates = $this->progressDates($progress)->values();
        $best = 0;
        $current = 0;
        $previous = null;

        foreach ($dates as $dateString) {
            $date = Carbon::parse($dateString);
            $current = $previous && $date->diffInDays($previous) === 1 ? $current + 1 : 1;
            $best = max($best, $current);
            $previous = $date;
        }

        return $best;
    }

    private function progressDates(Collection $progress): Collection
    {
        return $progress
            ->pluck('data')
            ->filter()
            ->map(fn ($date) => $date instanceof Carbon ? $date->toDateString() : Carbon::parse($date)->toDateString())
            ->unique()
            ->sort()
            ->values();
    }
}
