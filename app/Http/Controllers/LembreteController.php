<?php

namespace App\Http\Controllers;

use App\Models\Lembrete;
use App\Models\Compromisso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Services\WhatsAppService;

class LembreteController extends Controller
{
    public function index()
    {
        $lembretes = Lembrete::with('compromisso')->get();
        return view('lembretes.index', compact('lembretes'));
    }

    public function create()
    {
        $compromissos = Compromisso::all();
        return view('lembretes.crud', compact('compromissos'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'compromisso_id' => 'required|exists:compromissos,id',
            'minutos_antes' => 'required|integer|min:1',
        ]);

        Lembrete::create($request->all());
        return redirect()->route('lembretes.index')->with('success', 'Lembrete criado com sucesso!');
    }

    public function edit($id)
    {
        $lembrete = Lembrete::findOrFail($id);
        $compromissos = Compromisso::all();
        return view('lembretes.crud', compact('lembrete', 'compromissos'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'compromisso_id' => 'required|exists:compromissos,id',
            'minutos_antes' => 'required|integer|min:1',
        ]);

        $lembrete = Lembrete::findOrFail($id);
        $lembrete->update($request->all());
        return redirect()->route('lembretes.index')->with('success', 'Lembrete atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $lembrete = Lembrete::findOrFail($id);
        $lembrete->delete();
        return redirect()->route('lembretes.index')->with('success', 'Lembrete removido com sucesso!');
    }

    public function enviarWhatsApp($id)
    {
        $lembrete = Lembrete::with('compromisso')->findOrFail($id);
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


}
