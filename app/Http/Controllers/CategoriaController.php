<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::ownedBy(Auth::id())
            ->orderBy('nome')
            ->get();
        return Inertia::render('Categorias/Index', [
            'categorias' => $categorias,
        ]);
    }

    public function create()
    {
        return Inertia::render('Categorias/Form');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:100',
        ]);

        $exists = Categoria::ownedBy(Auth::id())
            ->where('nome', $request->nome)
            ->exists();

        if ($exists) {
            return back()
                ->withErrors(['nome' => 'Você já possui uma categoria com esse nome.'])
                ->withInput();
        }

        Categoria::create([
            'user_id' => Auth::id(),
            'nome' => $request->nome,
        ]);

        return redirect()->route('categorias.index')->with('success', 'Categoria cadastrada com sucesso!');
    }

    public function show($id)
    {
            //
    }

    public function edit($id)
    {
        $categoria = Categoria::ownedBy(Auth::id())->findOrFail($id);
        return Inertia::render('Categorias/Form', [
            'categoria' => $categoria,
        ]);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::ownedBy(Auth::id())->findOrFail($id);

        $request->validate([
            'nome' => 'required|string|max:100',
        ]);

        $exists = Categoria::ownedBy(Auth::id())
            ->where('nome', $request->nome)
            ->where('id', '!=', $categoria->id)
            ->exists();

        if ($exists) {
            return back()
                ->withErrors(['nome' => 'Você já possui uma categoria com esse nome.'])
                ->withInput();
        }

        $categoria->update([
            'nome' => $request->nome,
        ]);

        return redirect()->route('categorias.index')->with('success', 'Categoria atualizada com sucesso!');
    }

    public function destroy($id)
    {
        $categoria = Categoria::ownedBy(Auth::id())->findOrFail($id);
        $categoria->delete();

        return redirect()->route('categorias.index')->with('success', 'Categoria removida com sucesso!');
    }
}
