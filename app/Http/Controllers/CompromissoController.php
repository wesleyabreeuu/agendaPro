<?php

namespace App\Http\Controllers;

use App\Models\Compromisso;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompromissoController extends Controller
{
    public function __construct()
    {
        // Garante que todas as rotas exigem autenticação
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
        $compromisso = Compromisso::findOrFail($id);
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
        'titulo' => 'required|string|max:255',
        'categoria_id' => 'nullable|exists:categorias,id',
        'descricao' => 'nullable|string',
        'data_inicio' => 'required|date',
        'data_fim' => 'nullable|date|after_or_equal:data_inicio',
        'dia_inteiro' => 'nullable|boolean',
        'recorrencia' => 'nullable|in:diaria,semanal,mensal',
        'recorrencia_intervalo' => 'nullable|integer|min:1',
        'data_fim_recorrencia' => 'nullable|date|after:data_inicio',
        'telefone' => 'nullable|string|max:20',
    ]);

    $dados = $request->all();
    $dados['usuarios_id'] = Auth::id();
    $dados['dia_inteiro'] = $request->has('dia_inteiro');

    $compromisso = Compromisso::create($dados);

    if ($request->filled('recorrencia') && $request->filled('data_fim_recorrencia')) {
        $this->criarRecorrencias($compromisso);
    }

    return redirect()->route('compromissos.index')->with('success', 'Compromisso cadastrado com sucesso!');
}


public function update(Request $request, $id)
{
    $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($id);

    $request->validate([
        'titulo' => 'required|string|max:255',
        'categoria_id' => 'nullable|exists:categorias,id',
        'descricao' => 'nullable|string',
        'data_inicio' => 'required|date',
        'data_fim' => 'nullable|date|after_or_equal:data_inicio',
        'dia_inteiro' => 'nullable|boolean',
        'recorrencia' => 'nullable|in:diaria,semanal,mensal',
        'recorrencia_intervalo' => 'nullable|integer|min:1',
        'data_fim_recorrencia' => 'nullable|date|after:data_inicio',
        'telefone' => 'nullable|string|max:20',
    ]);

    $compromisso->update([
        'categoria_id' => $request->categoria_id,
        'titulo' => $request->titulo,
        'descricao' => $request->descricao,
        'data_inicio' => $request->data_inicio,
        'data_fim' => $request->data_fim,
        'dia_inteiro' => $request->has('dia_inteiro'),
        'recorrencia' => $request->recorrencia,
        'recorrencia_intervalo' => $request->recorrencia_intervalo,
        'data_fim_recorrencia' => $request->data_fim_recorrencia,
        'telefone' => $request->telefone,
    ]);

    return redirect()->route('compromissos.index')
        ->with('success', 'Compromisso atualizado com sucesso!');
}


    public function destroy($id)
    {
        $compromisso = Compromisso::where('usuarios_id', Auth::id())->findOrFail($id);
        $compromisso->delete();

        return redirect()->route('compromissos.index')
            ->with('success', 'Compromisso removido com sucesso!');
    }


    private function criarRecorrencias($compromisso)
{
    $dataAtual = \Carbon\Carbon::parse($compromisso->data_inicio);
    $dataFimRecorrencia = \Carbon\Carbon::parse($compromisso->data_fim_recorrencia);
    $intervalo = $compromisso->recorrencia_intervalo ?? 1;

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

        Compromisso::create([
            'usuarios_id' => $compromisso->usuarios_id,
            'categoria_id' => $compromisso->categoria_id,
            'titulo' => $compromisso->titulo,
            'descricao' => $compromisso->descricao,
            'data_inicio' => $dataAtual,
            'data_fim' => $compromisso->data_fim
                ? \Carbon\Carbon::parse($dataAtual)->addMinutes(
                    \Carbon\Carbon::parse($compromisso->data_fim)->diffInMinutes($compromisso->data_inicio)
                )
                : null,
            'dia_inteiro' => $compromisso->dia_inteiro,
        ]);
    }
}



}
