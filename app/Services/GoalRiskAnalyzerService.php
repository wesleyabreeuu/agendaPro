<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;

class GoalRiskAnalyzerService
{
    public function analyze(User $user): array
    {
        if (!$user->hasModuleAccess('projetos')) {
            return [];
        }

        return Goal::ownedBy($user->id)
            ->whereIn('status', ['planejamento', 'em_andamento'])
            ->with(['progress', 'milestones', 'rotinas'])
            ->get()
            ->map(function (Goal $goal) {
                $current = (float) ($goal->progress->first()?->valor ?? 0);
                $target = (float) ($goal->distancia_meta ?? $goal->valor_meta ?? $goal->peso_meta ?? 0);
                $percent = $target > 0 ? min(100, (int) round(($current / $target) * 100)) : 0;
                $expected = $this->expectedProgress($goal);
                $delay = max(0, $expected - $percent);

                if ($delay < 12 && $percent >= 35) {
                    return null;
                }

                $nextMilestone = $goal->milestones->firstWhere('concluido', false);
                $nextRotina = $goal->rotinas->first();

                return [
                    'id' => $goal->id,
                    'titulo' => $goal->titulo,
                    'progresso_atual' => $current,
                    'meta' => $target,
                    'percentual' => $percent,
                    'atraso_percentual' => $delay,
                    'unidade' => $goal->tipo_meta === 'distancia' ? 'km' : ($goal->tipo_meta === 'financeiro' ? 'R$' : ''),
                    'proxima_acao' => $nextMilestone?->titulo
                        ?? ($nextRotina ? "Executar rotina: {$nextRotina->nome}" : 'Definir a próxima ação concreta'),
                    'url' => "/goals/{$goal->id}",
                ];
            })
            ->filter()
            ->sortByDesc('atraso_percentual')
            ->take(4)
            ->values()
            ->all();
    }

    private function expectedProgress(Goal $goal): int
    {
        if (!$goal->data_inicio || !$goal->data_meta) {
            return 50;
        }

        $start = $goal->data_inicio->copy()->startOfDay();
        $end = $goal->data_meta->copy()->startOfDay();
        $today = today();

        if ($today->lessThanOrEqualTo($start)) {
            return 0;
        }

        $totalDays = max(1, $start->diffInDays($end));
        $elapsed = min($totalDays, $start->diffInDays($today));

        return max(0, min(100, (int) round(($elapsed / $totalDays) * 100)));
    }
}
