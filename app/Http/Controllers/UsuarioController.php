<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Regra;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuario = Usuario::whereKey(Auth::id())->firstOrFail();

        return Inertia::render('Usuarios/Index', [
            'usuario' => $this->serializeUsuario($usuario),
        ]);
    }

    public function show($id): RedirectResponse
    {
        $this->usuarioAtual($id);

        return redirect()->route('usuarios.edit', $id);
    }

    public function edit($id)
    {
        $usuario = $this->usuarioAtual($id);

        return Inertia::render('Usuarios/Edit', [
            'usuario' => $this->serializeUsuario($usuario),
        ]);
    }

    public function update(Request $request, $id)
    {
        $usuario = $this->usuarioAtual($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email,' . $usuario->id,
            'telefone' => 'nullable|string|max:30',
            'endereco' => 'nullable|string|max:255',
            'foto' => 'nullable|image|max:2048',
        ]);

        $dados = [
            'name' => $request->name,
            'email' => $request->email,
            'telefone' => $request->telefone,
            'endereco' => $request->endereco,
        ];

        if ($request->hasFile('foto')) {
            $avatarDir = public_path('uploads/avatars');

            if (!is_dir($avatarDir)) {
                mkdir($avatarDir, 0775, true);
            }

            $ext = $request->file('foto')->getClientOriginalExtension();
            $filename = 'avatar-' . $usuario->id . '-' . Str::uuid() . '.' . $ext;
            $request->file('foto')->move($avatarDir, $filename);

            $dados['foto_path'] = 'uploads/avatars/' . $filename;
        }

        $usuario->update($dados);

        if ($request->filled('password')) {
            $usuario->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()->route('usuarios.index')->with('success', 'Perfil atualizado com sucesso!');
    }

    public function adminIndex()
    {
        abort_unless(Auth::user()?->isAdmin(), 403);

        $usuarios = Usuario::with('regra')
            ->orderByDesc('is_admin')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => $usuarios->map(fn (Usuario $usuario) => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'telefone' => $usuario->telefone,
                'endereco' => $usuario->endereco,
                'is_admin' => (bool) $usuario->is_admin,
                'regra_label' => $usuario->profileRoleLabel(),
            ])->values()->all(),
        ]);
    }

    public function createAdmin()
    {
        abort_unless(Auth::user()?->isAdmin(), 403);

        return Inertia::render('Admin/Usuarios/Form', [
            'mode' => 'create',
            'usuario' => null,
        ]);
    }

    public function storeAdmin(Request $request)
    {
        abort_unless(Auth::user()?->isAdmin(), 403);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'telefone' => 'nullable|string|max:30',
            'endereco' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
            'foto' => 'nullable|image|max:2048',
        ]);

        $dados = [
            'name' => $request->name,
            'email' => $request->email,
            'telefone' => $request->telefone,
            'endereco' => $request->endereco,
            'password' => Hash::make($request->password),
            'is_admin' => false,
            'regra_id' => Regra::query()->where('slug', 'comum')->value('id'),
        ];

        if ($request->hasFile('foto')) {
            $avatarDir = public_path('uploads/avatars');

            if (!is_dir($avatarDir)) {
                mkdir($avatarDir, 0775, true);
            }

            $ext = $request->file('foto')->getClientOriginalExtension();
            $filename = 'avatar-' . Str::uuid() . '.' . $ext;
            $request->file('foto')->move($avatarDir, $filename);

            $dados['foto_path'] = 'uploads/avatars/' . $filename;
        }

        Usuario::create($dados);

        return redirect()->route('admin.usuarios.index')->with('success', 'Usuário cadastrado com sucesso!');
    }

    public function editAdmin($id)
    {
        abort_unless(Auth::user()?->isAdmin(), 403);

        $usuario = Usuario::findOrFail($id);

        return Inertia::render('Admin/Usuarios/Form', [
            'mode' => 'edit',
            'usuario' => $this->serializeUsuario($usuario),
        ]);
    }

    public function updateAdmin(Request $request, $id)
    {
        abort_unless(Auth::user()?->isAdmin(), 403);

        $usuario = Usuario::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email,' . $usuario->id,
            'telefone' => 'nullable|string|max:30',
            'endereco' => 'nullable|string|max:255',
            'foto' => 'nullable|image|max:2048',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $dados = [
            'name' => $request->name,
            'email' => $request->email,
            'telefone' => $request->telefone,
            'endereco' => $request->endereco,
        ];

        if ($request->hasFile('foto')) {
            $avatarDir = public_path('uploads/avatars');

            if (!is_dir($avatarDir)) {
                mkdir($avatarDir, 0775, true);
            }

            $ext = $request->file('foto')->getClientOriginalExtension();
            $filename = 'avatar-' . $usuario->id . '-' . Str::uuid() . '.' . $ext;
            $request->file('foto')->move($avatarDir, $filename);

            $dados['foto_path'] = 'uploads/avatars/' . $filename;
        }

        if ($request->filled('password')) {
            $dados['password'] = Hash::make($request->password);
        }

        $usuario->update($dados);

        return redirect()->route('admin.usuarios.index')->with('success', 'Usuário atualizado com sucesso!');
    }

    private function usuarioAtual($id): Usuario
    {
        abort_unless((int) $id === (int) Auth::id(), 403);

        return Usuario::findOrFail($id);
    }

    private function serializeUsuario(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'name' => $usuario->name,
            'email' => $usuario->email,
            'telefone' => $usuario->telefone,
            'endereco' => $usuario->endereco,
            'profile_image_url' => $usuario->profileImageUrl(),
            'regra_label' => $usuario->profileRoleLabel(),
        ];
    }
}
