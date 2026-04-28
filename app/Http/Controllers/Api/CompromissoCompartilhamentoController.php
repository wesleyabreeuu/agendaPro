<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Compromisso;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompromissoCompartilhamentoController extends Controller
{
    public function show(Compromisso $compromisso): JsonResponse
    {
        $compromisso->loadMissing(['categoria', 'owner', 'compartilhamentos.usuario']);
        $this->authorize('view', $compromisso);

        return response()->json([
            'data' => $this->serializeCompromisso($compromisso),
        ]);
    }

    public function store(Request $request, Compromisso $compromisso): JsonResponse
    {
        $compromisso->loadMissing(['compartilhamentos', 'usuariosCompartilhados']);
        $this->authorize('share', $compromisso);

        $validated = $request->validate([
            'usuario_id' => 'nullable|integer|exists:usuarios,id',
            'email' => 'nullable|email',
            'permissao' => 'required|in:visualizar,editar',
        ]);

        if (empty($validated['usuario_id']) && empty($validated['email'])) {
            return response()->json([
                'message' => 'Informe o e-mail do usuário para compartilhar.',
            ], 422);
        }

        $usuario = !empty($validated['usuario_id'])
            ? User::find($validated['usuario_id'])
            : User::where('email', $validated['email'])->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não foi encontrado com este e-mail.',
            ], 404);
        }

        if ((int) $usuario->id === (int) $compromisso->usuarios_id) {
            return response()->json([
                'message' => 'O dono do compromisso nao precisa ser compartilhado.',
            ], 422);
        }

        $compromisso->usuariosCompartilhados()->syncWithoutDetaching([
            $usuario->id => ['permissao' => $validated['permissao']],
        ]);

        $compromisso->usuariosCompartilhados()->updateExistingPivot($usuario->id, [
            'permissao' => $validated['permissao'],
        ]);

        return response()->json([
            'message' => 'Compromisso compartilhado com sucesso.',
            'data' => [
                'compromisso_id' => $compromisso->id,
                'usuario_id' => $usuario->id,
                'usuario_nome' => $usuario->name,
                'usuario_email' => $usuario->email,
                'permissao' => $validated['permissao'],
            ],
        ], 201);
    }

    public function destroy(Compromisso $compromisso, User $usuario): JsonResponse
    {
        $compromisso->loadMissing(['compartilhamentos', 'usuariosCompartilhados']);
        $this->authorize('share', $compromisso);

        if ((int) $usuario->id === (int) $compromisso->usuarios_id) {
            return response()->json([
                'message' => 'Nao e possivel remover o owner do compromisso.',
            ], 422);
        }

        $deleted = $compromisso->compartilhamentos()
            ->where('usuario_id', $usuario->id)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'message' => 'Compartilhamento nao encontrado para este usuario.',
            ], 404);
        }

        return response()->json([
            'message' => 'Compartilhamento removido com sucesso.',
            'data' => [
                'compromisso_id' => $compromisso->id,
                'usuario_id' => $usuario->id,
            ],
        ]);
    }

    public function index(): JsonResponse
    {
        $user = Auth::user();

        $compromissos = $user->sharedCompromissos()
            ->with(['categoria', 'owner', 'compartilhamentos.usuario'])
            ->orderBy('data_inicio')
            ->get()
            ->map(fn (Compromisso $compromisso) => $this->serializeCompromisso($compromisso))
            ->values();

        return response()->json([
            'data' => $compromissos,
        ]);
    }

    public function update(Request $request, Compromisso $compromisso): JsonResponse
    {
        $compromisso->loadMissing(['categoria', 'owner', 'compartilhamentos.usuario']);
        $this->authorize('update', $compromisso);
        $isOwner = $compromisso->isOwnedBy(Auth::user());

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'categoria_id' => 'nullable|exists:categorias,id',
            'descricao' => 'nullable|string',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'dia_inteiro' => 'nullable|boolean',
            'recorrencia' => 'nullable|in:diaria,semanal,mensal',
            'recorrencia_intervalo' => 'nullable|integer|min:1',
            'data_fim_recorrencia' => 'nullable|date',
            'telefone' => 'nullable|string|max:20',
        ]);

        if (!empty($validated['categoria_id'])) {
            Categoria::ownedBy($compromisso->usuarios_id)->findOrFail($validated['categoria_id']);
        }

        $compromisso->update([
            'titulo' => $validated['titulo'],
            'categoria_id' => $validated['categoria_id'] ?? null,
            'descricao' => $validated['descricao'] ?? null,
            'data_inicio' => $validated['data_inicio'],
            'data_fim' => $validated['data_fim'] ?? null,
            'dia_inteiro' => (bool) ($validated['dia_inteiro'] ?? false),
            'recorrencia' => $validated['recorrencia'] ?? null,
            'recorrencia_intervalo' => $validated['recorrencia_intervalo'] ?? null,
            'data_fim_recorrencia' => $validated['data_fim_recorrencia'] ?? null,
            'telefone' => $isOwner ? ($validated['telefone'] ?? null) : $compromisso->telefone,
        ]);

        $compromisso->refresh()->load(['categoria', 'owner', 'compartilhamentos.usuario']);

        return response()->json([
            'message' => 'Compromisso atualizado com sucesso.',
            'data' => $this->serializeCompromisso($compromisso),
        ]);
    }

    private function serializeCompromisso(Compromisso $compromisso): array
    {
        $permissao = $compromisso->isOwnedBy(Auth::user())
            ? 'owner'
            : $compromisso->sharedPermissionFor(Auth::user());
        $isOwner = $permissao === 'owner';

        return [
            'id' => $compromisso->id,
            'titulo' => $compromisso->titulo,
            'descricao' => $compromisso->descricao,
            'data_inicio' => $compromisso->data_inicio?->toIso8601String(),
            'data_fim' => $compromisso->data_fim?->toIso8601String(),
            'dia_inteiro' => (bool) $compromisso->dia_inteiro,
            'telefone' => $isOwner ? $compromisso->telefone : null,
            'recorrencia' => $compromisso->recorrencia,
            'recorrencia_intervalo' => $compromisso->recorrencia_intervalo,
            'data_fim_recorrencia' => $compromisso->data_fim_recorrencia
                ? Carbon::parse($compromisso->data_fim_recorrencia)->toDateString()
                : null,
            'categoria' => $compromisso->categoria
                ? [
                    'id' => $compromisso->categoria->id,
                    'nome' => $compromisso->categoria->nome,
                ]
                : null,
            'owner' => [
                'id' => $compromisso->owner?->id,
                'nome' => $compromisso->owner?->name,
            ],
            'compartilhado_com' => $isOwner
                ? $compromisso->compartilhamentos
                    ->map(fn ($compartilhamento) => [
                        'usuario_id' => $compartilhamento->usuario_id,
                        'nome' => $compartilhamento->usuario?->name,
                        'email_masked' => $this->maskEmail($compartilhamento->usuario?->email),
                        'permissao' => $compartilhamento->permissao,
                    ])
                    ->values()
                    ->all()
                : [],
            'permissao' => $permissao,
            'pode_editar' => in_array($permissao, ['owner', 'editar'], true),
            'pode_compartilhar' => $permissao === 'owner',
        ];
    }

    private function maskEmail(?string $email): ?string
    {
        if (!$email || !str_contains($email, '@')) {
            return null;
        }

        [$name, $domain] = explode('@', $email, 2);
        $prefix = mb_substr($name, 0, 2);

        return $prefix . str_repeat('*', max(mb_strlen($name) - 2, 1)) . '@' . $domain;
    }
}
