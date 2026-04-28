<?php

namespace App\Services;

use App\Models\AtividadeFisica;
use App\Models\Compromisso;
use App\Models\KanbanTask;
use App\Models\Lembrete;
use App\Models\Rotina;
use App\Models\Todo;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class MeuDiaService
{
    public function __construct(
        private readonly RotinaPlannerService $planner
    ) {
    }

    public function getResumoDoDia(User $user): array
    {
        $timeline = collect($this->montarTimeline($user));
        $pendencias = collect($this->montarPendencias($user));

        $total = $timeline->count() + $pendencias->count();
        $concluidos = $timeline->where('status', 'concluido')->count();

        return [
            'total' => $total,
            'concluidos' => $concluidos,
            'percentual' => $total > 0 ? (int) round(($concluidos / $total) * 100) : 0,
            'itens_por_tipo' => [
                'compromissos' => $timeline->where('tipo', 'compromisso')->count(),
                'tarefas' => $timeline->where('tipo', 'tarefa')->count() + $pendencias->where('tipo', 'tarefa')->count(),
                'rotinas' => $timeline->where('tipo', 'rotina')->count() + $pendencias->where('tipo', 'rotina')->count(),
                'lembretes' => $timeline->where('tipo', 'lembrete')->count(),
                'atividades' => $timeline->where('tipo', 'atividade')->count(),
                'kanban' => $pendencias->where('tipo', 'kanban')->count(),
            ],
        ];
    }

    public function montarTimeline(User $user): array
    {
        $timeline = collect()
            ->merge($this->timelineCompromissos($user))
            ->merge($this->timelineTarefas($user))
            ->merge($this->timelineRotinas($user))
            ->merge($this->timelineLembretes($user))
            ->merge($this->timelineAtividades($user));

        return $timeline
            ->sortBy([
                fn (array $item) => $item['hora_inicio'] ?? '99:99',
                fn (array $item) => $item['titulo'],
            ])
            ->values()
            ->all();
    }

    public function montarPendencias(User $user): array
    {
        $rotinasHoje = $this->rotinasDoDia($user);

        $pendencias = collect();

        $tarefasSemHorario = Todo::ownedBy($user->id)
            ->whereDate('data', today())
            ->where(function ($query) {
                $query->whereNull('hora')->orWhere('hora', '');
            })
            ->get();

        foreach ($tarefasSemHorario as $tarefa) {
            $pendencias->push([
                'tipo' => 'tarefa',
                'titulo' => $tarefa->descricao,
                'descricao' => $tarefa->observacao,
                'hora_inicio' => null,
                'hora_fim' => null,
                'status' => $tarefa->status === 'finalizado' ? 'concluido' : 'pendente',
                'origem_id' => $tarefa->id,
                'origem_url' => "/todo/{$tarefa->id}/edit",
                'grupo' => 'tarefas_sem_horario',
                'pode_concluir' => $tarefa->status !== 'finalizado',
                'pode_adiar' => true,
            ]);
        }

        $kanbanHoje = KanbanTask::query()
            ->whereHas('quadro', fn ($query) => $query->where('user_id', $user->id))
            ->whereDate('data_limite', today())
            ->where('status', '!=', 'finalizado')
            ->with('quadro')
            ->orderBy('urgencia')
            ->orderBy('titulo')
            ->get();

        foreach ($kanbanHoje as $task) {
            $pendencias->push([
                'tipo' => 'kanban',
                'titulo' => $task->titulo,
                'descricao' => $task->descricao ?: $task->observacoes,
                'hora_inicio' => null,
                'hora_fim' => null,
                'status' => 'pendente',
                'origem_id' => $task->id,
                'origem_url' => "/kanban/boards/{$task->kanban_board_id}",
                'grupo' => 'kanban_vencendo_hoje',
                'pode_concluir' => true,
                'pode_adiar' => true,
            ]);
        }

        foreach ($rotinasHoje->where('horario', null) as $rotina) {
            if ($rotina['status_bruto'] === 'concluida') {
                continue;
            }

            $pendencias->push([
                'tipo' => 'rotina',
                'titulo' => $rotina['titulo'],
                'descricao' => $rotina['descricao'],
                'hora_inicio' => null,
                'hora_fim' => null,
                'status' => $rotina['status'],
                'origem_id' => $rotina['origem_id'],
                'origem_url' => '/rotinas/hoje',
                'grupo' => 'rotinas_sem_horario',
                'pode_concluir' => $rotina['status'] !== 'concluido',
                'pode_adiar' => false,
            ]);
        }

        return $pendencias->values()->all();
    }

    public function payload(User $user): array
    {
        return [
            'timeline' => $this->montarTimeline($user),
            'pendencias' => $this->montarPendencias($user),
            'resumo' => $this->getResumoDoDia($user),
        ];
    }

    private function timelineCompromissos(User $user): Collection
    {
        $today = today()->toDateString();

        $proprios = Compromisso::query()
            ->where('usuarios_id', $user->id)
            ->whereDate('data_inicio', $today)
            ->get();

        $compartilhados = $user->sharedCompromissos()
            ->whereDate('data_inicio', $today)
            ->get();

        return $proprios
            ->merge($compartilhados)
            ->unique('id')
            ->map(function (Compromisso $compromisso) {
                $inicio = $compromisso->data_inicio;
                $fim = $compromisso->data_fim;
                $concluido = $fim ? $fim->isPast() : false;

                return [
                    'tipo' => 'compromisso',
                    'titulo' => $compromisso->titulo,
                    'descricao' => $compromisso->descricao,
                    'hora_inicio' => $compromisso->dia_inteiro ? '00:00' : $inicio?->format('H:i'),
                    'hora_fim' => $compromisso->dia_inteiro ? null : $fim?->format('H:i'),
                    'status' => $concluido ? 'concluido' : 'pendente',
                    'status_bruto' => $concluido ? 'concluido' : 'pendente',
                    'origem_id' => $compromisso->id,
                    'origem_url' => "/compromissos/{$compromisso->id}/edit",
                    'pode_concluir' => false,
                    'pode_adiar' => false,
                ];
            });
    }

    private function timelineTarefas(User $user): Collection
    {
        return Todo::ownedBy($user->id)
            ->whereDate('data', today())
            ->whereNotNull('hora')
            ->where('hora', '!=', '')
            ->get()
            ->map(fn (Todo $tarefa) => [
                'tipo' => 'tarefa',
                'titulo' => $tarefa->descricao,
                'descricao' => $tarefa->observacao,
                'hora_inicio' => $this->normalizeTime($tarefa->hora),
                'hora_fim' => null,
                'status' => $tarefa->status === 'finalizado' ? 'concluido' : 'pendente',
                'status_bruto' => $tarefa->status,
                'origem_id' => $tarefa->id,
                'origem_url' => "/todo/{$tarefa->id}/edit",
                'pode_concluir' => $tarefa->status !== 'finalizado',
                'pode_adiar' => true,
            ]);
    }

    private function timelineRotinas(User $user): Collection
    {
        return $this->rotinasDoDia($user)->whereNotNull('hora_inicio')->values();
    }

    private function timelineLembretes(User $user): Collection
    {
        return Lembrete::ownedBy($user->id)
            ->with('compromisso')
            ->where('ativo', true)
            ->get()
            ->filter(function (Lembrete $lembrete) {
                $momento = $lembrete->momento_disparo;

                return $momento?->isSameDay(today()) ?? false;
            })
            ->map(function (Lembrete $lembrete) {
                $momento = $lembrete->momento_disparo;
                $executadoHoje = $lembrete->notificado_em?->isSameDay(today()) || $lembrete->ultima_execucao_em?->isSameDay(today());

                return [
                    'tipo' => 'lembrete',
                    'titulo' => $lembrete->titulo_exibicao,
                    'descricao' => $lembrete->descricao_exibicao,
                    'hora_inicio' => $momento?->format('H:i'),
                    'hora_fim' => null,
                    'status' => $executadoHoje ? 'concluido' : 'pendente',
                    'status_bruto' => $executadoHoje ? 'concluido' : 'pendente',
                    'origem_id' => $lembrete->id,
                    'origem_url' => "/lembretes/{$lembrete->id}/edit",
                    'pode_concluir' => !$executadoHoje,
                    'pode_adiar' => true,
                ];
            });
    }

    private function timelineAtividades(User $user): Collection
    {
        return AtividadeFisica::query()
            ->where('user_id', $user->id)
            ->whereDate('data', today())
            ->with('categoria')
            ->get()
            ->map(function (AtividadeFisica $atividade) {
                $inicio = $this->normalizeTime($atividade->hora_inicio);
                $fim = null;

                if ($inicio && $atividade->duracao_minutos) {
                    $fim = Carbon::createFromFormat('H:i', $inicio)->addMinutes((int) $atividade->duracao_minutos)->format('H:i');
                }

                return [
                    'tipo' => 'atividade',
                    'titulo' => $atividade->categoria?->nome ?: 'Atividade física',
                    'descricao' => $atividade->descricao ?: $atividade->notas,
                    'hora_inicio' => $inicio,
                    'hora_fim' => $fim,
                    'status' => 'concluido',
                    'status_bruto' => 'concluido',
                    'origem_id' => $atividade->id,
                    'origem_url' => "/saude/atividades/{$atividade->id}/edit",
                    'pode_concluir' => false,
                    'pode_adiar' => false,
                ];
            });
    }

    private function rotinasDoDia(User $user): Collection
    {
        $today = today();

        $rotinas = Rotina::ownedBy($user->id)
            ->where('ativo', true)
            ->with(['execucoes' => fn ($query) => $query->whereDate('data', $today)])
            ->get()
            ->filter(fn (Rotina $rotina) => $this->planner->shouldAppearOnDate($rotina, $today));

        return $rotinas
            ->map(function (Rotina $rotina) use ($today) {
                $execucao = $this->planner->executionForDate($rotina, $today);
                $statusBruto = $execucao?->status ?? 'pendente';

                return [
                    'tipo' => 'rotina',
                    'titulo' => $rotina->nome,
                    'descricao' => $rotina->descricao,
                    'hora_inicio' => $this->normalizeTime($rotina->horario),
                    'horario' => $this->normalizeTime($rotina->horario),
                    'hora_fim' => null,
                    'status' => $statusBruto === 'concluida' ? 'concluido' : 'pendente',
                    'status_bruto' => $statusBruto,
                    'origem_id' => $rotina->id,
                    'origem_url' => '/rotinas/hoje',
                    'pode_concluir' => $statusBruto !== 'concluida',
                    'pode_adiar' => false,
                ];
            })
            ->sortBy([
                fn (array $item) => $item['hora_inicio'] ?? '99:99',
                fn (array $item) => $item['titulo'],
            ])
            ->values();
    }

    private function normalizeTime(?string $time): ?string
    {
        if (!$time) {
            return null;
        }

        return substr($time, 0, 5);
    }
}
