<?php

namespace App\Services;

use App\Models\User;

class LifeRadarService
{
    public function analyze(User $user, array $context): array
    {
        $progresso = $context['progresso'] ?? [];
        $objetivos = $context['objetivos'] ?? [];
        $saude = $context['saude'] ?? [];
        $financeiro = $context['financeiro'] ?? [];

        $rotinasTotal = (int) ($progresso['detalhes']['rotinas']['total'] ?? 0);
        $rotinasConcluidas = (int) ($progresso['detalhes']['rotinas']['concluidos'] ?? 0);
        $objetivosItems = collect($objetivos['items'] ?? []);

        $scores = [
            'saude' => $this->clamp(
                ((int) ($saude['atividades_hoje'] ?? 0) > 0 ? 55 : 20)
                + min(25, ((float) ($saude['distancia_km_hoje'] ?? 0)) * 3)
                + min(20, (int) ($saude['rotinas_executadas_hoje'] ?? 0) * 8)
            ),
            'financeiro' => $this->clamp(
                50
                + (((float) ($financeiro['saldo_mes'] ?? 0)) >= 0 ? 20 : -20)
                + min(30, ((float) ($financeiro['economia_acumulada'] ?? 0)) / 100)
            ),
            'objetivos' => $objetivosItems->count() > 0
                ? $this->clamp((int) round($objetivosItems->avg('percentual')))
                : 45,
            'rotinas' => $rotinasTotal > 0
                ? $this->clamp((int) round(($rotinasConcluidas / $rotinasTotal) * 100))
                : 60,
            'produtividade' => $this->clamp((int) ($progresso['percentual'] ?? 0)),
        ];

        return [
            'score_geral' => $this->clamp((int) round(array_sum($scores) / max(1, count($scores)))),
            'indicadores' => [
                ['nome' => 'Saúde', 'valor' => $scores['saude']],
                ['nome' => 'Financeiro', 'valor' => $scores['financeiro']],
                ['nome' => 'Objetivos', 'valor' => $scores['objetivos']],
                ['nome' => 'Rotinas', 'valor' => $scores['rotinas']],
                ['nome' => 'Produtividade', 'valor' => $scores['produtividade']],
            ],
        ];
    }

    private function clamp(float|int $value): int
    {
        return max(0, min(100, (int) round($value)));
    }
}
