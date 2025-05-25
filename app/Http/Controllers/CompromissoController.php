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
        // Verifica se o usuário está autenticado
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
        ]);

        Compromisso::create([
            'usuarios_id' => Auth::id(),
            'categoria_id' => $request->categoria_id,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'data_inicio' => $request->data_inicio,
            'data_fim' => $request->data_fim,
            'dia_inteiro' => $request->has('dia_inteiro'),
        ]);

        return redirect()->route('compromissos.index')
            ->with('success', 'Compromisso cadastrado com sucesso!');
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
        ]);

        $compromisso->update([
            'categoria_id' => $request->categoria_id,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'data_inicio' => $request->data_inicio,
            'data_fim' => $request->data_fim,
            'dia_inteiro' => $request->has('dia_inteiro'),
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



}
