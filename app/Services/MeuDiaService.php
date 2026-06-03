<?php

namespace App\Services;

use App\Models\AtividadeFisica;
use App\Models\ContaBancaria;
use App\Models\Compromisso;
use App\Models\Goal;
use App\Models\KanbanTask;
use App\Models\Lembrete;
use App\Models\MetaEconomia;
use App\Models\MetaSaude;
use App\Models\Rotina;
use App\Models\Todo;
use App\Models\TransacaoFinanceira;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class MeuDiaService
{
    public function __construct(
        private readonly RotinaPlannerService $planner
    ) {
    }

    public function getResumoDia(User $user): array
    {
        $timeline = collect($this->montarTimeline($user));
        $pendencias = collect($this->montarPendencias($user));
        $rotinasHoje = $this->rotinasDoDia($user);
        $objetivos = $this->getObjetivos($user);
        $saude = $this->getSaude($user);
        $financeiro = $this->getFinanceiro($user);

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
                'objetivos' => $objetivos['total_ativos'],
                'financeiro_saldo_mes' => $financeiro['saldo_mes'],
            ],
            'cards' => [
                'compromissos' => $timeline->where('tipo', 'compromisso')->count(),
                'tarefas' => $timeline->where('tipo', 'tarefa')->where('status', '!=', 'concluido')->count()
                    + $pendencias->where('tipo', 'tarefa')->where('status', '!=', 'concluido')->count()
                    + $pendencias->where('tipo', 'kanban')->where('status', '!=', 'concluido')->count(),
                'rotinas' => [
                    'executadas' => $rotinasHoje->where('status', 'concluido')->count(),
                    'total' => $rotinasHoje->count(),
                ],
                'objetivos' => $objetivos['total_ativos'],
                'saude' => [
                    'atividades' => $saude['atividades_hoje'],
                    'distancia_km' => $saude['distancia_km_hoje'],
                ],
                'financeiro' => [
                    'saldo_mes' => $financeiro['saldo_mes'],
                    'saldo_atual' => $financeiro['saldo_atual'],
                ],
            ],
        ];
    }

    public function getResumoDoDia(User $user): array
    {
        return $this->getResumoDia($user);
    }

    public function getTimeline(User $user): array
    {
        return $this->montarTimeline($user);
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

        if ($user->hasModuleAccess('projetos')) {
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
        $timeline = $this->getTimeline($user);
        $pendencias = $this->montarPendencias($user);
        $resumo = $this->getResumoDia($user);

        return [
            'cabecalho' => $this->getCabecalho($user),
            'timeline' => $timeline,
            'pendencias' => $pendencias,
            'resumo' => $resumo,
            'prioridades' => $this->getPrioridades($user, $timeline, $pendencias),
            'alertas' => $this->getAlertas($user),
            'progresso' => $this->getProgresso($user, $timeline, $pendencias),
            'objetivos' => $this->getObjetivos($user),
            'saude' => $this->getSaude($user),
            'financeiro' => $this->getFinanceiro($user),
        ];
    }

    public function getCabecalho(User $user): array
    {
        $hour = now()->hour;
        $saudacao = $hour < 12 ? 'Bom dia' : ($hour < 18 ? 'Boa tarde' : 'Boa noite');

        return [
            'saudacao' => $saudacao,
            'nome' => $user->name,
            'data' => now()->translatedFormat('l, d \d\e F \d\e Y'),
        ];
    }

    public function getPrioridades(User $user, ?array $timeline = null, ?array $pendencias = null): array
    {
        $timeline = collect($timeline ?? $this->getTimeline($user));
        $pendencias = collect($pendencias ?? $this->montarPendencias($user));
        $prioridades = collect();

        Todo::ownedBy($user->id)
            ->whereDate('data', '<=', today())
            ->where('status', '!=', 'finalizado')
            ->whereIn('urgencia', ['alta', 'urgente'])
            ->orderBy('data')
            ->orderBy('hora')
            ->limit(3)
            ->get()
            ->each(fn (Todo $todo) => $prioridades->push([
                'tipo' => 'tarefa',
                'titulo' => $todo->descricao,
                'descricao' => $todo->observacao,
                'hora_inicio' => $this->normalizeTime($todo->hora),
                'status' => $todo->status === 'finalizado' ? 'concluido' : 'pendente',
                'origem_id' => $todo->id,
                'origem_url' => "/todo/{$todo->id}/edit",
                'pode_concluir' => true,
                'pode_adiar' => true,
                'motivo' => 'Urgência alta',
                'peso' => 1,
            ]));

        $timeline
            ->where('tipo', 'compromisso')
            ->where('status', '!=', 'concluido')
            ->sortBy('hora_inicio')
            ->take(3)
            ->each(fn (array $item) => $prioridades->push(array_merge($item, [
                'motivo' => 'Compromisso próximo',
                'peso' => 2,
            ])));

        $rotinasObrigatorias = $timeline
            ->merge($pendencias)
            ->where('tipo', 'rotina')
            ->where('status', '!=', 'concluido')
            ->take(3);

        $rotinasObrigatorias->each(fn (array $item) => $prioridades->push(array_merge($item, [
            'motivo' => 'Rotina pendente',
            'peso' => 3,
        ])));

        return $prioridades
            ->unique(fn (array $item) => $item['tipo'] . '-' . $item['origem_id'])
            ->sortBy([
                fn (array $item) => $item['peso'] ?? 9,
                fn (array $item) => $item['hora_inicio'] ?? '99:99',
            ])
            ->take(3)
            ->values()
            ->all();
    }

    public function getAlertas(User $user): array
    {
        $alertas = collect();

        $tarefasAtrasadas = Todo::ownedBy($user->id)
            ->whereDate('data', '<', today())
            ->where('status', '!=', 'finalizado')
            ->count();

        if ($tarefasAtrasadas > 0) {
            $alertas->push([
                'tipo' => 'tarefas_atrasadas',
                'titulo' => "{$tarefasAtrasadas} tarefa" . ($tarefasAtrasadas === 1 ? ' atrasada' : 's atrasadas'),
                'descricao' => 'Revise ou adie para limpar o radar do dia.',
                'severidade' => 'alta',
            ]);
        }

        $rotinasOntem = $this->rotinasDoDia($user, today()->subDay());
        $rotinasNaoExecutadasOntem = $rotinasOntem->where('status', '!=', 'concluido')->count();

        if ($rotinasNaoExecutadasOntem > 0) {
            $alertas->push([
                'tipo' => 'rotinas_ontem',
                'titulo' => "{$rotinasNaoExecutadasOntem} rotina" . ($rotinasNaoExecutadasOntem === 1 ? ' não executada ontem' : 's não executadas ontem'),
                'descricao' => 'Considere retomar o ritmo com uma execução mínima.',
                'severidade' => 'media',
            ]);
        }

        if ($user->hasModuleAccess('financeiro')) {
            $contasAmanha = TransacaoFinanceira::query()
                ->where('user_id', $user->id)
                ->where('tipo', 'despesa')
                ->whereDate('data', today()->addDay())
                ->where(function ($query) {
                    $query->whereNull('status')->orWhere('status', 'pendente');
                })
                ->count();

            if ($contasAmanha > 0) {
                $alertas->push([
                    'tipo' => 'contas_amanha',
                    'titulo' => "{$contasAmanha} conta" . ($contasAmanha === 1 ? ' vence' : 's vencem') . ' amanhã',
                    'descricao' => 'Confira o saldo e evite surpresa no fluxo financeiro.',
                    'severidade' => 'media',
                ]);
            }
        }

        return $alertas->values()->all();
    }

    public function getProgresso(User $user, ?array $timeline = null, ?array $pendencias = null): array
    {
        $timeline = collect($timeline ?? $this->getTimeline($user));
        $pendencias = collect($pendencias ?? $this->montarPendencias($user));
        $rotinas = $this->rotinasDoDia($user);
        $tarefas = $timeline->where('tipo', 'tarefa')->merge($pendencias->where('tipo', 'tarefa'));
        $compromissos = $timeline->where('tipo', 'compromisso');

        $total = $compromissos->count() + $rotinas->count() + $tarefas->count();
        $concluidos = $compromissos->where('status', 'concluido')->count()
            + $rotinas->where('status', 'concluido')->count()
            + $tarefas->where('status', 'concluido')->count();

        return [
            'percentual' => $total > 0 ? (int) round(($concluidos / $total) * 100) : 0,
            'total' => $total,
            'concluidos' => $concluidos,
            'detalhes' => [
                'compromissos' => [
                    'concluidos' => $compromissos->where('status', 'concluido')->count(),
                    'total' => $compromissos->count(),
                ],
                'rotinas' => [
                    'concluidos' => $rotinas->where('status', 'concluido')->count(),
                    'total' => $rotinas->count(),
                ],
                'tarefas' => [
                    'concluidos' => $tarefas->where('status', 'concluido')->count(),
                    'total' => $tarefas->count(),
                ],
            ],
        ];
    }

    public function getObjetivos(User $user): array
    {
        if (!$user->hasModuleAccess('projetos')) {
            return [
                'total_ativos' => 0,
                'items' => [],
            ];
        }

        $goals = Goal::ownedBy($user->id)
            ->whereIn('status', ['planejamento', 'em_andamento'])
            ->with(['progress', 'milestones', 'rotinas'])
            ->orderBy('status')
            ->orderBy('data_meta')
            ->limit(3)
            ->get();

        $items = $goals->map(function (Goal $goal) {
            $latestProgress = $goal->progress->first();
            $current = (float) ($latestProgress?->valor ?? 0);
            $target = (float) ($goal->distancia_meta ?? $goal->valor_meta ?? $goal->peso_meta ?? 0);
            $percent = $target > 0 ? min(100, (int) round(($current / $target) * 100)) : 0;
            $nextMilestone = $goal->milestones->firstWhere('concluido', false);
            $nextRotina = $goal->rotinas->first();

            return [
                'id' => $goal->id,
                'nome' => $goal->titulo,
                'categoria' => $goal->categoria,
                'tipo' => $goal->tipo_meta,
                'progresso_atual' => $current,
                'meta' => $target,
                'percentual' => $percent,
                'unidade' => $goal->tipo_meta === 'distancia' ? 'km' : ($goal->tipo_meta === 'financeiro' ? 'R$' : ''),
                'proxima_acao' => $nextMilestone?->titulo
                    ?? ($nextRotina ? "Executar rotina: {$nextRotina->nome}" : 'Definir a próxima ação'),
                'url' => "/goals/{$goal->id}",
            ];
        })->values();

        return [
            'total_ativos' => Goal::ownedBy($user->id)->whereIn('status', ['planejamento', 'em_andamento'])->count(),
            'items' => $items->all(),
        ];
    }

    public function getSaude(User $user): array
    {
        if (!$user->hasModuleAccess('saude')) {
            return [
                'distancia_km_hoje' => 0,
                'atividades_hoje' => 0,
                'calorias_hoje' => 0,
                'rotinas_executadas_hoje' => $this->rotinasDoDia($user)->where('status', 'concluido')->count(),
                'meta' => null,
                'strava_sincronizado' => false,
            ];
        }

        $atividadesHoje = AtividadeFisica::query()
            ->where('user_id', $user->id)
            ->whereDate('data', today())
            ->get();

        $meta = MetaSaude::query()
            ->where('user_id', $user->id)
            ->where('ativa', true)
            ->orderBy('data_fim')
            ->first();

        $distanciaKm = round(((float) $atividadesHoje->sum('distancia_metros')) / 1000, 2);

        return [
            'distancia_km_hoje' => $distanciaKm,
            'atividades_hoje' => $atividadesHoje->count(),
            'calorias_hoje' => (int) $atividadesHoje->sum('calorias_queimadas'),
            'rotinas_executadas_hoje' => $this->rotinasDoDia($user)->where('status', 'concluido')->count(),
            'meta' => $meta ? [
                'titulo' => $meta->titulo,
                'tipo' => $meta->tipo,
                'valor_alvo' => (float) $meta->valor_alvo,
                'periodo' => $meta->periodo,
            ] : null,
            'strava_sincronizado' => $atividadesHoje->where('fonte', 'strava')->count() > 0,
        ];
    }

    public function getFinanceiro(User $user): array
    {
        if (!$user->hasModuleAccess('financeiro')) {
            return [
                'receitas_mes' => 0,
                'despesas_mes' => 0,
                'saldo_mes' => 0,
                'saldo_atual' => 0,
                'economia_acumulada' => 0,
            ];
        }

        $monthStart = today()->startOfMonth();
        $monthEnd = today()->endOfMonth();

        $transacoesMes = TransacaoFinanceira::query()
            ->where('user_id', $user->id)
            ->whereBetween('data', [$monthStart, $monthEnd])
            ->get();

        $receitas = (float) $transacoesMes->where('tipo', 'receita')->sum('valor');
        $despesas = (float) $transacoesMes->where('tipo', 'despesa')->sum('valor');
        $saldoAtual = (float) ContaBancaria::query()
            ->where('user_id', $user->id)
            ->where('ativa', true)
            ->sum('saldo_atual');
        $economiaAcumulada = (float) MetaEconomia::query()
            ->where('user_id', $user->id)
            ->sum('valor_atual');

        return [
            'receitas_mes' => $receitas,
            'despesas_mes' => $despesas,
            'saldo_mes' => $receitas - $despesas,
            'saldo_atual' => $saldoAtual,
            'economia_acumulada' => $economiaAcumulada,
        ];
    }

    private function timelineCompromissos(User $user): Collection
    {
        if (!$user->hasModuleAccess('compromissos')) {
            return collect();
        }

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
        if (!$user->hasModuleAccess('compromissos')) {
            return collect();
        }

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
        if (!$user->hasModuleAccess('saude')) {
            return collect();
        }

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

    private function rotinasDoDia(User $user, ?Carbon $date = null): Collection
    {
        $today = $date?->copy()->startOfDay() ?? today();

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
