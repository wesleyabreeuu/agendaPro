<?php

namespace App\Services;

use App\Models\User;

class DailyPlannerService
{
    public function __construct(
        private readonly MeuDiaService $meuDiaService
    ) {
    }

    public function plan(User $user): array
    {
        $timeline = collect($this->meuDiaService->getTimeline($user));
        $prioridades = collect($this->meuDiaService->getPrioridades($user, $timeline->all()));

        $agenda = collect([
            [
                'hora' => '08:00',
                'atividade' => 'Planejamento',
                'descricao' => 'Revisar prioridades, compromissos e pendências antes de executar.',
            ],
        ]);

        $prioridades
            ->whereNull('hora_inicio')
            ->take(2)
            ->values()
            ->each(function (array $item, int $index) use ($agenda) {
                $agenda->push([
                    'hora' => $index === 0 ? '09:00' : '10:30',
                    'atividade' => $item['titulo'],
                    'descricao' => $item['motivo'] ?? 'Prioridade do dia',
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
            ]));

        if ($agenda->count() === 1) {
            $agenda->push([
                'hora' => '09:00',
                'atividade' => 'Definir primeira ação',
                'descricao' => 'Escolher uma tarefa concreta para avançar hoje.',
            ]);
        }

        return [
            'agenda_sugerida' => $agenda
                ->sortBy('hora')
                ->values()
                ->all(),
            'fonte' => 'heuristica',
            'pronto_para_ia' => true,
        ];
    }
}
