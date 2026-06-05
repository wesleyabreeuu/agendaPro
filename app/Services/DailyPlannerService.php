<?php

namespace App\Services;

use App\Models\DailyCheckin;
use App\Models\Lembrete;
use App\Models\Todo;
use App\Models\User;
use Carbon\Carbon;

class DailyPlannerService
{
    public function __construct(
        private readonly MeuDiaService $meuDiaService
    ) {
    }

    public function plan(User $user): array
    {
        $timeline = collect($this->meuDiaService->getTimeline($user));
        $pendencias = $this->meuDiaService->montarPendencias($user);
        $prioridades = collect($this->meuDiaService->getPrioridades($user, $timeline->all(), $pendencias));
        $nextBestAction = $this->meuDiaService->getNextBestAction($user, [
            'timeline' => $timeline->all(),
            'pendencias' => $pendencias,
            'objetivos' => $this->meuDiaService->getObjetivos($user),
        ]);
        $freeTime = $this->meuDiaService->getFreeTimeBlocks($user, $timeline->all());
        $checkin = DailyCheckin::ownedBy($user->id)->whereDate('data', today())->first();
        $energy = (int) ($checkin?->energia ?? 4);
        $priorityLimit = $energy <= 2 ? 2 : 4;

        $agenda = collect([
            [
                'hora' => '08:00',
                'atividade' => 'Planejamento',
                'descricao' => 'Revisar prioridades, compromissos e pendências antes de executar.',
                'impacto' => 'Clareza',
                'duracao_minutos' => 20,
            ],
            [
                'hora' => '08:30',
                'atividade' => $nextBestAction['titulo'],
                'descricao' => $nextBestAction['motivo'],
                'impacto' => $nextBestAction['impacto'],
                'duracao_minutos' => $this->estimatedMinutes($nextBestAction['tempo_estimado'] ?? null),
            ],
        ]);

        $prioridades
            ->whereNull('hora_inicio')
            ->take($priorityLimit)
            ->values()
            ->each(function (array $item, int $index) use ($agenda) {
                $slots = ['09:30', '10:30', '13:30', '15:00'];

                $agenda->push([
                    'hora' => $slots[$index] ?? '16:00',
                    'atividade' => $item['titulo'],
                    'descricao' => $item['motivo'] ?? 'Prioridade do dia',
                    'impacto' => ucfirst($item['tipo'] ?? 'Produtividade'),
                    'duracao_minutos' => 30,
                ]);
            });

        $timeline
            ->filter(fn (array $item) => filled($item['hora_inicio'] ?? null))
            ->where('status', '!=', 'concluido')
            ->take(5)
            ->each(fn (array $item) => $agenda->push([
                'hora' => $item['hora_inicio'],
                'atividade' => $item['titulo'],
                'descricao' => $item['descricao'] ?: ucfirst($item['tipo']),
                'impacto' => ucfirst($item['tipo']),
                'duracao_minutos' => filled($item['hora_fim'] ?? null)
                    ? $this->durationBetween($item['hora_inicio'], $item['hora_fim'])
                    : 45,
            ]));

        if ($agenda->count() === 1) {
            $agenda->push([
                'hora' => '09:00',
                'atividade' => 'Definir primeira ação',
                'descricao' => 'Escolher uma tarefa concreta para avançar hoje.',
                'impacto' => 'Clareza',
                'duracao_minutos' => 20,
            ]);
        }

        $agenda = $agenda
            ->unique(fn (array $item) => $item['hora'] . '-' . $item['atividade'])
            ->sortBy('hora')
            ->values();

        return [
            'titulo' => 'Plano recomendado para hoje',
            'agenda_sugerida' => $agenda->all(),
            'tempo_estimado_total_minutos' => (int) $agenda->sum('duracao_minutos'),
            'tempo_estimado_total' => $this->formatMinutes((int) $agenda->sum('duracao_minutos')),
            'quantidade_tarefas' => $agenda->count(),
            'impacto_objetivos' => $agenda->pluck('impacto')->filter()->unique()->values()->all(),
            'tempo_disponivel' => $freeTime,
            'fonte' => 'heuristica',
            'pronto_para_ia' => true,
        ];
    }

    public function apply(User $user, ?array $plan = null): array
    {
        $plan ??= $this->plan($user);
        $createdTasks = 0;
        $createdReminders = 0;

        foreach (($plan['agenda_sugerida'] ?? []) as $item) {
            $hora = $item['hora'] ?? null;
            $atividade = $item['atividade'] ?? null;

            if (!$hora || !$atividade) {
                continue;
            }

            Todo::create([
                'user_id' => $user->id,
                'data' => today()->toDateString(),
                'hora' => $hora,
                'descricao' => $atividade,
                'observacao' => 'Criado pelo planejamento do Meu Dia. ' . ($item['descricao'] ?? ''),
                'urgencia' => 'media',
                'status' => 'aguardando',
            ]);
            $createdTasks++;

            Lembrete::create([
                'user_id' => $user->id,
                'compromisso_id' => null,
                'tipo' => 'planejamento',
                'titulo' => $atividade,
                'descricao' => $item['descricao'] ?? null,
                'categoria' => 'Meu Dia',
                'inicio_em' => Carbon::parse(today()->toDateString() . ' ' . $hora),
                'proxima_execucao_em' => Carbon::parse(today()->toDateString() . ' ' . $hora),
                'ativo' => true,
                'minutos_antes' => 0,
            ]);
            $createdReminders++;
        }

        return [
            'ok' => true,
            'tarefas_criadas' => $createdTasks,
            'lembretes_criados' => $createdReminders,
            'planejamento' => $plan,
        ];
    }

    private function durationBetween(string $start, string $end): int
    {
        [$startHour, $startMinute] = array_map('intval', explode(':', substr($start, 0, 5)));
        [$endHour, $endMinute] = array_map('intval', explode(':', substr($end, 0, 5)));

        return max(15, (($endHour * 60) + $endMinute) - (($startHour * 60) + $startMinute));
    }

    private function estimatedMinutes(?string $estimate): int
    {
        if (!$estimate) {
            return 30;
        }

        preg_match('/(\d+)/', $estimate, $matches);

        return isset($matches[1]) ? max(10, (int) $matches[1]) : 30;
    }

    private function formatMinutes(int $minutes): string
    {
        $hours = intdiv($minutes, 60);
        $remaining = $minutes % 60;

        if ($hours <= 0) {
            return "{$remaining}min";
        }

        if ($remaining === 0) {
            return "{$hours}h";
        }

        return "{$hours}h {$remaining}min";
    }
}
