<?php

namespace App\Http\Controllers;

use App\Models\Regra;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissaoController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:admin-only']);
    }

    public function index()
    {
        $usuarios = User::query()
            ->with('regra')
            ->orderByDesc('is_admin')
            ->orderBy('name')
            ->get();

        $regras = Regra::query()->orderBy('nome')->get();

        return Inertia::render('Permissoes/Index', [
            'usuarios' => $usuarios->map(fn (User $usuario) => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'is_admin' => $usuario->is_admin,
                'regra_id' => $usuario->regra_id,
                'regra_nome' => $usuario->isAdmin() ? 'Acesso total' : ($usuario->regra->nome ?? 'Sem regra'),
            ])->values()->all(),
            'regras' => $regras,
        ]);
    }

    public function update(Request $request, User $usuario)
    {
        $request->validate([
            'regra_id' => 'nullable|exists:regras,id',
        ]);

        if ($usuario->isAdmin()) {
            return back()->with('error', 'O administrador sempre possui acesso total e não depende de regra.');
        }

        $regra = Regra::findOrFail($request->regra_id);
        $usuario->update([
            'regra_id' => $regra->id,
        ]);

        return redirect()->route('permissoes.index')
            ->with('success', 'Permissão do usuário atualizada com sucesso.');
    }
}
