<?php

namespace App\Http\Controllers;

use App\Models\Regra;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RegraController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:admin-only']);
    }

    public function index()
    {
        $regras = Regra::query()->orderBy('nome')->get();

        return Inertia::render('Regras/Index', [
            'regras' => $regras,
        ]);
    }

    public function create()
    {
        $regra = new Regra();

        return Inertia::render('Regras/Form', [
            'regra' => $regra,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Regra::create($data);

        return redirect()->route('regras.index')
            ->with('success', 'Regra criada com sucesso.');
    }

    public function edit(Regra $regra)
    {
        return Inertia::render('Regras/Form', [
            'regra' => $regra,
        ]);
    }

    public function update(Request $request, Regra $regra)
    {
        $data = $this->validateData($request, $regra);
        $regra->update($data);

        return redirect()->route('regras.index')
            ->with('success', 'Regra atualizada com sucesso.');
    }

    public function destroy(Regra $regra)
    {
        if ($regra->usuarios()->where('is_admin', false)->exists()) {
            return back()->with('error', 'Não é possível excluir uma regra que já está atribuída a usuários.');
        }

        $regra->delete();

        return redirect()->route('regras.index')
            ->with('success', 'Regra removida com sucesso.');
    }

    private function validateData(Request $request, ?Regra $regra = null): array
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('regras', 'slug')->ignore($regra?->id)],
            'descricao' => 'nullable|string|max:1000',
        ]);

        return [
            'nome' => $request->nome,
            'slug' => $request->filled('slug') ? Str::slug($request->slug) : Str::slug($request->nome),
            'descricao' => $request->descricao,
            'acesso_compromissos' => $request->boolean('acesso_compromissos'),
            'acesso_dia_a_dia' => $request->boolean('acesso_dia_a_dia'),
            'acesso_projetos' => $request->boolean('acesso_projetos'),
            'acesso_financeiro' => $request->boolean('acesso_financeiro'),
            'acesso_saude' => $request->boolean('acesso_saude'),
        ];
    }
}
