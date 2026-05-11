<?php

namespace App\Http\Controllers;

use App\Models\Compromisso;
use App\Models\Categoria;
use App\Models\ScheduledMessage;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CompromissoController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(): Response
    {
        $user = Auth::user();

        $compromissos = Compromisso::with(['categoria', 'owner', 'compartilhamentos.usuario'])
            ->where('usuarios_id', Auth::id())
            ->orderBy('data_inicio')
            ->get();

        $compromissosCompartilhados = $user->sharedCompromissos()
            ->with(['categoria', 'owner', 'compartilhamentos.usuario'])
            ->orderBy('data_inicio')
            ->get();

        $categorias = Categoria::ownedBy(Auth::id())
            ->orderBy('nome')
            ->get();

        return Inertia::render('Compromissos/Index', [
            'compromissos' => $compromissos->map(fn (Compromisso $compromisso) => $this->serializeCompromisso($compromisso, $user))->values()->all(),
            'compromissosCompartilhados' => $compromissosCompartilhados->map(fn (Compromisso $compromisso) => $this->serializeCompromisso($compromisso, $user))->values()->all(),
            'categorias' => $categorias->map(fn (Categoria $categoria) => [
                'id' => $categoria->id,
                'nome' => $categoria->nome,
            ])->values()->all(),
        ]);
    }

    public function create(): Response
    {
        $categorias = Categoria::ownedBy(Auth::id())
            ->orderBy('nome')
            ->get();

        return Inertia::render('Compromissos/Form', [
            'modo' => 'create',
            'compromisso' => null,
            'categorias' => $categorias->map(fn (Categoria $categoria) => [
                'id' => $categoria->id,
                'nome' => $categoria->nome,
            ])->values()->all(),
            'leadTimeOptions' => $this->leadTimeOptions(),
        ]);
    }

    public function edit($id): Response
    {
        $compromisso = Compromisso::with(['categoria', 'owner', 'compartilhamentos.usuario'])->findOrFail($id);
        $this->authorize('update', $compromisso);
        $categorias = Categoria::ownedBy($compromisso->usuarios_id)
            ->orderBy('nome')
            ->get();
        return Inertia::render('Compromissos/Form', [
            'modo' => 'edit',
            'compromisso' => $this->serializeCompromissoForm($compromisso),
            'categorias' => $categorias->map(fn (Categoria $categoria) => [
                'id' => $categoria->id,
                'nome' => $categoria->nome,
            ])->values()->all(),
            'leadTimeOptions' => $this->leadTimeOptions(),
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::check()) {
            abort(403, 'Usuário não autenticado');
        }

        $request->validate(
            $this->rules(),
            $this->messages()
        );

        $dados = $request->all();
        if (!empty($dados['categoria_id'])) {
            Categoria::ownedBy(Auth::id())->findOrFail($dados['categoria_id']);
        }
        $dados['usuarios_id'] = Auth::id();
        $dados['dia_inteiro'] = $request->has('dia_inteiro');

        $compromisso = Compromisso::create($dados);

        // agenda lembrete deste compromisso (se veio lead_time e telefone)
        $lead = $request->filled('lead_time') ? (int)$request->input('lead_time') : null;
        if (!is_null($lead) && !empty($compromisso->telefone)) {
            $this->scheduleReminder($compromisso, $lead);
        }

        // cria recorrências e agenda lembretes para cada uma (se aplicável)
        if ($request->filled('recorrencia') && $request->filled('data_fim_recorrencia')) {
            $this->criarRecorrencias($compromisso, $lead);
        }

        return redirect()->route('compromissos.index')->with('success', 'Compromisso cadastrado com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $compromisso = Compromisso::with('compartilhamentos')->findOrFail($id);
        $this->authorize('update', $compromisso);
        $isOwner = $compromisso->isOwnedBy(Auth::user());

        $rules = $this->rules();
        $rules['cancelar_lembrete'] = 'nullable|boolean';

        $request->validate(
            $rules,
            $this->messages()
        );

        if ($request->filled('categoria_id')) {
            Categoria::ownedBy($compromisso->usuarios_id)->findOrFail($request->categoria_id);
        }

        $compromisso->update([
            'categoria_id'          => $request->categoria_id,
            'titulo'                => $request->titulo,
            'descricao'             => $request->descricao,
            'data_inicio'           => $request->data_inicio,
            'data_fim'              => $request->data_fim,
            'dia_inteiro'           => $request->has('dia_inteiro'),
            'recorrencia'           => $request->recorrencia,
            'recorrencia_intervalo' => $request->recorrencia_intervalo,
            'data_fim_recorrencia'  => $request->data_fim_recorrencia,
            'telefone'              => $isOwner ? $request->telefone : $compromisso->telefone,
        ]);

        $compromisso->lembretes()->update(['notificado_em' => null]);

        // cancelar lembrete pendente (se solicitado)
        if ($request->boolean('cancelar_lembrete')) {
            ScheduledMessage::whereMorphedTo('related', $compromisso)
                ->where('status', 'pending')
                ->update(['status' => 'canceled']);
        }

        // reprogramar/criar lembrete se lead_time informado
        if ($request->filled('lead_time')) {
            $lead = (int)$request->input('lead_time');

            if (!empty($compromisso->telefone)) {
                $tz = 'America/Sao_Paulo';
                $startsAt = Carbon::parse($compromisso->data_inicio, $tz);
                $whenUtc  = $startsAt->copy()->subMinutes($lead)->timezone('UTC');
                if ($whenUtc->isPast()) $whenUtc = now();

                $count = ScheduledMessage::whereMorphedTo('related', $compromisso)
                    ->where('status','pending')
                    ->update(['scheduled_at' => $whenUtc]);

                if ($count === 0) {
                    // se não havia pendente, cria uma nova
                    $this->scheduleReminder($compromisso, $lead);
                }
            }
        }

        return redirect()->route('compromissos.index')
            ->with('success', 'Compromisso atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $compromisso = Compromisso::with('compartilhamentos')->findOrFail($id);
        $this->authorize('delete', $compromisso);

        // cancela lembretes pendentes antes de excluir
        ScheduledMessage::whereMorphedTo('related', $compromisso)
            ->where('status','pending')
            ->update(['status' => 'canceled']);

        $compromisso->delete();

        return redirect()->route('compromissos.index')
            ->with('success', 'Compromisso removido com sucesso!');
    }

    private function criarRecorrencias(Compromisso $compromisso, ?int $leadMinutes = null): void
    {
        $dataAtual = Carbon::parse($compromisso->data_inicio);
        $dataFimRecorrencia = Carbon::parse($compromisso->data_fim_recorrencia)->endOfDay();
        $intervalo = max(1, (int) ($compromisso->recorrencia_intervalo ?: 1));
        $duracaoMinutos = $compromisso->data_fim
            ? $dataAtual->diffInMinutes(Carbon::parse($compromisso->data_fim), false)
            : null;

        while (true) {
            switch ($compromisso->recorrencia) {
                case 'diaria':
                    $dataAtual = $dataAtual->copy()->addDays($intervalo);
                    break;
                case 'semanal':
                    $dataAtual = $dataAtual->copy()->addWeeks($intervalo);
                    break;
                case 'mensal':
                    $dataAtual = $dataAtual->copy()->addMonths($intervalo);
                    break;
                default:
                    return;
            }

            if ($dataAtual->gt($dataFimRecorrencia)) break;

            $novo = Compromisso::create([
                'usuarios_id'  => $compromisso->usuarios_id,
                'categoria_id' => $compromisso->categoria_id,
                'titulo'       => $compromisso->titulo,
                'descricao'    => $compromisso->descricao,
                'data_inicio'  => $dataAtual,
                'data_fim'     => !is_null($duracaoMinutos) ? $dataAtual->copy()->addMinutes($duracaoMinutos) : null,
                'dia_inteiro'  => $compromisso->dia_inteiro,
                'telefone'     => $compromisso->telefone,
                'recorrencia'  => null, // as instâncias geradas normalmente não continuam recorrentes
            ]);

            if (!is_null($leadMinutes) && !empty($novo->telefone)) {
                $this->scheduleReminder($novo, $leadMinutes);
            }
        }
    }

    /* ===================== Helpers ===================== */

    private function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'categoria_id' => 'nullable|exists:categorias,id',
            'descricao' => 'nullable|string',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'dia_inteiro' => 'nullable|boolean',
            'recorrencia' => 'nullable|in:diaria,semanal,mensal',
            'recorrencia_intervalo' => 'nullable|integer|min:1',
            'data_fim_recorrencia' => [
                'nullable',
                'date',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $dataInicio = request()->input('data_inicio');

                    if (empty($value) || empty($dataInicio)) {
                        return;
                    }

                    $inicio = Carbon::parse($dataInicio)->startOfDay();
                    $fim = Carbon::parse($value)->startOfDay();

                    if ($fim->lt($inicio)) {
                        $fail('A data final da repetição deve ser igual ou posterior à data de início.');
                    }
                },
            ],
            'telefone' => 'nullable|string|max:20',
            'lead_time' => 'nullable|integer|in:0,15,30,60,120,1440',
        ];
    }

    private function messages(): array
    {
        return [
            'titulo.required' => 'Informe o título do compromisso.',
            'titulo.max' => 'O título pode ter no máximo 255 caracteres.',
            'categoria_id.exists' => 'A categoria selecionada é inválida.',
            'descricao.string' => 'A descrição informada é inválida.',
            'data_inicio.required' => 'Informe a data de início.',
            'data_inicio.date' => 'Informe uma data de início válida.',
            'data_fim.date' => 'Informe uma data final válida.',
            'data_fim.after_or_equal' => 'A data final deve ser igual ou posterior à data de início.',
            'recorrencia.in' => 'A recorrência selecionada é inválida.',
            'recorrencia_intervalo.integer' => 'O intervalo da recorrência deve ser um número inteiro.',
            'recorrencia_intervalo.min' => 'O intervalo da recorrência deve ser de pelo menos 1.',
            'data_fim_recorrencia.date' => 'Informe uma data válida para o fim da repetição.',
            'telefone.max' => 'O telefone pode ter no máximo 20 caracteres.',
            'lead_time.in' => 'O horário do lembrete selecionado é inválido.',
        ];
    }

    private function normalizePhone(?string $phone): ?string
    {
        if (empty($phone)) return null;
        $digits = preg_replace('/\D+/', '', $phone);
        if (!$digits) return null;

        // Se já começa com 55, mantém; se tiver 10/11 dígitos, prefixa 55 (ajuste simples)
        if (str_starts_with($digits, '55')) return $digits;
        if (strlen($digits) >= 10 && strlen($digits) <= 11) return '55'.$digits;

        return $digits; // fallback
    }

    private function buildReminderMessage(Compromisso $c): string
    {
        $tz   = 'America/Sao_Paulo';
        $data = Carbon::parse($c->data_inicio, $tz);
        $quando = $c->dia_inteiro
            ? $data->format('d/m/Y')
            : $data->format('d/m/Y H:i');

        return "Olá! Lembrete do compromisso: {$c->titulo} em {$quando}.";
    }

    private function scheduleReminder(Compromisso $c, int $leadMinutes): void
    {
        $phone = $this->normalizePhone($c->telefone);
        if (!$phone) return;

        $tz       = 'America/Sao_Paulo';
        $startsAt = Carbon::parse($c->data_inicio, $tz);
        $whenUtc  = $startsAt->copy()->subMinutes($leadMinutes)->timezone('UTC');
        if ($whenUtc->isPast()) $whenUtc = now();

        ScheduledMessage::create([
            'related_type' => Compromisso::class,
            'related_id'   => $c->id,
            'user_id'      => $c->usuarios_id,
            'recipient'    => $phone,
            'message'      => $this->buildReminderMessage($c),
            'scheduled_at' => $whenUtc,
            'timezone'     => $tz,
            'status'       => 'pending',
        ]);
    }

    public function calendario(): Response
    {
        return Inertia::render('Compromissos/Calendario');
    }

    public function calendarioEventos(Request $request): JsonResponse
    {
        $inicio = $request->filled('start') ? Carbon::parse($request->start) : now()->startOfMonth();
        $fim = $request->filled('end') ? Carbon::parse($request->end) : now()->endOfMonth();
        $userId = Auth::id();
        $user = Auth::user();

        $compromissos = Compromisso::with(['categoria', 'owner', 'compartilhamentos'])
            ->where(function ($query) use ($userId) {
                $query->where('usuarios_id', $userId)
                    ->orWhereHas('compartilhamentos', fn ($shareQuery) => $shareQuery->where('usuario_id', $userId));
            })
            ->where('data_inicio', '<=', $fim)
            ->where(function ($query) use ($inicio) {
                $query->whereNull('data_fim')
                    ->orWhere('data_fim', '>=', $inicio);
            })
            ->get()
            ->map(function (Compromisso $compromisso) use ($user) {
                $permissao = $compromisso->isOwnedBy($user) ? 'owner' : $compromisso->sharedPermissionFor($user);

                return [
                    'id' => 'compromisso-'.$compromisso->id,
                    'title' => $compromisso->titulo,
                    'start' => $compromisso->data_inicio?->toIso8601String(),
                    'end' => $compromisso->data_fim?->toIso8601String(),
                    'allDay' => (bool) $compromisso->dia_inteiro,
                    'backgroundColor' => $permissao === 'owner' ? '#1f6feb' : '#7c3aed',
                    'borderColor' => $permissao === 'owner' ? '#1f6feb' : '#7c3aed',
                    'extendedProps' => [
                        'tipo' => 'compromisso',
                        'descricao' => $compromisso->descricao,
                        'categoria' => $compromisso->categoria->nome ?? 'Sem categoria',
                        'editUrl' => in_array($permissao, ['owner', 'editar'], true) ? route('compromissos.edit', $compromisso->id) : null,
                        'owner' => $compromisso->owner?->name,
                        'permissao' => $permissao,
                    ],
                ];
            });

        $tarefas = Todo::ownedBy($userId)
            ->whereBetween('data', [$inicio->toDateString(), $fim->toDateString()])
            ->get()
            ->map(function (Todo $todo) {
                $start = Carbon::parse($todo->data->format('Y-m-d').' '.$todo->hora);

                return [
                    'id' => 'todo-'.$todo->id,
                    'title' => $todo->descricao,
                    'start' => $start->toIso8601String(),
                    'allDay' => false,
                    'backgroundColor' => '#15803d',
                    'borderColor' => '#15803d',
                    'extendedProps' => [
                        'tipo' => 'todo',
                        'descricao' => 'Tarefa do ToDo com urgência '.mb_strtoupper($todo->urgencia).'.',
                        'categoria' => 'ToDo',
                        'editUrl' => route('todo.edit', $todo->id),
                    ],
                ];
            });

        return response()->json($compromissos->concat($tarefas)->values());
    }

    private function serializeCompromisso(Compromisso $compromisso, User $user): array
    {
        $fimRecorrencia = $compromisso->data_fim_recorrencia ? Carbon::parse($compromisso->data_fim_recorrencia) : null;
        $permissao = $compromisso->isOwnedBy($user) ? 'owner' : $compromisso->sharedPermissionFor($user);
        $isOwner = $permissao === 'owner';
        $termino = $compromisso->data_fim ?? $compromisso->data_inicio;

        return [
            'id' => $compromisso->id,
            'titulo' => $compromisso->titulo,
            'descricao' => $compromisso->descricao,
            'categoria' => $compromisso->categoria?->nome,
            'categoria_id' => $compromisso->categoria_id,
            'data_inicio' => $compromisso->data_inicio?->format('d/m/Y H:i'),
            'data_fim' => $compromisso->data_fim?->format('d/m/Y H:i'),
            'ja_aconteceu' => $termino ? Carbon::parse($termino)->isPast() : false,
            'dia_inteiro' => (bool) $compromisso->dia_inteiro,
            'telefone' => $isOwner ? $compromisso->telefone : null,
            'recorrencia' => $compromisso->recorrencia,
            'recorrencia_intervalo' => $compromisso->recorrencia_intervalo,
            'data_fim_recorrencia' => $fimRecorrencia?->format('d/m/Y'),
            'owner' => [
                'id' => $compromisso->owner?->id ?? $compromisso->usuarios_id,
                'nome' => $compromisso->owner?->name,
            ],
            'permissao' => $permissao,
            'pode_editar' => in_array($permissao, ['owner', 'editar'], true),
            'pode_excluir' => $permissao === 'owner',
            'pode_compartilhar' => $permissao === 'owner',
            'compartilhado_com' => $isOwner
                ? $compromisso->compartilhamentos
                    ->map(fn ($compartilhamento) => [
                        'usuario_id' => $compartilhamento->usuario_id,
                        'nome' => $compartilhamento->usuario?->name,
                        'email_masked' => $this->maskEmail($compartilhamento->usuario?->email),
                        'permissao' => $compartilhamento->permissao,
                    ])
                    ->values()
                    ->all()
                : [],
        ];
    }

    private function serializeCompromissoForm(Compromisso $compromisso): array
    {
        $fimRecorrencia = $compromisso->data_fim_recorrencia ? Carbon::parse($compromisso->data_fim_recorrencia) : null;
        $user = Auth::user();
        $permissao = $compromisso->isOwnedBy($user) ? 'owner' : $compromisso->sharedPermissionFor($user);
        $isOwner = $permissao === 'owner';

        return [
            'id' => $compromisso->id,
            'titulo' => $compromisso->titulo,
            'descricao' => $compromisso->descricao,
            'categoria_id' => $compromisso->categoria_id,
            'data_inicio' => $compromisso->data_inicio?->format('Y-m-d\TH:i'),
            'data_fim' => $compromisso->data_fim?->format('Y-m-d\TH:i'),
            'dia_inteiro' => (bool) $compromisso->dia_inteiro,
            'telefone' => $isOwner ? $compromisso->telefone : null,
            'recorrencia' => $compromisso->recorrencia,
            'recorrencia_intervalo' => $compromisso->recorrencia_intervalo,
            'data_fim_recorrencia' => $fimRecorrencia?->format('Y-m-d'),
            'lead_time' => '',
            'owner' => [
                'id' => $compromisso->owner?->id ?? $compromisso->usuarios_id,
                'nome' => $compromisso->owner?->name,
            ],
            'permissao' => $permissao,
            'pode_compartilhar' => $permissao === 'owner',
            'compartilhado_com' => $isOwner
                ? $compromisso->compartilhamentos
                    ->map(fn ($compartilhamento) => [
                        'usuario_id' => $compartilhamento->usuario_id,
                        'nome' => $compartilhamento->usuario?->name,
                        'email_masked' => $this->maskEmail($compartilhamento->usuario?->email),
                        'permissao' => $compartilhamento->permissao,
                    ])
                    ->values()
                    ->all()
                : [],
        ];
    }

    private function maskEmail(?string $email): ?string
    {
        if (!$email || !str_contains($email, '@')) {
            return null;
        }

        [$name, $domain] = explode('@', $email, 2);
        $prefix = mb_substr($name, 0, 2);

        return $prefix . str_repeat('*', max(mb_strlen($name) - 2, 1)) . '@' . $domain;
    }

    private function leadTimeOptions(): array
    {
        return [
            ['value' => '', 'label' => 'Não enviar'],
            ['value' => '0', 'label' => 'Na hora'],
            ['value' => '15', 'label' => '15 minutos antes'],
            ['value' => '30', 'label' => '30 minutos antes'],
            ['value' => '60', 'label' => '1 hora antes'],
            ['value' => '120', 'label' => '2 horas antes'],
            ['value' => '1440', 'label' => '1 dia antes'],
        ];
    }
}
