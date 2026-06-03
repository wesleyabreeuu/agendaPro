<?php

namespace App\Services;

use App\Models\AtividadeFisica;
use App\Models\Compromisso;
use App\Models\ContaBancaria;
use App\Models\DailySession;
use App\Models\Goal;
use App\Models\GoalMilestone;
use App\Models\GoalProgress;
use App\Models\KanbanTask;
use App\Models\Lembrete;
use App\Models\MetaBemMaterial;
use App\Models\MetaEconomia;
use App\Models\MetaSaude;
use App\Models\Rotina;
use App\Models\RotinaExecucao;
use App\Models\Todo;
use App\Models\TransacaoFinanceira;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class RelatorioGeralService
{
    public function gerar(User $user, array $filters = []): array
    {
        $periodo = $this->periodo($filters);
        $secoesDisponiveis = $this->secoesDisponiveis($user);
        $secaoKeys = array_keys($secoesDisponiveis);
        $secoesSelecionadas = $this->selecionados($filters['secoes'] ?? [], $secaoKeys, $secaoKeys);
        $camposDisponiveis = $this->camposDisponiveis();
        $camposSelecionados = $this->camposSelecionados($filters['campos'] ?? [], $camposDisponiveis);
        $status = filled($filters['status'] ?? null) ? (string) $filters['status'] : null;
        $busca = trim((string) ($filters['q'] ?? ''));

        $secoes = collect($secoesSelecionadas)
            ->map(fn (string $secao) => $this->montarSecao(
                $user,
                $secao,
                $secoesDisponiveis[$secao],
                $camposDisponiveis[$secao] ?? [],
                $camposSelecionados[$secao] ?? [],
                $periodo,
                $busca,
                $status,
            ))
            ->filter()
            ->values()
            ->all();

        $graficos = $this->graficos($secoes);
        $totaisPorModulo = collect($secoes)
            ->groupBy('modulo')
            ->map(fn (Collection $items) => $items->sum('total'))
            ->all();

        return [
            'filtros' => [
                'data_inicio' => $periodo['inicio']->toDateString(),
                'data_fim' => $periodo['fim']->toDateString(),
                'q' => $busca,
                'status' => $status ?: '',
                'secoes' => $secoesSelecionadas,
                'campos' => collect($camposSelecionados)
                    ->flatMap(fn (array $campos, string $secao) => collect($campos)->map(fn (string $campo) => "{$secao}.{$campo}"))
                    ->values()
                    ->all(),
            ],
            'resumo' => [
                'periodo' => $periodo['inicio']->translatedFormat('d/m/Y') . ' a ' . $periodo['fim']->translatedFormat('d/m/Y'),
                'total_registros' => collect($secoes)->sum('total'),
                'total_secoes' => count($secoes),
                'modulos' => $totaisPorModulo,
                'destaques' => $graficos['destaques'],
            ],
            'graficos' => $graficos,
            'secoes_disponiveis' => $secoesDisponiveis,
            'campos_disponiveis' => $camposDisponiveis,
            'secoes' => $secoes,
        ];
    }

    private function montarSecao(
        User $user,
        string $secao,
        array $config,
        array $camposDisponiveis,
        array $camposSelecionados,
        array $periodo,
        string $busca,
        ?string $status,
    ): ?array {
        $items = match ($secao) {
            'compromissos' => $this->compromissos($user, $periodo, $busca),
            'lembretes' => $this->lembretes($user, $periodo, $busca),
            'tarefas' => $this->tarefas($user, $periodo, $busca, $status),
            'rotinas' => $this->rotinas($user, $periodo, $busca, $status),
            'execucoes_rotinas' => $this->execucoesRotinas($user, $periodo, $busca, $status),
            'sessoes_diarias' => $this->sessoesDiarias($user, $periodo, $status),
            'kanban' => $this->kanban($user, $periodo, $busca, $status),
            'objetivos' => $this->objetivos($user, $periodo, $busca, $status),
            'progresso_objetivos' => $this->progressoObjetivos($user, $periodo, $busca),
            'marcos_objetivos' => $this->marcosObjetivos($user, $periodo, $busca, $status),
            'saude_atividades' => $this->atividadesFisicas($user, $periodo, $busca),
            'saude_metas' => $this->metasSaude($user, $periodo, $busca, $status),
            'financeiro_transacoes' => $this->transacoes($user, $periodo, $busca, $status),
            'financeiro_contas' => $this->contas($user, $busca, $status),
            'financeiro_metas_economia' => $this->metasEconomia($user, $periodo, $busca),
            'financeiro_bens' => $this->metasBens($user, $busca),
            default => collect(),
        };

        $analytics = $items
            ->map(fn (array $item) => collect($item)->only([
                'data',
                'titulo',
                'categoria',
                'status',
                'origem',
                'valor_numero',
                'tipo',
                'distancia_km',
                'duracao_minutos',
                'calorias',
            ])->all())
            ->values()
            ->all();

        return [
            'key' => $secao,
            'label' => $config['label'],
            'modulo' => $config['modulo'],
            'total' => $items->count(),
            'analytics' => $analytics,
            'campos' => collect($camposDisponiveis)
                ->whereIn('key', $camposSelecionados)
                ->values()
                ->all(),
            'items' => $items->map(fn (array $item) => collect($item)->only($camposSelecionados)->all())->values()->all(),
        ];
    }

    private function compromissos(User $user, array $periodo, string $busca): Collection
    {
        return Compromisso::query()
            ->with(['categoria:id,nome', 'owner:id,name'])
            ->where(function (Builder $query) use ($user) {
                $query->where('usuarios_id', $user->id)
                    ->orWhereHas('compartilhamentos', fn (Builder $shared) => $shared->where('usuario_id', $user->id));
            })
            ->whereBetween('data_inicio', [$periodo['inicio'], $periodo['fim']])
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'descricao', 'telefone'], $busca))
            ->orderBy('data_inicio')
            ->limit(250)
            ->get()
            ->map(fn (Compromisso $item) => [
                'data' => optional($item->data_inicio)->format('d/m/Y'),
                'hora' => optional($item->data_inicio)->format('H:i'),
                'titulo' => $item->titulo,
                'descricao' => $item->descricao,
                'categoria' => $item->categoria?->nome,
                'status' => $item->dia_inteiro ? 'Dia inteiro' : 'Com horário',
                'origem' => $item->owner?->name,
                'data_fim' => optional($item->data_fim)->format('d/m/Y H:i'),
                'telefone' => $item->telefone,
                'recorrencia' => $item->recorrencia,
            ]);
    }

    private function lembretes(User $user, array $periodo, string $busca): Collection
    {
        return Lembrete::query()
            ->with('compromisso:id,titulo,descricao')
            ->ownedBy($user->id)
            ->where(function (Builder $query) use ($periodo) {
                $query->whereBetween('inicio_em', [$periodo['inicio'], $periodo['fim']])
                    ->orWhereBetween('proxima_execucao_em', [$periodo['inicio'], $periodo['fim']]);
            })
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'descricao', 'categoria'], $busca))
            ->orderBy('proxima_execucao_em')
            ->limit(250)
            ->get()
            ->map(fn (Lembrete $item) => [
                'data' => optional($item->momento_disparo)->format('d/m/Y'),
                'hora' => optional($item->momento_disparo)->format('H:i'),
                'titulo' => $item->titulo_exibicao,
                'descricao' => $item->descricao_exibicao,
                'categoria' => $item->categoria,
                'status' => $item->ativo ? 'Ativo' : 'Inativo',
                'origem' => $item->compromisso?->titulo,
                'tipo' => $item->tipo,
                'recorrencia' => $item->recorrencia,
                'minutos_antes' => $item->minutos_antes,
            ]);
    }

    private function tarefas(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return Todo::query()
            ->ownedBy($user->id)
            ->whereBetween('data', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->tap(fn (Builder $query) => $this->buscar($query, ['descricao', 'observacao', 'urgencia', 'status'], $busca))
            ->orderBy('data')
            ->orderBy('hora')
            ->limit(250)
            ->get()
            ->map(fn (Todo $item) => [
                'data' => optional($item->data)->format('d/m/Y'),
                'hora' => $item->hora,
                'titulo' => $item->descricao,
                'descricao' => $item->observacao,
                'categoria' => $item->urgencia,
                'status' => $item->status,
                'origem' => 'Todo list',
                'urgencia' => $item->urgencia,
                'finalizado_em' => optional($item->finalizado_em)->format('d/m/Y H:i'),
            ]);
    }

    private function rotinas(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return Rotina::query()
            ->ownedBy($user->id)
            ->whereDate('data_inicio', '<=', $periodo['fim'])
            ->when($status !== null, fn (Builder $query) => $query->where('ativo', $status === 'ativo'))
            ->tap(fn (Builder $query) => $this->buscar($query, ['nome', 'descricao', 'categoria'], $busca))
            ->orderByDesc('ativo')
            ->orderBy('ordem')
            ->limit(250)
            ->get()
            ->map(fn (Rotina $item) => [
                'data' => optional($item->data_inicio)->format('d/m/Y'),
                'hora' => $item->horario,
                'titulo' => $item->nome,
                'descricao' => $item->descricao,
                'categoria' => $item->categoria,
                'status' => $item->ativo ? 'ativo' : 'inativo',
                'origem' => 'Rotinas',
                'frequencia' => $item->frequencia_tipo,
                'dificuldade' => $item->dificuldade,
                'energia' => $item->energia_recomendada,
            ]);
    }

    private function execucoesRotinas(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return RotinaExecucao::query()
            ->with('rotina:id,nome,categoria')
            ->where('user_id', $user->id)
            ->whereBetween('data', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->whereHas('rotina', fn (Builder $query) => $this->buscar($query, ['nome', 'categoria'], $busca))
            ->orderByDesc('data')
            ->limit(250)
            ->get()
            ->map(fn (RotinaExecucao $item) => [
                'data' => optional($item->data)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->rotina?->nome,
                'descricao' => $item->observacao,
                'categoria' => $item->rotina?->categoria,
                'status' => $item->status,
                'origem' => $item->modo_usado,
                'modo' => $item->modo_usado,
            ]);
    }

    private function sessoesDiarias(User $user, array $periodo, ?string $status): Collection
    {
        return DailySession::query()
            ->where('user_id', $user->id)
            ->whereBetween('date', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
            ->when($status !== null, fn (Builder $query) => $query->where('started', $status === 'iniciado'))
            ->orderByDesc('date')
            ->limit(250)
            ->get()
            ->map(fn (DailySession $item) => [
                'data' => optional($item->date)->format('d/m/Y'),
                'hora' => null,
                'titulo' => 'Ritual do dia',
                'descricao' => $item->started ? 'Dia iniciado pelo Meu Dia' : 'Sessão registrada',
                'categoria' => 'Meu Dia',
                'status' => $item->started ? 'iniciado' : 'pendente',
                'origem' => 'Meu Dia',
            ]);
    }

    private function kanban(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return KanbanTask::query()
            ->with('quadro:id,nome,user_id')
            ->whereHas('quadro', fn (Builder $query) => $query->where('user_id', $user->id))
            ->where(function (Builder $query) use ($periodo) {
                $query->whereBetween('data_limite', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
                    ->orWhereBetween('created_at', [$periodo['inicio'], $periodo['fim']]);
            })
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'descricao', 'observacoes', 'urgencia', 'status'], $busca))
            ->orderByRaw('data_limite IS NULL, data_limite ASC')
            ->limit(250)
            ->get()
            ->map(fn (KanbanTask $item) => [
                'data' => optional($item->data_limite)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->titulo,
                'descricao' => $item->descricao ?: $item->observacoes,
                'categoria' => $item->urgencia,
                'status' => $item->status,
                'origem' => $item->quadro?->nome,
                'urgencia' => $item->urgencia,
                'prazo' => optional($item->data_limite)->format('d/m/Y'),
                'checklist' => ($item->checklist_resumo['concluidos'] ?? 0) . '/' . ($item->checklist_resumo['total'] ?? 0),
            ]);
    }

    private function objetivos(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return Goal::query()
            ->ownedBy($user->id)
            ->where(function (Builder $query) use ($periodo) {
                $query->whereBetween('data_inicio', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
                    ->orWhereBetween('data_meta', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
                    ->orWhereBetween('created_at', [$periodo['inicio'], $periodo['fim']]);
            })
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'descricao', 'categoria', 'status'], $busca))
            ->orderBy('data_meta')
            ->limit(250)
            ->get()
            ->map(fn (Goal $item) => [
                'data' => optional($item->data_meta)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->titulo,
                'descricao' => $item->descricao,
                'categoria' => $item->categoria ?: $item->tipo_meta,
                'status' => $item->status,
                'origem' => 'Objetivos',
                'data_inicio' => optional($item->data_inicio)->format('d/m/Y'),
                'data_meta' => optional($item->data_meta)->format('d/m/Y'),
                'tipo_meta' => $item->tipo_meta,
                'meta' => $item->valor_meta ?: $item->distancia_meta ?: $item->peso_meta,
            ]);
    }

    private function progressoObjetivos(User $user, array $periodo, string $busca): Collection
    {
        return GoalProgress::query()
            ->with('goal:id,user_id,titulo,categoria')
            ->whereHas('goal', fn (Builder $query) => $query->where('user_id', $user->id))
            ->whereBetween('data', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
            ->tap(fn (Builder $query) => $this->buscar($query, ['descricao', 'tipo', 'observacoes'], $busca))
            ->orderByDesc('data')
            ->limit(250)
            ->get()
            ->map(fn (GoalProgress $item) => [
                'data' => optional($item->data)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->descricao ?: $item->goal?->titulo,
                'descricao' => $item->observacoes,
                'categoria' => $item->tipo,
                'status' => $item->valor !== null ? (string) $item->valor : null,
                'origem' => $item->goal?->titulo,
                'tipo' => $item->tipo,
                'valor' => $item->valor !== null ? (string) $item->valor : null,
            ]);
    }

    private function marcosObjetivos(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return GoalMilestone::query()
            ->with('goal:id,user_id,titulo')
            ->whereHas('goal', fn (Builder $query) => $query->where('user_id', $user->id))
            ->where(function (Builder $query) use ($periodo) {
                $query->whereBetween('created_at', [$periodo['inicio'], $periodo['fim']])
                    ->orWhereBetween('concluido_em', [$periodo['inicio'], $periodo['fim']]);
            })
            ->when($status !== null, fn (Builder $query) => $query->where('concluido', $status === 'concluido'))
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'descricao'], $busca))
            ->orderBy('ordem')
            ->limit(250)
            ->get()
            ->map(fn (GoalMilestone $item) => [
                'data' => optional($item->concluido_em ?: $item->created_at)->format('d/m/Y'),
                'hora' => optional($item->concluido_em ?: $item->created_at)->format('H:i'),
                'titulo' => $item->titulo,
                'descricao' => $item->descricao,
                'categoria' => $item->goal?->titulo,
                'status' => $item->concluido ? 'concluido' : 'pendente',
                'origem' => 'Objetivos',
                'ordem' => $item->ordem,
                'meta_valor' => $item->meta_valor !== null ? (string) $item->meta_valor : null,
                'concluido_em' => optional($item->concluido_em)->format('d/m/Y H:i'),
            ]);
    }

    private function atividadesFisicas(User $user, array $periodo, string $busca): Collection
    {
        return AtividadeFisica::query()
            ->with('categoria:id,nome')
            ->where('user_id', $user->id)
            ->whereBetween('data', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
            ->tap(fn (Builder $query) => $this->buscar($query, ['descricao', 'intensidade', 'notas', 'fonte', 'sport_type'], $busca))
            ->orderByDesc('data')
            ->orderBy('hora_inicio')
            ->limit(250)
            ->get()
            ->map(fn (AtividadeFisica $item) => [
                'data' => optional($item->data)->format('d/m/Y'),
                'hora' => $item->hora_inicio,
                'titulo' => $item->descricao,
                'descricao' => trim(implode(' | ', array_filter([
                    $item->distancia_formatada,
                    $item->duracao_minutos ? "{$item->duracao_minutos} min" : null,
                    $item->calorias_queimadas ? "{$item->calorias_queimadas} kcal" : null,
                ]))),
                'categoria' => $item->categoria?->nome ?: $item->sport_type,
                'status' => $item->fonte,
                'origem' => 'Saúde',
                'distancia' => $item->distancia_formatada,
                'distancia_km' => $item->distancia_km,
                'duracao' => $item->duracao_minutos ? "{$item->duracao_minutos} min" : null,
                'duracao_minutos' => $item->duracao_minutos,
                'calorias' => $item->calorias_queimadas,
                'intensidade' => $item->intensidade,
                'fonte' => $item->fonte,
            ]);
    }

    private function metasSaude(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return MetaSaude::query()
            ->where('user_id', $user->id)
            ->where(function (Builder $query) use ($periodo) {
                $query->whereBetween('data_inicio', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
                    ->orWhereBetween('data_fim', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
                    ->orWhereBetween('created_at', [$periodo['inicio'], $periodo['fim']]);
            })
            ->when($status !== null, fn (Builder $query) => $query->where('ativa', $status === 'ativa'))
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'tipo', 'periodo'], $busca))
            ->orderByDesc('ativa')
            ->limit(250)
            ->get()
            ->map(fn (MetaSaude $item) => [
                'data' => optional($item->data_inicio)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->titulo,
                'descricao' => $item->valor_alvo !== null ? "Meta: {$item->valor_alvo}" : null,
                'categoria' => $item->tipo,
                'status' => $item->ativa ? 'ativa' : 'inativa',
                'origem' => 'Saúde',
                'tipo' => $item->tipo,
                'valor_alvo' => $item->valor_alvo,
                'periodo' => $item->periodo,
                'data_fim' => optional($item->data_fim)->format('d/m/Y'),
            ]);
    }

    private function transacoes(User $user, array $periodo, string $busca, ?string $status): Collection
    {
        return TransacaoFinanceira::query()
            ->with(['categoria:id,nome', 'conta:id,nome'])
            ->where('user_id', $user->id)
            ->whereBetween('data', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->tap(fn (Builder $query) => $this->buscar($query, ['descricao', 'complemento', 'tipo', 'status', 'forma_pagamento', 'observacoes'], $busca))
            ->orderByDesc('data')
            ->limit(250)
            ->get()
            ->map(fn (TransacaoFinanceira $item) => [
                'data' => optional($item->data)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->descricao,
                'descricao' => $item->complemento ?: $item->observacoes,
                'categoria' => $item->categoria?->nome ?: $item->tipo,
                'status' => $item->status,
                'origem' => trim(($item->conta?->nome ?: 'Conta') . ' | R$ ' . number_format((float) $item->valor, 2, ',', '.')),
                'valor' => 'R$ ' . number_format((float) $item->valor, 2, ',', '.'),
                'valor_numero' => (float) $item->valor,
                'tipo' => $item->tipo,
                'conta' => $item->conta?->nome,
                'forma_pagamento' => $item->forma_pagamento,
            ]);
    }

    private function contas(User $user, string $busca, ?string $status): Collection
    {
        return ContaBancaria::query()
            ->where('user_id', $user->id)
            ->when($status !== null, fn (Builder $query) => $query->where('ativa', $status === 'ativa'))
            ->tap(fn (Builder $query) => $this->buscar($query, ['nome', 'instituicao', 'tipo'], $busca))
            ->orderByDesc('ativa')
            ->orderBy('nome')
            ->limit(250)
            ->get()
            ->map(fn (ContaBancaria $item) => [
                'data' => optional($item->created_at)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->nome,
                'descricao' => $item->instituicao,
                'categoria' => $item->tipo,
                'status' => $item->ativa ? 'ativa' : 'inativa',
                'origem' => 'Saldo: R$ ' . number_format((float) $item->saldo_atual, 2, ',', '.'),
                'instituicao' => $item->instituicao,
                'saldo_inicial' => 'R$ ' . number_format((float) $item->saldo_inicial, 2, ',', '.'),
                'saldo_atual' => 'R$ ' . number_format((float) $item->saldo_atual, 2, ',', '.'),
            ]);
    }

    private function metasEconomia(User $user, array $periodo, string $busca): Collection
    {
        return MetaEconomia::query()
            ->where('user_id', $user->id)
            ->where(function (Builder $query) use ($periodo) {
                $query->whereBetween('prazo_final', [$periodo['inicio']->toDateString(), $periodo['fim']->toDateString()])
                    ->orWhereBetween('created_at', [$periodo['inicio'], $periodo['fim']]);
            })
            ->tap(fn (Builder $query) => $this->buscar($query, ['titulo', 'descricao', 'periodicidade'], $busca))
            ->orderBy('prazo_final')
            ->limit(250)
            ->get()
            ->map(fn (MetaEconomia $item) => [
                'data' => optional($item->prazo_final)->format('d/m/Y'),
                'hora' => null,
                'titulo' => $item->titulo,
                'descricao' => $item->descricao,
                'categoria' => $item->periodicidade,
                'status' => 'R$ ' . number_format((float) $item->valor_atual, 2, ',', '.') . ' / R$ ' . number_format((float) $item->valor_alvo, 2, ',', '.'),
                'origem' => 'Financeiro',
                'valor_alvo' => 'R$ ' . number_format((float) $item->valor_alvo, 2, ',', '.'),
                'valor_atual' => 'R$ ' . number_format((float) $item->valor_atual, 2, ',', '.'),
                'periodicidade' => $item->periodicidade,
            ]);
    }

    private function metasBens(User $user, string $busca): Collection
    {
        return MetaBemMaterial::query()
            ->where('user_id', $user->id)
            ->tap(fn (Builder $query) => $this->buscar($query, ['nome_bem', 'descricao'], $busca))
            ->orderByDesc('created_at')
            ->limit(250)
            ->get()
            ->map(fn (MetaBemMaterial $item) => [
                'data' => optional($item->created_at)->format('d/m/Y'),
                'hora' => optional($item->created_at)->format('H:i'),
                'titulo' => $item->nome_bem,
                'descricao' => $item->descricao,
                'categoria' => 'Bem material',
                'status' => 'R$ ' . number_format((float) $item->valor_ja_guardado, 2, ',', '.') . ' / R$ ' . number_format((float) $item->valor_bem, 2, ',', '.'),
                'origem' => 'Financeiro',
                'valor_bem' => 'R$ ' . number_format((float) $item->valor_bem, 2, ',', '.'),
                'valor_guardado' => 'R$ ' . number_format((float) $item->valor_ja_guardado, 2, ',', '.'),
                'valor_guardar_mes' => 'R$ ' . number_format((float) $item->valor_guardar_mes, 2, ',', '.'),
                'meses_planejados' => $item->meses_planejados,
            ]);
    }

    private function periodo(array $filters): array
    {
        $inicio = filled($filters['data_inicio'] ?? null)
            ? Carbon::parse($filters['data_inicio'])->startOfDay()
            : now()->startOfMonth();

        $fim = filled($filters['data_fim'] ?? null)
            ? Carbon::parse($filters['data_fim'])->endOfDay()
            : now()->endOfDay();

        if ($fim->lt($inicio)) {
            [$inicio, $fim] = [$fim->copy()->startOfDay(), $inicio->copy()->endOfDay()];
        }

        return ['inicio' => $inicio, 'fim' => $fim];
    }

    private function buscar(Builder $query, array $columns, string $busca): void
    {
        if ($busca === '') {
            return;
        }

        $query->where(function (Builder $search) use ($columns, $busca) {
            foreach ($columns as $column) {
                $search->orWhere($column, 'like', "%{$busca}%");
            }
        });
    }

    private function selecionados(array|string|null $value, array $allowed, array $default): array
    {
        $items = is_array($value) ? $value : array_filter(explode(',', (string) $value));
        $selected = array_values(array_intersect($items, $allowed));

        return $selected ?: $default;
    }

    private function camposSelecionados(array|string|null $value, array $camposDisponiveis): array
    {
        $items = is_array($value) ? $value : array_filter(explode(',', (string) $value));
        $porSecao = [];

        foreach ($camposDisponiveis as $secao => $campos) {
            $allowed = collect($campos)->pluck('key')->all();
            $porSecao[$secao] = $allowed;
        }

        foreach ($items as $item) {
            if (! str_contains($item, '.')) {
                continue;
            }

            [$secao, $campo] = explode('.', $item, 2);
            if (! isset($porSecao[$secao]) || ! in_array($campo, collect($camposDisponiveis[$secao])->pluck('key')->all(), true)) {
                continue;
            }

            $porSecao[$secao] ??= [];
            $porSecao[$secao] = array_values(array_unique(array_merge($porSecao[$secao] === collect($camposDisponiveis[$secao])->pluck('key')->all() ? [] : $porSecao[$secao], [$campo])));
        }

        if ($items) {
            foreach ($porSecao as $secao => $campos) {
                $selected = collect($items)
                    ->filter(fn (string $item) => str_starts_with($item, "{$secao}."))
                    ->map(fn (string $item) => explode('.', $item, 2)[1])
                    ->intersect(collect($camposDisponiveis[$secao])->pluck('key')->all())
                    ->values()
                    ->all();

                $porSecao[$secao] = $selected ?: collect($camposDisponiveis[$secao])->pluck('key')->all();
            }
        }

        return $porSecao;
    }

    private function graficos(array $secoes): array
    {
        $sections = collect($secoes);
        $analytics = $sections->flatMap(fn (array $secao) => collect($secao['analytics'] ?? [])->map(fn (array $item) => array_merge($item, [
            '_secao' => $secao['label'],
            '_modulo' => $secao['modulo'],
        ])));

        $porModulo = $sections
            ->groupBy('modulo')
            ->map(fn (Collection $items, string $modulo) => [
                'name' => $modulo,
                'total' => $items->sum('total'),
            ])
            ->values()
            ->all();

        $porSecao = $sections
            ->map(fn (array $secao) => [
                'name' => $secao['label'],
                'total' => $secao['total'],
                'modulo' => $secao['modulo'],
            ])
            ->sortByDesc('total')
            ->values()
            ->all();

        $porStatus = $analytics
            ->filter(fn (array $item) => filled($item['status'] ?? null))
            ->groupBy(fn (array $item) => (string) $item['status'])
            ->map(fn (Collection $items, string $status) => [
                'name' => ucfirst(str_replace('_', ' ', $status)),
                'total' => $items->count(),
            ])
            ->sortByDesc('total')
            ->values()
            ->take(8)
            ->all();

        $linhaDoTempo = $analytics
            ->filter(fn (array $item) => filled($item['data'] ?? null))
            ->groupBy('data')
            ->map(fn (Collection $items, string $data) => [
                'data' => $data,
                'total' => $items->count(),
            ])
            ->sortBy(function (array $item) {
                try {
                    return Carbon::createFromFormat('d/m/Y', $item['data'])->timestamp;
                } catch (\Throwable) {
                    return 0;
                }
            })
            ->values()
            ->all();

        $financeiro = $analytics
            ->where('_secao', 'Transações financeiras')
            ->groupBy(fn (array $item) => $item['tipo'] ?: 'sem_tipo')
            ->map(fn (Collection $items, string $tipo) => [
                'name' => ucfirst(str_replace('_', ' ', $tipo)),
                'valor' => round($items->sum(fn (array $item) => (float) ($item['valor_numero'] ?? 0)), 2),
            ])
            ->values()
            ->all();

        $saude = $analytics
            ->where('_secao', 'Atividades físicas')
            ->groupBy(fn (array $item) => $item['categoria'] ?: 'Sem categoria')
            ->map(fn (Collection $items, string $categoria) => [
                'name' => $categoria,
                'sessoes' => $items->count(),
                'distancia' => round($items->sum(fn (array $item) => (float) ($item['distancia_km'] ?? 0)), 2),
                'minutos' => $items->sum(fn (array $item) => (int) ($item['duracao_minutos'] ?? 0)),
            ])
            ->sortByDesc('sessoes')
            ->values()
            ->take(8)
            ->all();

        $destaques = [
            'modulo_mais_movimentado' => collect($porModulo)->sortByDesc('total')->first(),
            'secao_mais_movimentada' => collect($porSecao)->first(),
            'status_principal' => collect($porStatus)->first(),
            'dias_com_dados' => count($linhaDoTempo),
            'receitas' => collect($financeiro)->firstWhere('name', 'Receita')['valor'] ?? 0,
            'despesas' => collect($financeiro)->firstWhere('name', 'Despesa')['valor'] ?? 0,
            'distancia_km' => collect($saude)->sum('distancia'),
        ];

        return [
            'por_modulo' => $porModulo,
            'por_secao' => $porSecao,
            'por_status' => $porStatus,
            'linha_do_tempo' => $linhaDoTempo,
            'financeiro' => $financeiro,
            'saude' => $saude,
            'destaques' => $destaques,
        ];
    }

    private function secoesDisponiveis(User $user): array
    {
        $secoes = [];

        if ($user->hasModuleAccess('compromissos')) {
            $secoes['compromissos'] = ['label' => 'Compromissos', 'modulo' => 'Compromissos'];
            $secoes['lembretes'] = ['label' => 'Lembretes', 'modulo' => 'Compromissos'];
        }

        if ($user->hasModuleAccess('dia_a_dia')) {
            $secoes['tarefas'] = ['label' => 'Todo list', 'modulo' => 'Dia a dia'];
            $secoes['rotinas'] = ['label' => 'Rotinas', 'modulo' => 'Dia a dia'];
            $secoes['execucoes_rotinas'] = ['label' => 'Execuções de rotinas', 'modulo' => 'Dia a dia'];
            $secoes['sessoes_diarias'] = ['label' => 'Sessões do Meu Dia', 'modulo' => 'Dia a dia'];
        }

        if ($user->hasModuleAccess('projetos')) {
            $secoes['kanban'] = ['label' => 'Kanban', 'modulo' => 'Projetos'];
            $secoes['objetivos'] = ['label' => 'Objetivos', 'modulo' => 'Projetos'];
            $secoes['progresso_objetivos'] = ['label' => 'Progresso de objetivos', 'modulo' => 'Projetos'];
            $secoes['marcos_objetivos'] = ['label' => 'Marcos de objetivos', 'modulo' => 'Projetos'];
        }

        if ($user->hasModuleAccess('saude')) {
            $secoes['saude_atividades'] = ['label' => 'Atividades físicas', 'modulo' => 'Saúde'];
            $secoes['saude_metas'] = ['label' => 'Metas de saúde', 'modulo' => 'Saúde'];
        }

        if ($user->hasModuleAccess('financeiro')) {
            $secoes['financeiro_transacoes'] = ['label' => 'Transações financeiras', 'modulo' => 'Financeiro'];
            $secoes['financeiro_contas'] = ['label' => 'Contas bancárias', 'modulo' => 'Financeiro'];
            $secoes['financeiro_metas_economia'] = ['label' => 'Metas de economia', 'modulo' => 'Financeiro'];
            $secoes['financeiro_bens'] = ['label' => 'Metas de bens materiais', 'modulo' => 'Financeiro'];
        }

        return $secoes;
    }

    private function camposDisponiveis(): array
    {
        $camposPadrao = [
            ['key' => 'data', 'label' => 'Data'],
            ['key' => 'hora', 'label' => 'Hora'],
            ['key' => 'titulo', 'label' => 'Título'],
            ['key' => 'descricao', 'label' => 'Descrição'],
            ['key' => 'categoria', 'label' => 'Categoria'],
            ['key' => 'status', 'label' => 'Status'],
            ['key' => 'origem', 'label' => 'Origem'],
        ];

        return [
            'compromissos' => array_merge($camposPadrao, [
                ['key' => 'data_fim', 'label' => 'Fim'],
                ['key' => 'telefone', 'label' => 'Telefone'],
                ['key' => 'recorrencia', 'label' => 'Recorrência'],
            ]),
            'lembretes' => array_merge($camposPadrao, [
                ['key' => 'tipo', 'label' => 'Tipo'],
                ['key' => 'recorrencia', 'label' => 'Recorrência'],
                ['key' => 'minutos_antes', 'label' => 'Min. antes'],
            ]),
            'tarefas' => array_merge($camposPadrao, [
                ['key' => 'urgencia', 'label' => 'Urgência'],
                ['key' => 'finalizado_em', 'label' => 'Finalizado em'],
            ]),
            'rotinas' => array_merge($camposPadrao, [
                ['key' => 'frequencia', 'label' => 'Frequência'],
                ['key' => 'dificuldade', 'label' => 'Dificuldade'],
                ['key' => 'energia', 'label' => 'Energia'],
            ]),
            'execucoes_rotinas' => array_merge($camposPadrao, [
                ['key' => 'modo', 'label' => 'Modo'],
            ]),
            'sessoes_diarias' => $camposPadrao,
            'kanban' => array_merge($camposPadrao, [
                ['key' => 'urgencia', 'label' => 'Urgência'],
                ['key' => 'prazo', 'label' => 'Prazo'],
                ['key' => 'checklist', 'label' => 'Checklist'],
            ]),
            'objetivos' => array_merge($camposPadrao, [
                ['key' => 'data_inicio', 'label' => 'Início'],
                ['key' => 'data_meta', 'label' => 'Meta em'],
                ['key' => 'tipo_meta', 'label' => 'Tipo de meta'],
                ['key' => 'meta', 'label' => 'Meta'],
            ]),
            'progresso_objetivos' => array_merge($camposPadrao, [
                ['key' => 'tipo', 'label' => 'Tipo'],
                ['key' => 'valor', 'label' => 'Valor'],
            ]),
            'marcos_objetivos' => array_merge($camposPadrao, [
                ['key' => 'ordem', 'label' => 'Ordem'],
                ['key' => 'meta_valor', 'label' => 'Valor alvo'],
                ['key' => 'concluido_em', 'label' => 'Concluído em'],
            ]),
            'saude_atividades' => array_merge($camposPadrao, [
                ['key' => 'distancia', 'label' => 'Distância'],
                ['key' => 'duracao', 'label' => 'Duração'],
                ['key' => 'calorias', 'label' => 'Calorias'],
                ['key' => 'intensidade', 'label' => 'Intensidade'],
                ['key' => 'fonte', 'label' => 'Fonte'],
            ]),
            'saude_metas' => array_merge($camposPadrao, [
                ['key' => 'tipo', 'label' => 'Tipo'],
                ['key' => 'valor_alvo', 'label' => 'Valor alvo'],
                ['key' => 'periodo', 'label' => 'Período'],
                ['key' => 'data_fim', 'label' => 'Fim'],
            ]),
            'financeiro_transacoes' => array_merge($camposPadrao, [
                ['key' => 'valor', 'label' => 'Valor'],
                ['key' => 'tipo', 'label' => 'Tipo'],
                ['key' => 'conta', 'label' => 'Conta'],
                ['key' => 'forma_pagamento', 'label' => 'Forma'],
            ]),
            'financeiro_contas' => array_merge($camposPadrao, [
                ['key' => 'instituicao', 'label' => 'Instituição'],
                ['key' => 'saldo_inicial', 'label' => 'Saldo inicial'],
                ['key' => 'saldo_atual', 'label' => 'Saldo atual'],
            ]),
            'financeiro_metas_economia' => array_merge($camposPadrao, [
                ['key' => 'valor_alvo', 'label' => 'Valor alvo'],
                ['key' => 'valor_atual', 'label' => 'Valor atual'],
                ['key' => 'periodicidade', 'label' => 'Periodicidade'],
            ]),
            'financeiro_bens' => array_merge($camposPadrao, [
                ['key' => 'valor_bem', 'label' => 'Valor do bem'],
                ['key' => 'valor_guardado', 'label' => 'Valor guardado'],
                ['key' => 'valor_guardar_mes', 'label' => 'Guardar por mês'],
                ['key' => 'meses_planejados', 'label' => 'Meses'],
            ]),
        ];
    }
}
