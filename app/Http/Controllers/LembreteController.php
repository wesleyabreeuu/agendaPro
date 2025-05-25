<?php

namespace App\Http\Controllers;

use App\Models\Lembrete;
use App\Models\Compromisso;
use Illuminate\Http\Request;

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
}
