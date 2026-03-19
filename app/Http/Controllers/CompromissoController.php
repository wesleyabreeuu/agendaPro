<?php

namespace App\Http\Controllers;

use App\Models\Compromisso;
use App\Models\Categoria;
use App\Models\ScheduledMessage;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CompromissoController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $compromissos = Compromisso::with('categoria')
            ->where('usuarios_id', Auth::id())
            ->get();

        $categorias = Categoria::all();

        return view('compromissos.index', compact('compromissos', 'categorias'));
    }

    public function create()
    {
        $categorias = Categoria::all();
        $modo = 'create';
        $compromisso = new Compromisso();
        return view('compromissos.crud', compact('modo', 'compromisso', 'categorias'));
    }

    public function edit($id)
    {
        $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($id);
        $categorias = Categoria::all();
        $modo = 'edit';
        return view('compromissos.crud', compact('modo', 'compromisso', 'categorias'));
    }

    public function store(Request $request)
    {
        if (!Auth::check()) {
            abort(403, 'Usuário não autenticado');
        }

        $request->validate([
            'titulo'                  => 'required|string|max:255',
            'categoria_id'            => 'nullable|exists:categorias,id',
            'descricao'               => 'nullable|string',
            'data_inicio'             => 'required|date',
            'data_fim'                => 'nullable|date|after_or_equal:data_inicio',
            'dia_inteiro'             => 'nullable|boolean',
            'recorrencia'             => 'nullable|in:diaria,semanal,mensal',
            'recorrencia_intervalo'   => 'nullable|integer|min:1',
            'data_fim_recorrencia'    => 'nullable|date|after:data_inicio',
            'telefone'                => 'nullable|string|max:20',
            'lead_time'               => 'nullable|integer|in:0,15,30,60,120,1440',
        ]);

        $dados = $request->all();
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
        $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($id);

        $request->validate([
            'titulo'                  => 'required|string|max:255',
            'categoria_id'            => 'nullable|exists:categorias,id',
            'descricao'               => 'nullable|string',
            'data_inicio'             => 'required|date',
            'data_fim'                => 'nullable|date|after_or_equal:data_inicio',
            'dia_inteiro'             => 'nullable|boolean',
            'recorrencia'             => 'nullable|in:diaria,semanal,mensal',
            'recorrencia_intervalo'   => 'nullable|integer|min:1',
            'data_fim_recorrencia'    => 'nullable|date|after:data_inicio',
            'telefone'                => 'nullable|string|max:20',
            'lead_time'               => 'nullable|integer|in:0,15,30,60,120,1440',
            'cancelar_lembrete'       => 'nullable|boolean',
        ]);

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
            'telefone'              => $request->telefone,
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
        $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($id);

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
        $dataAtual          = Carbon::parse($compromisso->data_inicio);
        $dataFimRecorrencia = Carbon::parse($compromisso->data_fim_recorrencia);
        $intervalo          = $compromisso->recorrencia_intervalo ?? 1;

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
                'data_fim'     => $compromisso->data_fim
                    ? Carbon::parse($dataAtual)->addMinutes(
                        Carbon::parse($compromisso->data_fim)->diffInMinutes($compromisso->data_inicio)
                    )
                    : null,
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

    public function calendario()
    {
        return view('compromissos.calendario');
    }

    public function calendarioEventos(Request $request): JsonResponse
    {
        $inicio = $request->filled('start') ? Carbon::parse($request->start) : now()->startOfMonth();
        $fim = $request->filled('end') ? Carbon::parse($request->end) : now()->endOfMonth();
        $userId = Auth::id();

        $compromissos = Compromisso::with('categoria')
            ->where('usuarios_id', $userId)
            ->where('data_inicio', '<=', $fim)
            ->where(function ($query) use ($inicio) {
                $query->whereNull('data_fim')
                    ->orWhere('data_fim', '>=', $inicio);
            })
            ->get()
            ->map(function (Compromisso $compromisso) {
                return [
                    'id' => 'compromisso-'.$compromisso->id,
                    'title' => $compromisso->titulo,
                    'start' => $compromisso->data_inicio?->toIso8601String(),
                    'end' => $compromisso->data_fim?->toIso8601String(),
                    'allDay' => (bool) $compromisso->dia_inteiro,
                    'backgroundColor' => '#1f6feb',
                    'borderColor' => '#1f6feb',
                    'extendedProps' => [
                        'tipo' => 'compromisso',
                        'descricao' => $compromisso->descricao,
                        'categoria' => $compromisso->categoria->nome ?? 'Sem categoria',
                        'editUrl' => route('compromissos.edit', $compromisso->id),
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
}
