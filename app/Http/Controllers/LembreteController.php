<?php

namespace App\Http\Controllers;

use App\Models\Compromisso;
use App\Models\Lembrete;
use App\Services\ReminderDispatchService;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LembreteController extends Controller
{
    public function index()
    {
        $lembretes = Lembrete::with('compromisso')
            ->ownedBy(Auth::id())
            ->orderByDesc('created_at')
            ->get();

        $proximos = $lembretes
            ->filter(fn (Lembrete $lembrete) => $lembrete->ativo && $lembrete->momento_disparo)
            ->sortBy(fn (Lembrete $lembrete) => $lembrete->momento_disparo)
            ->take(5)
            ->values();

        return Inertia::render('Lembretes/Index', [
            'lembretes' => $lembretes->map(fn (Lembrete $lembrete) => [
                'id' => $lembrete->id,
                'titulo_exibicao' => $lembrete->titulo_exibicao,
                'descricao_exibicao' => $lembrete->descricao_exibicao,
                'categoria' => $lembrete->categoria,
                'origem' => $lembrete->compromisso_id ? 'Compromisso' : 'Personalizado',
                'recorrencia' => $lembrete->recorrencia ? ucfirst(str_replace('_', ' ', $lembrete->recorrencia)) : null,
                'momento_disparo' => optional($lembrete->momento_disparo)?->format('d/m/Y H:i'),
                'ativo' => $lembrete->ativo,
            ])->values()->all(),
            'proximos' => $proximos->map(fn (Lembrete $lembrete) => [
                'id' => $lembrete->id,
                'titulo_exibicao' => $lembrete->titulo_exibicao,
                'descricao_exibicao' => $lembrete->descricao_exibicao,
                'momento_disparo' => optional($lembrete->momento_disparo)?->format('d/m/Y H:i'),
            ])->values()->all(),
        ]);
    }

    public function create()
    {
        $compromissos = $this->compromissosDoUsuario();
        $diasSemana = $this->diasSemana();

        return Inertia::render('Lembretes/Form', [
            'compromissos' => $compromissos->map(fn (Compromisso $compromisso) => [
                'id' => $compromisso->id,
                'label' => $compromisso->titulo . ' - ' . optional($compromisso->data_inicio)->format('d/m/Y H:i'),
            ])->values()->all(),
            'diasSemana' => $diasSemana,
        ]);
    }

    public function store(Request $request)
    {
        $payload = $this->validatedPayload($request);

        Lembrete::create($payload);

        return redirect()
            ->route('lembretes.index')
            ->with('success', 'Lembrete criado com sucesso.');
    }

    public function edit($id)
    {
        $lembrete = Lembrete::ownedBy(Auth::id())->findOrFail($id);
        $compromissos = $this->compromissosDoUsuario();
        $diasSemana = $this->diasSemana();

        return Inertia::render('Lembretes/Form', [
            'lembrete' => [
                'id' => $lembrete->id,
                'tipo' => $lembrete->tipo,
                'compromisso_id' => $lembrete->compromisso_id,
                'titulo' => $lembrete->titulo,
                'descricao' => $lembrete->descricao,
                'categoria' => $lembrete->categoria,
                'inicio_em' => $lembrete->inicio_em?->format('Y-m-d\TH:i'),
                'minutos_antes' => $lembrete->minutos_antes,
                'recorrencia' => $lembrete->recorrencia,
                'intervalo_recorrencia' => $lembrete->intervalo_recorrencia,
                'dias_semana' => $lembrete->dias_semana ?? [],
                'fim_recorrencia_em' => $lembrete->fim_recorrencia_em?->format('Y-m-d'),
                'ativo' => $lembrete->ativo,
            ],
            'compromissos' => $compromissos->map(fn (Compromisso $compromisso) => [
                'id' => $compromisso->id,
                'label' => $compromisso->titulo . ' - ' . optional($compromisso->data_inicio)->format('d/m/Y H:i'),
            ])->values()->all(),
            'diasSemana' => $diasSemana,
        ]);
    }

    public function update(Request $request, $id)
    {
        $lembrete = Lembrete::ownedBy(Auth::id())->findOrFail($id);
        $payload = $this->validatedPayload($request, $lembrete);

        $lembrete->update($payload);

        return redirect()
            ->route('lembretes.index')
            ->with('success', 'Lembrete atualizado com sucesso.');
    }

    public function destroy($id)
    {
        $lembrete = Lembrete::ownedBy(Auth::id())->findOrFail($id);
        $lembrete->delete();

        return redirect()
            ->route('lembretes.index')
            ->with('success', 'Lembrete removido com sucesso.');
    }

    public function enviarWhatsApp($id)
    {
        $lembrete = Lembrete::with('compromisso')
            ->ownedBy(Auth::id())
            ->findOrFail($id);

        $compromisso = $lembrete->compromisso;
        if (!$compromisso || !$compromisso->telefone) {
            return back()->with('error', 'Este lembrete nao possui telefone vinculado.');
        }

        $telefone = $compromisso->telefone;
        $quando = optional($lembrete->momento_disparo)?->format('d/m/Y H:i') ?? now()->format('d/m/Y H:i');
        $mensagem = "Lembrete: {$lembrete->titulo_exibicao}. Programado para {$quando}.";

        $whatsapp = new WhatsAppService();
        $resultado = $whatsapp->enviarMensagem($telefone, $mensagem);
        $sucesso = (bool) ($resultado['ok'] ?? false);

        return back()->with(
            $sucesso ? 'success' : 'error',
            $sucesso ? 'Mensagem enviada via WhatsApp.' : 'Falha ao enviar mensagem via WhatsApp. Verifique se o número está correto e possui conta ativa.'
        );
    }

    public function due(ReminderDispatchService $reminders): JsonResponse
    {
        $now = now();
        $lembretes = $reminders->due(Auth::id(), $now);

        if ($lembretes->isEmpty()) {
            return response()->json([]);
        }

        $payloads = $lembretes->map(fn (Lembrete $lembrete) => $reminders->payload($lembrete))->values();

        foreach ($lembretes as $lembrete) {
            $reminders->acknowledge($lembrete, $now);
        }

        return response()->json($payloads);
    }

    private function validatedPayload(Request $request, ?Lembrete $lembrete = null): array
    {
        $validated = $request->validate([
            'tipo' => 'required|in:compromisso,personalizado',
            'compromisso_id' => 'nullable|integer',
            'titulo' => 'nullable|string|max:255',
            'descricao' => 'nullable|string|max:1000',
            'categoria' => 'nullable|string|max:100',
            'inicio_em' => 'nullable|date',
            'minutos_antes' => 'nullable|integer|min:0|max:10080',
            'recorrencia' => 'nullable|in:diaria,semanal,mensal,dias_semana',
            'intervalo_recorrencia' => 'nullable|integer|min:1|max:365',
            'dias_semana' => 'nullable|array',
            'dias_semana.*' => 'integer|between:0,6',
            'fim_recorrencia_em' => 'nullable|date',
            'ativo' => 'nullable|boolean',
        ]);

        $tipo = $validated['tipo'];
        if ($tipo === 'compromisso') {
            if (empty($validated['compromisso_id'])) {
                throw ValidationException::withMessages([
                    'compromisso_id' => 'Selecione um compromisso para esse tipo de lembrete.',
                ]);
            }

            $compromisso = Compromisso::where('usuarios_id', Auth::id())
                ->findOrFail($validated['compromisso_id'] ?? 0);

            return [
                'user_id' => Auth::id(),
                'tipo' => 'compromisso',
                'compromisso_id' => $compromisso->id,
                'titulo' => $compromisso->titulo,
                'descricao' => $compromisso->descricao,
                'categoria' => 'agenda',
                'inicio_em' => $compromisso->data_inicio,
                'proxima_execucao_em' => null,
                'recorrencia' => null,
                'intervalo_recorrencia' => null,
                'dias_semana' => null,
                'fim_recorrencia_em' => null,
                'ativo' => $request->boolean('ativo', true),
                'minutos_antes' => (int) ($validated['minutos_antes'] ?? ($lembrete->minutos_antes ?? 15)),
                'notificado_em' => null,
                'ultima_execucao_em' => null,
            ];
        }

        if (empty($validated['titulo'])) {
            throw ValidationException::withMessages([
                'titulo' => 'Informe um titulo para o lembrete personalizado.',
            ]);
        }

        if (empty($validated['inicio_em'])) {
            throw ValidationException::withMessages([
                'inicio_em' => 'Informe data e horario para o lembrete personalizado.',
            ]);
        }

        $inicio = Carbon::parse($validated['inicio_em'] ?? now());
        $recorrencia = $validated['recorrencia'] ?? null;

        return [
            'user_id' => Auth::id(),
            'tipo' => 'personalizado',
            'compromisso_id' => null,
            'titulo' => $validated['titulo'] ?: 'Lembrete personalizado',
            'descricao' => $validated['descricao'] ?? null,
            'categoria' => $validated['categoria'] ?? 'pessoal',
            'inicio_em' => $inicio,
            'proxima_execucao_em' => $lembrete?->isStandalone() && $lembrete->proxima_execucao_em
                ? $inicio->copy()
                : $inicio->copy(),
            'recorrencia' => $recorrencia,
            'intervalo_recorrencia' => $recorrencia ? (int) ($validated['intervalo_recorrencia'] ?? 1) : null,
            'dias_semana' => $recorrencia === 'dias_semana'
                ? collect($validated['dias_semana'] ?? [])->map(fn ($dia) => (int) $dia)->sort()->values()->all()
                : null,
            'fim_recorrencia_em' => $validated['fim_recorrencia_em'] ?? null,
            'ativo' => $request->boolean('ativo', true),
            'minutos_antes' => 0,
            'notificado_em' => null,
            'ultima_execucao_em' => null,
        ];
    }

    private function compromissosDoUsuario()
    {
        return Compromisso::where('usuarios_id', Auth::id())
            ->orderBy('data_inicio')
            ->get();
    }

    private function diasSemana(): array
    {
        return [
            0 => 'Domingo',
            1 => 'Segunda',
            2 => 'Terca',
            3 => 'Quarta',
            4 => 'Quinta',
            5 => 'Sexta',
            6 => 'Sabado',
        ];
    }
}
