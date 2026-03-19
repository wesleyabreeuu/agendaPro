<?php

namespace App\Http\Controllers;

use App\Models\Lembrete;
use App\Models\Compromisso;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LembreteController extends Controller
{
    public function index()
    {
        $lembretes = Lembrete::with('compromisso')
            ->whereHas('compromisso', function ($query) {
                $query->where('usuarios_id', Auth::id());
            })
            ->orderByDesc('created_at')
            ->get();

        $proximos = Lembrete::with('compromisso')
            ->whereNull('notificado_em')
            ->whereHas('compromisso', function ($query) {
                $query->where('usuarios_id', Auth::id())
                    ->where('data_inicio', '>=', now()->subDay());
            })
            ->get()
            ->sortBy(function (Lembrete $lembrete) {
                return Carbon::parse($lembrete->compromisso->data_inicio)->subMinutes($lembrete->minutos_antes);
            })
            ->take(5);

        return view('lembretes.index', compact('lembretes', 'proximos'));
    }

    public function create()
    {
        $compromissos = Compromisso::where('usuarios_id', Auth::id())
            ->orderBy('data_inicio')
            ->get();
        return view('lembretes.crud', compact('compromissos'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'compromisso_id' => 'required|exists:compromissos,id',
            'minutos_antes' => 'required|integer|min:1',
        ]);

        $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($request->compromisso_id);

        Lembrete::create([
            'compromisso_id' => $compromisso->id,
            'minutos_antes' => $request->minutos_antes,
            'notificado_em' => null,
        ]);

        return redirect()->route('lembretes.index')->with('success', 'Lembrete criado com sucesso!');
    }

    public function edit($id)
    {
        $lembrete = Lembrete::whereHas('compromisso', function ($query) {
            $query->where('usuarios_id', Auth::id());
        })->findOrFail($id);

        $compromissos = Compromisso::where('usuarios_id', Auth::id())
            ->orderBy('data_inicio')
            ->get();

        return view('lembretes.crud', compact('lembrete', 'compromissos'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'compromisso_id' => 'required|exists:compromissos,id',
            'minutos_antes' => 'required|integer|min:1',
        ]);

        $lembrete = Lembrete::whereHas('compromisso', function ($query) {
            $query->where('usuarios_id', Auth::id());
        })->findOrFail($id);

        $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($request->compromisso_id);

        $lembrete->update([
            'compromisso_id' => $compromisso->id,
            'minutos_antes' => $request->minutos_antes,
            'notificado_em' => null,
        ]);

        return redirect()->route('lembretes.index')->with('success', 'Lembrete atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $lembrete = Lembrete::whereHas('compromisso', function ($query) {
            $query->where('usuarios_id', Auth::id());
        })->findOrFail($id);

        $lembrete->delete();
        return redirect()->route('lembretes.index')->with('success', 'Lembrete removido com sucesso!');
    }

    public function enviarWhatsApp($id)
    {
        $lembrete = Lembrete::with('compromisso')
            ->whereHas('compromisso', function ($query) {
                $query->where('usuarios_id', Auth::id());
            })
            ->findOrFail($id);
        $compromisso = $lembrete->compromisso;

        if (!$compromisso || !$compromisso->telefone) {
            return back()->with('error', 'Compromisso sem telefone cadastrado.');
        }

        $telefone = $compromisso->telefone;

        $data = \Carbon\Carbon::parse($compromisso->data_inicio)->format('d/m/Y H:i');
        $mensagem = "Olá! Lembrete: seu compromisso '{$compromisso->titulo}' está agendado para {$data}.";

        \Log::info("Enviando mensagem para {$telefone}: {$mensagem}");

        $whatsapp = new WhatsAppService();
        $resultado = $whatsapp->enviarMensagem($telefone, $mensagem);

        if ($resultado) {
            return back()->with('success', 'Mensagem enviada via WhatsApp!');
        } else {
            return back()->with('error', 'Falha ao enviar mensagem WhatsApp.');
        }
    }

    public function due(): JsonResponse
    {
        $now = now();

        $lembretes = Lembrete::with('compromisso')
            ->whereNull('notificado_em')
            ->whereHas('compromisso', function ($query) {
                $query->where('usuarios_id', Auth::id());
            })
            ->get()
            ->filter(function (Lembrete $lembrete) use ($now) {
                if (!$lembrete->compromisso || !$lembrete->compromisso->data_inicio) {
                    return false;
                }

                return Carbon::parse($lembrete->compromisso->data_inicio)
                    ->subMinutes($lembrete->minutos_antes)
                    ->lessThanOrEqualTo($now);
            })
            ->values();

        if ($lembretes->isEmpty()) {
            return response()->json([]);
        }

        Lembrete::whereIn('id', $lembretes->pluck('id'))
            ->update(['notificado_em' => $now]);

        return response()->json($lembretes->map(function (Lembrete $lembrete) {
            $compromisso = $lembrete->compromisso;
            $inicio = Carbon::parse($compromisso->data_inicio)->format('d/m/Y H:i');

            return [
                'id' => $lembrete->id,
                'titulo' => $compromisso->titulo,
                'mensagem' => "Seu compromisso \"{$compromisso->titulo}\" começa em breve.",
                'quando' => $inicio,
                'url' => route('compromissos.edit', $compromisso->id),
            ];
        })->values());
    }


}
