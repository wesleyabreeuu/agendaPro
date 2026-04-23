<?php

namespace App\Services;

use App\Models\Rotina;
use App\Models\RotinaExecucao;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RotinaAnalyticsService
{
    public function __construct(
        private readonly RotinaPlannerService $planner
    ) {
    }

    public function buildModuleDashboard(User $user, ?Carbon $today = null): array
    {
        $today = ($today ?: now())->startOfDay();
        $activeRotinas = $this->activeRoutines($user);
        $execucoes = $this->executionsWindow($user, $today->copy()->subDays(365), $today);

        $overview = $this->dailyOverview($activeRotinas, $execucoes, $today);
        $streak = $this->streakStats($activeRotinas, $execucoes, $today);
        $weeklyRate = $this->rangeCompletionRate($activeRotinas, $execucoes, $today->copy()->subDays(6), $today);
        $monthlyRate = $this->rangeCompletionRate($activeRotinas, $execucoes, $today->copy()->subDays(29), $today);

        return [
            'summary' => [
                'ativas' => $activeRotinas->count(),
                'concluidas_hoje' => $overview['concluidas'],
                'pendentes_hoje' => $overview['pendentes'],
                'puladas_hoje' => $overview['puladas'],
                'modo_minimo_hoje' => $overview['modo_minimo'],
                'taxa_conclusao_hoje' => $overview['taxa_conclusao'],
                'taxa_semanal' => $weeklyRate,
                'taxa_mensal' => $monthlyRate,
                'streak_atual' => $streak['atual'],
                'maior_streak' => $streak['maior'],
            ],
            'today' => $overview,
            'recentProgress' => $this->recentProgress($activeRotinas, $execucoes, $today, 7),
            'categoryBreakdown' => $this->categoryBreakdown($activeRotinas, $overview['items']),
        ];
    }

    public function buildWidget(User $user, int $periodDays = 7, ?Carbon $today = null): array
    {
        $today = ($today ?: now())->startOfDay();
        $activeRotinas = $this->activeRoutines($user);
        $execucoes = $this->executionsWindow($user, $today->copy()->subDays(max($periodDays, 365)), $today);

        $overview = $this->dailyOverview($activeRotinas, $execucoes, $today);
        $streak = $this->streakStats($activeRotinas, $execucoes, $today);

        return [
            'rotinas_do_dia' => [
                'total' => $overview['total_previstas'],
                'concluidos' => $overview['concluidas'],
                'pendentes' => $overview['pendentes'],
                'items' => collect($overview['items'])->take(6)->values()->all(),
            ],
            'taxa_conclusao_hoje' => $overview['taxa_conclusao'],
            'taxa_semanal' => $this->rangeCompletionRate($activeRotinas, $execucoes, $today->copy()->subDays(6), $today),
            'streak_atual' => $streak['atual'],
            'maior_streak' => $streak['maior'],
            'series' => $this->completionSeries($activeRotinas, $execucoes, $today, $periodDays),
        ];
    }

    public function dailyOverview(Collection $rotinas, Collection $execucoes, Carbon $date): array
    {
        $dueRotinas = $rotinas
            ->filter(fn (Rotina $rotina) => $this->planner->shouldAppearOnDate($rotina, $date))
            ->sortBy([
                fn (Rotina $rotina) => $rotina->horario ?? '99:99',
                fn (Rotina $rotina) => $rotina->ordem ?? 9999,
                fn (Rotina $rotina) => mb_strtolower($rotina->nome),
            ])
            ->values();

        $executionsForDate = $execucoes
            ->filter(fn (RotinaExecucao $execucao) => $execucao->data?->toDateString() === $date->toDateString())
            ->keyBy('rotina_id');

        $items = $dueRotinas->map(function (Rotina $rotina) use ($executionsForDate) {
            /** @var RotinaExecucao|null $execucao */
            $execucao = $executionsForDate->get($rotina->id);
            $status = $execucao?->status ?: 'pendente';
            $modoUsado = $execucao?->modo_usado ?: 'normal';

            return [
                'id' => $rotina->id,
                'nome' => $rotina->nome,
                'descricao' => $rotina->descricao,
                'categoria' => $rotina->categoria,
                'frequencia_tipo' => $rotina->frequencia_tipo,
                'dificuldade' => $rotina->dificuldade,
                'energia_recomendada' => $rotina->energia_recomendada,
                'horario' => $rotina->horario ? substr((string) $rotina->horario, 0, 5) : null,
                'modo_minimo_ativo' => (bool) $rotina->modo_minimo_ativo,
                'modo_minimo_descricao' => $rotina->modo_minimo_descricao,
                'cor' => $rotina->cor,
                'icone' => $rotina->icone,
                'status' => $status,
                'modo_usado' => $modoUsado,
                'observacao' => $execucao?->observacao,
            ];
        })->values();

        $concluidas = $items->where('status', 'concluida')->count();
        $modoMinimo = $items->filter(fn (array $item) => $item['status'] === 'concluida' && $item['modo_usado'] === 'minimo')->count();
        $puladas = $items->where('status', 'pulada')->count();
        $pendentes = $items->where('status', 'pendente')->count();
        $taxaConclusao = $this->planner->completionRate($items->count(), $concluidas);

        return [
            'data' => $date->toDateString(),
            'data_formatada' => $date->format('d/m/Y'),
            'total_previstas' => $items->count(),
            'concluidas' => $concluidas,
            'modo_minimo' => $modoMinimo,
            'puladas' => $puladas,
            'pendentes' => $pendentes,
            'taxa_conclusao' => $taxaConclusao,
            'cumpriu_meta_dia' => $items->count() > 0 && $taxaConclusao >= 60,
            'items' => $items->all(),
        ];
    }

    public function streakStats(Collection $rotinas, Collection $execucoes, Carbon $today): array
    {
        $eligibleDays = collect();

        for ($daysBack = 0; $daysBack < 365; $daysBack++) {
            $date = $today->copy()->subDays($daysBack);
            $overview = $this->dailyOverview($rotinas, $execucoes, $date);

            if ($overview['total_previstas'] === 0) {
                continue;
            }

            $eligibleDays->push([
                'date' => $date->toDateString(),
                'fulfilled' => $overview['cumpriu_meta_dia'],
            ]);
        }

        $current = 0;
        foreach ($eligibleDays as $day) {
            if (!$day['fulfilled']) {
                break;
            }

            $current++;
        }

        $highest = 0;
        $running = 0;
        foreach ($eligibleDays->reverse()->values() as $day) {
            if ($day['fulfilled']) {
                $running++;
                $highest = max($highest, $running);
            } else {
                $running = 0;
            }
        }

        return [
            'atual' => $current,
            'maior' => $highest,
        ];
    }

    public function completionSeries(Collection $rotinas, Collection $execucoes, Carbon $today, int $periodDays): array
    {
        return collect(range($periodDays - 1, 0))
            ->map(function (int $daysBack) use ($rotinas, $execucoes, $today) {
                $date = $today->copy()->subDays($daysBack);
                $overview = $this->dailyOverview($rotinas, $execucoes, $date);

                return [
                    'label' => $date->format('d/m'),
                    'concluidas' => $overview['concluidas'],
                    'previstas' => $overview['total_previstas'],
                    'taxa' => $overview['taxa_conclusao'],
                ];
            })
            ->values()
            ->all();
    }

    private function activeRoutines(User $user): Collection
    {
        return Rotina::ownedBy($user->id)
            ->where('ativo', true)
            ->orderByRaw('COALESCE(ordem, 9999)')
            ->orderBy('nome')
            ->get();
    }

    private function executionsWindow(User $user, Carbon $start, Carbon $end): Collection
    {
        return RotinaExecucao::query()
            ->where('user_id', $user->id)
            ->whereBetween('data', [$start->toDateString(), $end->toDateString()])
            ->get();
    }

    private function rangeCompletionRate(Collection $rotinas, Collection $execucoes, Carbon $start, Carbon $end): float
    {
        $totalPlanned = 0;
        $totalCompleted = 0;

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $overview = $this->dailyOverview($rotinas, $execucoes, $date);
            $totalPlanned += $overview['total_previstas'];
            $totalCompleted += $overview['concluidas'];
        }

        return $this->planner->completionRate($totalPlanned, $totalCompleted);
    }

    private function recentProgress(Collection $rotinas, Collection $execucoes, Carbon $today, int $days): array
    {
        return collect(range($days - 1, 0))
            ->map(function (int $daysBack) use ($rotinas, $execucoes, $today) {
                $date = $today->copy()->subDays($daysBack);
                $overview = $this->dailyOverview($rotinas, $execucoes, $date);

                return [
                    'data' => $date->toDateString(),
                    'label' => $date->format('d/m'),
                    'previstas' => $overview['total_previstas'],
                    'concluidas' => $overview['concluidas'],
                    'puladas' => $overview['puladas'],
                    'taxa' => $overview['taxa_conclusao'],
                    'cumpriu_meta_dia' => $overview['cumpriu_meta_dia'],
                ];
            })
            ->values()
            ->all();
    }

    private function categoryBreakdown(Collection $activeRotinas, array $todayItems): array
    {
        $items = collect($todayItems);

        return $activeRotinas
            ->groupBy('categoria')
            ->map(function (Collection $rotinas, string $categoria) use ($items) {
                $todayCategory = $items->where('categoria', $categoria);

                return [
                    'categoria' => $categoria,
                    'ativas' => $rotinas->count(),
                    'previstas_hoje' => $todayCategory->count(),
                    'concluidas_hoje' => $todayCategory->where('status', 'concluida')->count(),
                ];
            })
            ->sortByDesc('ativas')
            ->values()
            ->all();
    }
}
