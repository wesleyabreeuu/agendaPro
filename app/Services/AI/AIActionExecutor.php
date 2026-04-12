<?php

namespace App\Services\AI;

use App\Models\CategoriaFinanceira;
use App\Models\Compromisso;
use App\Models\ContaBancaria;
use App\Models\Lembrete;
use App\Models\MetaBemMaterial;
use App\Models\MetaEconomia;
use App\Models\Todo;
use App\Models\TransacaoFinanceira;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AIActionExecutor
{
    private const ALLOWED_ACTIONS = [
        'create_event',
        'create_reminder',
        'create_expense',
        'create_income',
        'create_income_goal',
        'create_asset_goal',
        'create_task',
        'list_events_today',
    ];

    private const CATEGORIAS_PADRAO = [
        'receita' => [
            ['nome' => 'Salário', 'icone' => 'fas fa-briefcase', 'cor' => '#27ae60'],
            ['nome' => 'Freelance', 'icone' => 'fas fa-laptop', 'cor' => '#2980b9'],
            ['nome' => 'Investimento', 'icone' => 'fas fa-chart-line', 'cor' => '#8e44ad'],
            ['nome' => 'Bônus', 'icone' => 'fas fa-gift', 'cor' => '#e74c3c'],
            ['nome' => 'Outros ganhos', 'icone' => 'fas fa-plus-circle', 'cor' => '#95a5a6'],
        ],
        'despesa' => [
            ['nome' => 'Mercado', 'icone' => 'fas fa-shopping-basket', 'cor' => '#e67e22'],
            ['nome' => 'Água', 'icone' => 'fas fa-tint', 'cor' => '#3498db'],
            ['nome' => 'Luz', 'icone' => 'fas fa-bolt', 'cor' => '#f39c12'],
            ['nome' => 'Internet', 'icone' => 'fas fa-wifi', 'cor' => '#8e44ad'],
            ['nome' => 'Moradia', 'icone' => 'fas fa-home', 'cor' => '#c0392b'],
            ['nome' => 'Transporte', 'icone' => 'fas fa-car', 'cor' => '#2980b9'],
            ['nome' => 'Saúde', 'icone' => 'fas fa-heartbeat', 'cor' => '#e74c3c'],
            ['nome' => 'Educação', 'icone' => 'fas fa-graduation-cap', 'cor' => '#9b59b6'],
            ['nome' => 'Assinaturas', 'icone' => 'fas fa-star', 'cor' => '#16a34a'],
            ['nome' => 'Outros gastos', 'icone' => 'fas fa-minus-circle', 'cor' => '#95a5a6'],
        ],
    ];

    public function isAllowedAction(string $action): bool
    {
        return in_array($action, self::ALLOWED_ACTIONS, true);
    }

    public function validate(string $action, array $data): array
    {
        if (!$this->isAllowedAction($action)) {
            throw new RuntimeException('A IA retornou uma acao invalida. Nenhuma operacao foi executada.');
        }

        $this->ensureOnlyAllowedFields($action, $data);

        $rules = match ($action) {
            'create_event' => [
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'date' => ['required', 'date_format:Y-m-d'],
                'time' => ['nullable', 'date_format:H:i'],
                'end_date' => ['nullable', 'date_format:Y-m-d'],
                'end_time' => ['nullable', 'date_format:H:i'],
                'all_day' => ['nullable', 'boolean'],
            ],
            'create_reminder' => [
                'title' => ['nullable', 'string', 'max:255'],
                'description' => ['required', 'string', 'max:1000'],
                'date' => ['required', 'date_format:Y-m-d'],
                'time' => ['nullable', 'date_format:H:i'],
            ],
            'create_expense', 'create_income' => [
                'description' => ['required', 'string', 'max:255'],
                'amount' => ['required', 'numeric', 'min:0.01'],
                'date' => ['required', 'date_format:Y-m-d'],
            ],
            'create_income_goal' => [
                'description' => ['nullable', 'string', 'max:255'],
                'target_amount' => ['required', 'numeric', 'min:0.01'],
                'deadline' => ['required', 'date_format:Y-m-d'],
            ],
            'create_asset_goal' => [
                'description' => ['required', 'string', 'max:255'],
                'target_amount' => ['required', 'numeric', 'min:0.01'],
            ],
            'create_task' => [
                'title' => ['required', 'string', 'max:255'],
                'date' => ['required', 'date_format:Y-m-d'],
                'time' => ['nullable', 'date_format:H:i'],
            ],
            'list_events_today' => [],
            default => throw new RuntimeException('Acao nao reconhecida para validacao.'),
        };

        $validator = Validator::make($data, $rules);

        if ($action === 'create_event') {
            $validator->after(function ($validator) use ($data): void {
                if (!empty($data['end_time']) && empty($data['time'])) {
                    $validator->errors()->add('time', 'O horario inicial e obrigatorio quando houver horario final.');
                }
            });
        }

        return $validator->validate();
    }

    public function execute(string $action, array $data, User $user): array
    {
        $this->authorizeAction($user, $action);

        return match ($action) {
            'create_event' => $this->createEvent($data, $user),
            'create_reminder' => $this->createReminder($data, $user),
            'create_expense' => $this->createTransaction('despesa', $data, $user),
            'create_income' => $this->createTransaction('receita', $data, $user),
            'create_income_goal' => $this->createIncomeGoal($data, $user),
            'create_asset_goal' => $this->createAssetGoal($data, $user),
            'create_task' => $this->createTask($data, $user),
            'list_events_today' => $this->listEventsToday($user),
            default => throw new RuntimeException('Acao nao permitida.'),
        };
    }

    private function createEvent(array $data, User $user): array
    {
        $allDay = (bool) ($data['all_day'] ?? empty($data['time']));
        $start = $this->buildDateTime($data['date'], $data['time'] ?? null, $allDay);
        $endDate = $data['end_date'] ?? $data['date'];

        if ($allDay) {
            $end = Carbon::parse($endDate, config('app.timezone'))->endOfDay();
        } else {
            $end = $this->buildDateTime($endDate, $data['end_time'] ?? null, false);

            if (empty($data['end_time'])) {
                $end->addHour();
            }
        }

        $compromisso = Compromisso::create([
            'usuarios_id' => $user->id,
            'categoria_id' => null,
            'titulo' => $data['title'],
            'descricao' => $data['description'] ?? null,
            'data_inicio' => $start,
            'data_fim' => $end,
            'dia_inteiro' => $allDay,
            'telefone' => null,
        ]);

        return [
            'id' => $compromisso->id,
            'title' => $compromisso->titulo,
            'description' => $compromisso->descricao,
            'date' => $compromisso->data_inicio?->format('Y-m-d'),
            'time' => $compromisso->dia_inteiro ? null : $compromisso->data_inicio?->format('H:i'),
            'all_day' => $compromisso->dia_inteiro,
        ];
    }

    private function createReminder(array $data, User $user): array
    {
        $start = $this->buildDateTime($data['date'], $data['time'] ?? null, empty($data['time']));
        $title = $data['title'] ?? $data['description'];
        $compromissoId = $this->resolveReminderCompromissoId($user, $title, $data['description'], $start);

        $lembrete = Lembrete::create([
            'user_id' => $user->id,
            'compromisso_id' => $compromissoId,
            'tipo' => 'personalizado',
            'titulo' => $title,
            'descricao' => $data['description'],
            'categoria' => 'assistente',
            'inicio_em' => $start,
            'proxima_execucao_em' => $start,
            'recorrencia' => null,
            'intervalo_recorrencia' => null,
            'dias_semana' => null,
            'fim_recorrencia_em' => null,
            'ativo' => true,
            'minutos_antes' => 0,
            'notificado_em' => null,
            'ultima_execucao_em' => null,
        ]);

        return [
            'id' => $lembrete->id,
            'title' => $lembrete->titulo,
            'description' => $lembrete->descricao,
            'date' => $lembrete->inicio_em?->format('Y-m-d'),
            'time' => $lembrete->inicio_em?->format('H:i'),
        ];
    }

    private function createTransaction(string $type, array $data, User $user): array
    {
        $this->ensureFinanceDefaults($user->id);

        $conta = ContaBancaria::query()
            ->where('user_id', $user->id)
            ->where('ativa', true)
            ->orderByDesc('id')
            ->firstOrFail();

        $categoria = CategoriaFinanceira::query()
            ->where('user_id', $user->id)
            ->where('tipo', $type)
            ->orderBy('id')
            ->firstOrFail();

        $status = $this->normalizeFinanceStatus($type);

        $transacao = TransacaoFinanceira::create([
            'user_id' => $user->id,
            'conta_bancaria_id' => $conta->id,
            'categoria_financeira_id' => $categoria->id,
            'tipo' => $type,
            'status' => $status,
            'forma_pagamento' => 'conta',
            'descricao' => $data['description'],
            'complemento' => null,
            'valor' => $data['amount'],
            'data' => $data['date'],
            'recorrente' => false,
            'frequencia' => null,
            'proxima_data' => null,
            'observacoes' => 'Lancamento criado pelo assistente de IA.',
        ]);

        if ($this->shouldImpactBalance($type, $status)) {
            $this->applyBalanceImpact($conta, $type, (float) $transacao->valor);
            $conta->refresh();
        }

        return [
            'id' => $transacao->id,
            'type' => $transacao->tipo,
            'description' => $transacao->descricao,
            'amount' => (float) $transacao->valor,
            'date' => $transacao->data?->format('Y-m-d'),
            'status' => $transacao->status,
            'account' => $conta->nome,
            'category' => $categoria->nome,
        ];
    }

    private function createIncomeGoal(array $data, User $user): array
    {
        $meta = MetaEconomia::create([
            'user_id' => $user->id,
            'titulo' => $data['description'] ?? 'Meta de economia',
            'descricao' => $data['description'] ?? 'Meta de economia criada pelo assistente.',
            'valor_alvo' => $data['target_amount'],
            'valor_atual' => 0,
            'periodicidade' => 'mes',
            'prazo_final' => $data['deadline'],
        ]);

        return [
            'id' => $meta->id,
            'description' => $meta->titulo,
            'target_amount' => (float) $meta->valor_alvo,
            'deadline' => $meta->prazo_final?->format('Y-m-d'),
        ];
    }

    private function createAssetGoal(array $data, User $user): array
    {
        $meta = MetaBemMaterial::create([
            'user_id' => $user->id,
            'nome_bem' => $data['description'],
            'descricao' => $data['description'],
            'valor_bem' => $data['target_amount'],
            'valor_ja_guardado' => 0,
            'valor_guardar_mes' => 0,
        ]);

        return [
            'id' => $meta->id,
            'description' => $meta->nome_bem,
            'target_amount' => (float) $meta->valor_bem,
        ];
    }

    private function createTask(array $data, User $user): array
    {
        $todo = Todo::create([
            'user_id' => $user->id,
            'data' => $data['date'],
            'hora' => $data['time'] ?? '09:00',
            'descricao' => $data['title'],
            'observacao' => null,
            'urgencia' => 'media',
            'status' => 'aguardando',
            'finalizado_em' => null,
        ]);

        return [
            'id' => $todo->id,
            'title' => $todo->descricao,
            'date' => $todo->data?->format('Y-m-d'),
            'time' => $todo->hora,
            'status' => $todo->status,
        ];
    }

    private function listEventsToday(User $user): array
    {
        $today = Carbon::now(config('app.timezone'))->toDateString();

        return Compromisso::query()
            ->where('usuarios_id', $user->id)
            ->whereDate('data_inicio', $today)
            ->orderBy('data_inicio')
            ->get()
            ->map(fn (Compromisso $compromisso) => [
                'id' => $compromisso->id,
                'title' => $compromisso->titulo,
                'description' => $compromisso->descricao,
                'date' => $compromisso->data_inicio?->format('Y-m-d'),
                'time' => $compromisso->dia_inteiro ? null : $compromisso->data_inicio?->format('H:i'),
                'all_day' => $compromisso->dia_inteiro,
            ])
            ->values()
            ->all();
    }

    private function authorizeAction(User $user, string $action): void
    {
        $module = match ($action) {
            'create_event', 'create_reminder', 'list_events_today' => 'compromissos',
            'create_task' => 'dia_a_dia',
            'create_expense', 'create_income', 'create_income_goal', 'create_asset_goal' => 'financeiro',
            default => null,
        };

        if ($module && !$user->hasModuleAccess($module)) {
            throw new AuthorizationException('Voce nao tem acesso ao modulo necessario para essa acao.');
        }
    }

    private function ensureOnlyAllowedFields(string $action, array $data): void
    {
        $allowedFields = match ($action) {
            'create_event' => ['title', 'description', 'date', 'time', 'end_date', 'end_time', 'all_day'],
            'create_reminder' => ['title', 'description', 'date', 'time'],
            'create_expense', 'create_income' => ['description', 'amount', 'date'],
            'create_income_goal' => ['description', 'target_amount', 'deadline'],
            'create_asset_goal' => ['description', 'target_amount'],
            'create_task' => ['title', 'date', 'time'],
            'list_events_today' => [],
            default => throw new RuntimeException('Acao nao reconhecida para whitelist de campos.'),
        };

        $unexpectedFields = array_diff(array_keys($data), $allowedFields);

        if ($unexpectedFields !== []) {
            throw ValidationException::withMessages([
                'data' => ['A IA retornou campos nao permitidos: ' . implode(', ', $unexpectedFields) . '.'],
            ]);
        }
    }

    private function buildDateTime(string $date, ?string $time, bool $allDay): Carbon
    {
        $dateTime = $allDay
            ? "{$date} 09:00"
            : sprintf('%s %s', $date, $time ?: '09:00');

        return Carbon::createFromFormat('Y-m-d H:i', $dateTime, config('app.timezone'));
    }

    private function ensureFinanceDefaults(int $userId): void
    {
        $this->ensureDefaultCategories($userId);
        $this->ensureDefaultAccount($userId);
    }

    private function ensureDefaultCategories(int $userId): void
    {
        if (CategoriaFinanceira::where('user_id', $userId)->exists()) {
            return;
        }

        foreach (self::CATEGORIAS_PADRAO as $tipo => $categorias) {
            foreach ($categorias as $categoria) {
                CategoriaFinanceira::create([
                    'user_id' => $userId,
                    'tipo' => $tipo,
                    'nome' => $categoria['nome'],
                    'icone' => $categoria['icone'],
                    'cor' => $categoria['cor'],
                ]);
            }
        }
    }

    private function ensureDefaultAccount(int $userId): void
    {
        if (ContaBancaria::where('user_id', $userId)->exists()) {
            return;
        }

        ContaBancaria::create([
            'user_id' => $userId,
            'nome' => 'Carteira',
            'instituicao' => 'Uso diario',
            'tipo' => 'dinheiro',
            'saldo_inicial' => 0,
            'saldo_atual' => 0,
            'ativa' => true,
        ]);
    }

    private function normalizeFinanceStatus(string $tipo): string
    {
        return $tipo === 'receita' ? 'recebido' : 'pago';
    }

    private function shouldImpactBalance(string $tipo, string $status): bool
    {
        return ($tipo === 'receita' && $status === 'recebido')
            || ($tipo === 'despesa' && $status === 'pago');
    }

    private function applyBalanceImpact(ContaBancaria $conta, string $tipo, float $valor): void
    {
        $delta = $tipo === 'receita' ? $valor : -$valor;

        $conta->increment('saldo_atual', $delta);
    }

    private function resolveReminderCompromissoId(User $user, string $title, string $description, Carbon $start): ?int
    {
        if (DB::getDriverName() !== 'sqlite') {
            return null;
        }

        $compromisso = Compromisso::create([
            'usuarios_id' => $user->id,
            'categoria_id' => null,
            'titulo' => $title,
            'descricao' => $description,
            'data_inicio' => $start,
            'data_fim' => (clone $start)->addHour(),
            'dia_inteiro' => false,
            'telefone' => null,
        ]);

        return $compromisso->id;
    }
}
