<?php

namespace App\Services;

use App\Models\Compromisso;
use App\Models\KanbanTask;
use App\Models\Lembrete;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DashboardService
{
    public function __construct(
        private readonly RotinaAnalyticsService $rotinaAnalyticsService
    ) {
    }

    public function build(User $user, int $periodDays = 7): array
    {
        $periodDays = in_array($periodDays, [7, 15, 30], true) ? $periodDays : 7;

        $canCompromissos = $user->hasModuleAccess('compromissos');
        $canProjetos = $user->hasModuleAccess('projetos');
        $canDiaADia = $user->hasModuleAccess('dia_a_dia');

        $today = now()->startOfDay();
        $tomorrow = $today->copy()->addDay();
        $windowStart = $today->copy()->subDays($periodDays - 1);
        $windowEnd = $today->copy()->endOfDay();
        $previousWindowStart = $windowStart->copy()->subDays($periodDays);
        $previousWindowEnd = $windowEnd->copy()->subDays($periodDays);

        $compromissos = $canCompromissos ? $this->accessibleCompromissos($user)->get() : collect();
        $lembretes = $canCompromissos ? $this->accessibleLembretes($user)->get() : collect();
        $kanbanTasks = $canProjetos ? $this->kanbanTasks($user)->get() : collect();
        $rotinaWidget = $canDiaADia ? $this->rotinaAnalyticsService->buildWidget($user, $periodDays, $today) : null;

        $compromissosHoje = $compromissos
            ->filter(fn (Compromisso $compromisso) => $compromisso->data_inicio?->betweenIncluded($today, $tomorrow->copy()->subSecond()))
            ->sortBy('data_inicio')
            ->values();

        $compromissosProximos = $compromissos
            ->filter(fn (Compromisso $compromisso) => $compromisso->data_inicio && $compromisso->data_inicio->greaterThanOrEqualTo(now()))
            ->sortBy('data_inicio')
            ->take(5)
            ->values();

        $compromissosAtrasados = $compromissos
            ->filter(fn (Compromisso $compromisso) => $compromisso->data_inicio && $compromisso->data_inicio->lessThan(now()))
            ->sortByDesc('data_inicio')
            ->take(5)
            ->values();

        $lembretesAtivos = $lembretes->where('ativo', true)->values();
        $lembretesProximos = $lembretesAtivos
            ->filter(fn (Lembrete $lembrete) => $lembrete->momento_disparo && $lembrete->momento_disparo->greaterThanOrEqualTo(now()))
            ->sortBy(fn (Lembrete $lembrete) => $lembrete->momento_disparo)
            ->take(5)
            ->values();

        $tarefasPendentes = $kanbanTasks
            ->filter(fn (KanbanTask $task) => $task->status !== 'finalizado')
            ->sortBy([['data_limite', 'asc'], ['created_at', 'asc']])
            ->take(8)
            ->values();

        $tarefasConcluidas = $kanbanTasks
            ->filter(fn (KanbanTask $task) => $task->status === 'finalizado')
            ->sortByDesc('finalizado_em')
            ->take(8)
            ->values();

        $tarefasAtrasadas = $kanbanTasks
            ->filter(function (KanbanTask $task) {
                if ($task->status === 'finalizado') {
                    return false;
                }

                return $task->data_limite && Carbon::parse($task->data_limite)->endOfDay()->lessThan(now());
            })
            ->sortBy('data_limite')
            ->values();

        $percentualSemanaAtual = $canProjetos ? $this->completionRateForWindow($kanbanTasks, $windowStart, $windowEnd) : 0;
        $percentualSemanaAnterior = $canProjetos ? $this->completionRateForWindow($kanbanTasks, $previousWindowStart, $previousWindowEnd) : 0;
        $comparacao = $percentualSemanaAtual - $percentualSemanaAnterior;
        $streakAtual = $rotinaWidget['streak_atual'] ?? 0;

        return [
            'compromissos' => [
                'hoje' => [
                    'total' => $compromissosHoje->count(),
                    'items' => $compromissosHoje->map(fn (Compromisso $compromisso) => $this->serializeCompromisso($compromisso, $user))->all(),
                ],
                'proximos' => [
                    'total' => $compromissosProximos->count(),
                    'items' => $compromissosProximos->map(fn (Compromisso $compromisso) => $this->serializeCompromisso($compromisso, $user))->all(),
                ],
                'atrasados' => [
                    'total' => $compromissosAtrasados->count(),
                    'items' => $compromissosAtrasados->map(fn (Compromisso $compromisso) => $this->serializeCompromisso($compromisso, $user))->all(),
                ],
            ],
            'lembretes' => [
                'ativos' => [
                    'total' => $lembretesAtivos->count(),
                ],
                'proximos' => [
                    'total' => $lembretesProximos->count(),
                    'items' => $lembretesProximos->map(fn (Lembrete $lembrete) => $this->serializeLembrete($lembrete))->all(),
                ],
            ],
            'tarefas' => [
                'pendentes' => [
                    'total' => $kanbanTasks->where('status', '!=', 'finalizado')->count(),
                    'items' => $tarefasPendentes->map(fn (KanbanTask $task) => $this->serializeTask($task))->all(),
                ],
                'concluidas' => [
                    'total' => $kanbanTasks->where('status', 'finalizado')->count(),
                    'items' => $tarefasConcluidas->map(fn (KanbanTask $task) => $this->serializeTask($task))->all(),
                ],
                'atrasadas' => [
                    'total' => $tarefasAtrasadas->count(),
                    'items' => $tarefasAtrasadas->take(8)->map(fn (KanbanTask $task) => $this->serializeTask($task))->all(),
                ],
            ],
            'rotina' => [
                'rotinas_do_dia' => $rotinaWidget['rotinas_do_dia'] ?? [
                    'total' => 0,
                    'concluidos' => 0,
                    'pendentes' => 0,
                    'items' => [],
                ],
                'taxa_conclusao_hoje' => $rotinaWidget['taxa_conclusao_hoje'] ?? 0,
                'taxa_semanal' => $rotinaWidget['taxa_semanal'] ?? 0,
                'streak_atual' => $rotinaWidget['streak_atual'] ?? 0,
                'maior_streak' => $rotinaWidget['maior_streak'] ?? 0,
            ],
            'insights' => [
                'periodo_dias' => $periodDays,
                'percentual_tarefas_concluidas_semana' => $percentualSemanaAtual,
                'comparacao_com_semana_anterior' => [
                    'percentual_periodo_anterior' => $percentualSemanaAnterior,
                    'variacao' => $comparacao,
                    'tendencia' => $comparacao > 0 ? 'subiu' : ($comparacao < 0 ? 'caiu' : 'estavel'),
                ],
                'tarefas_atrasadas' => $tarefasAtrasadas->count(),
                'mensagem_automatica' => $this->buildProductivityMessage(
                    $percentualSemanaAtual,
                    $comparacao,
                    $tarefasAtrasadas->count(),
                    $compromissosHoje->count(),
                    $streakAtual
                ),
            ],
            'graficos' => [
                'tarefas_concluidas_por_dia' => $canProjetos
                    ? $this->buildTaskCompletionsSeries($kanbanTasks, $windowStart, $today)
                    : [],
                'tarefas_criadas_vs_concluidas' => $canProjetos
                    ? $this->buildTaskCreationVsCompletionSeries($kanbanTasks, $windowStart, $today)
                    : [],
                'compromissos_por_dia' => $canCompromissos
                    ? $this->buildCompromissosPerDaySeries($compromissos, $windowStart, $today)
                    : [],
                'rotinas_concluidas_por_dia' => $canDiaADia
                    ? ($rotinaWidget['series'] ?? [])
                    : [],
            ],
        ];
    }

    private function accessibleCompromissos(User $user): Builder
    {
        return Compromisso::with(['categoria', 'owner', 'compartilhamentos'])
            ->where(function (Builder $query) use ($user) {
                $query->where('usuarios_id', $user->id)
                    ->orWhereHas('compartilhamentos', fn (Builder $shareQuery) => $shareQuery->where('usuario_id', $user->id));
            });
    }

    private function accessibleLembretes(User $user): Builder
    {
        return Lembrete::with(['compromisso.categoria', 'compromisso.owner', 'compromisso.compartilhamentos'])
            ->where(function (Builder $query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('compromisso.compartilhamentos', fn (Builder $shareQuery) => $shareQuery->where('usuario_id', $user->id));
            });
    }

    private function kanbanTasks(User $user): Builder
    {
        return KanbanTask::query()
            ->with('quadro')
            ->whereHas('quadro', fn (Builder $query) => $query->where('user_id', $user->id));
    }

    private function serializeCompromisso(Compromisso $compromisso, User $user): array
    {
        $permissao = $compromisso->isOwnedBy($user) ? 'owner' : $compromisso->sharedPermissionFor($user);

        return [
            'id' => $compromisso->id,
            'titulo' => $compromisso->titulo,
            'descricao' => $compromisso->descricao,
            'data_inicio' => $compromisso->data_inicio?->toIso8601String(),
            'data_fim' => $compromisso->data_fim?->toIso8601String(),
            'dia_inteiro' => (bool) $compromisso->dia_inteiro,
            'categoria' => $compromisso->categoria?->nome,
            'owner' => $compromisso->owner?->name,
            'permissao' => $permissao,
        ];
    }

    private function serializeLembrete(Lembrete $lembrete): array
    {
        return [
            'id' => $lembrete->id,
            'titulo' => $lembrete->titulo_exibicao,
            'descricao' => $lembrete->descricao_exibicao,
            'momento_disparo' => $lembrete->momento_disparo?->toIso8601String(),
            'origem' => $lembrete->compromisso_id ? 'compromisso' : 'personalizado',
        ];
    }

    private function serializeTask(KanbanTask $task): array
    {
        return [
            'id' => $task->id,
            'titulo' => $task->titulo,
            'status' => $task->status,
            'urgencia' => $task->urgencia,
            'data_limite' => $task->data_limite?->toDateString(),
            'finalizado_em' => $task->finalizado_em?->toIso8601String(),
            'quadro' => $task->quadro?->nome,
        ];
    }

    private function completionRateForWindow(Collection $kanbanTasks, Carbon $start, Carbon $end): int
    {
        $scope = $kanbanTasks->filter(function (KanbanTask $task) use ($start, $end) {
            return $task->created_at && $task->created_at->betweenIncluded($start, $end);
        });

        if ($scope->isEmpty()) {
            return 0;
        }

        $completed = $scope->filter(fn (KanbanTask $task) => $task->status === 'finalizado')->count();

        return (int) round(($completed / max($scope->count(), 1)) * 100);
    }

    private function buildProductivityMessage(int $percentualSemana, int $comparacao, int $tarefasAtrasadas, int $compromissosHoje, int $streakAtual): string
    {
        if ($tarefasAtrasadas >= 5) {
            return 'Sua semana pede limpeza de backlog: priorize as tarefas atrasadas antes de puxar novas demandas.';
        }

        if ($percentualSemana >= 75 && $comparacao >= 0) {
            return 'Seu ritmo esta forte nesta semana. Vale proteger os blocos de foco que estao funcionando.';
        }

        if ($streakAtual >= 5) {
            return 'Sua rotina esta consistente. Aproveite o streak para fechar pelo menos uma entrega importante hoje.';
        }

        if ($compromissosHoje >= 5) {
            return 'Sua agenda esta carregada hoje. Tente reduzir interrupcoes e deixar uma tarefa principal muito clara.';
        }

        if ($comparacao > 0) {
            return 'Voce melhorou em relacao a semana anterior. Mantenha o que destravou sua produtividade.';
        }

        return 'Ha espaco para ganhar tracao. Comece pelas tarefas pequenas pendentes e avance para o item mais importante do dia.';
    }

    private function buildTaskCompletionsSeries(Collection $kanbanTasks, Carbon $start, Carbon $end): array
    {
        return $this->buildDateRange($start, $end)->map(function (Carbon $date) use ($kanbanTasks) {
            return [
                'dia' => $date->translatedFormat('D'),
                'label' => $date->format('d/m'),
                'concluidas' => $kanbanTasks->filter(
                    fn (KanbanTask $task) => $task->finalizado_em && $task->finalizado_em->isSameDay($date)
                )->count(),
            ];
        })->values()->all();
    }

    private function buildTaskCreationVsCompletionSeries(Collection $kanbanTasks, Carbon $start, Carbon $end): array
    {
        return $this->buildDateRange($start, $end)->map(function (Carbon $date) use ($kanbanTasks) {
            return [
                'dia' => $date->translatedFormat('D'),
                'label' => $date->format('d/m'),
                'criadas' => $kanbanTasks->filter(
                    fn (KanbanTask $task) => $task->created_at && $task->created_at->isSameDay($date)
                )->count(),
                'concluidas' => $kanbanTasks->filter(
                    fn (KanbanTask $task) => $task->finalizado_em && $task->finalizado_em->isSameDay($date)
                )->count(),
            ];
        })->values()->all();
    }

    private function buildCompromissosPerDaySeries(Collection $compromissos, Carbon $start, Carbon $end): array
    {
        return $this->buildDateRange($start, $end)->map(function (Carbon $date) use ($compromissos) {
            return [
                'dia' => ucfirst($date->translatedFormat('D')),
                'label' => $date->format('d/m'),
                'total' => $compromissos->filter(
                    fn (Compromisso $compromisso) => $compromisso->data_inicio && $compromisso->data_inicio->isSameDay($date)
                )->count(),
            ];
        })->values()->all();
    }

    private function buildDateRange(Carbon $start, Carbon $end): Collection
    {
        return collect(range(0, $start->diffInDays($end)))->map(
            fn (int $offset) => $start->copy()->addDays($offset)
        );
    }
}
