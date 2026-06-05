<?php

namespace App\Http\Controllers;

use App\Models\KanbanTask;
use App\Models\DailyCheckin;
use App\Models\Lembrete;
use App\Models\Todo;
use App\Models\User;
use App\Services\DailyPlannerService;
use App\Services\MeuDiaService;
use App\Services\RotinaPlannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MeuDiaController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function page(MeuDiaService $meuDiaService): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('MeuDia', [
            'initialData' => $meuDiaService->payload($user),
        ]);
    }

    public function index(MeuDiaService $meuDiaService): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json($meuDiaService->payload($user));
    }

    public function plan(DailyPlannerService $planner): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json($planner->plan($user));
    }

    public function applyPlan(DailyPlannerService $planner): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return response()->json($planner->apply($user));
    }

    public function checkin(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'humor' => 'required|integer|min:1|max:5',
            'energia' => 'required|integer|min:1|max:5',
            'produtividade' => 'nullable|integer|min:1|max:5',
        ]);

        $checkin = DailyCheckin::updateOrCreate(
            [
                'user_id' => $user->id,
                'data' => today()->toDateString(),
            ],
            [
                'humor' => $data['humor'],
                'energia' => $data['energia'],
                'produtividade' => $data['produtividade'] ?? $data['energia'],
            ]
        );

        return response()->json([
            'ok' => true,
            'checkin' => $checkin,
        ]);
    }

    public function action(
        Request $request,
        RotinaPlannerService $planner
    ): JsonResponse {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'tipo' => 'required|in:tarefa,rotina,kanban,lembrete',
            'origem_id' => 'required|integer',
            'acao' => 'required|in:concluir,adiar',
        ]);

        match ($data['tipo']) {
            'tarefa' => $this->handleTodoAction($user, $data['origem_id'], $data['acao']),
            'rotina' => $this->handleRotinaAction($user, $data['origem_id'], $data['acao'], $planner),
            'kanban' => $this->handleKanbanAction($user, $data['origem_id'], $data['acao']),
            'lembrete' => $this->handleLembreteAction($user, $data['origem_id'], $data['acao']),
        };

        return response()->json(['ok' => true]);
    }

    private function handleTodoAction(User $user, int $id, string $action): void
    {
        $todo = Todo::ownedBy($user->id)->findOrFail($id);

        if ($action === 'concluir') {
            $todo->update([
                'status' => 'finalizado',
                'finalizado_em' => now(),
            ]);

            return;
        }

        $todo->update([
            'data' => today()->addDay()->toDateString(),
            'status' => 'aguardando',
            'finalizado_em' => null,
        ]);
    }

    private function handleRotinaAction(User $user, int $id, string $action, RotinaPlannerService $planner): void
    {
        $rotina = $user->rotinas()->findOrFail($id);

        if ($action !== 'concluir') {
            return;
        }

        $planner->recordExecution($rotina, $user->id, today(), 'concluida', 'normal');
    }

    private function handleKanbanAction(User $user, int $id, string $action): void
    {
        $task = KanbanTask::query()
            ->whereHas('quadro', fn ($query) => $query->where('user_id', $user->id))
            ->findOrFail($id);

        if ($action === 'concluir') {
            $task->update([
                'status' => 'finalizado',
                'finalizado_em' => now(),
            ]);

            return;
        }

        $task->update([
            'data_limite' => ($task->data_limite ?? today())->copy()->addDay()->toDateString(),
            'status' => 'aguardando',
        ]);
    }

    private function handleLembreteAction(User $user, int $id, string $action): void
    {
        $lembrete = Lembrete::ownedBy($user->id)->findOrFail($id);

        if ($action === 'concluir') {
            $attributes = [
                'notificado_em' => now(),
                'ultima_execucao_em' => now(),
            ];

            if (!$lembrete->recorrencia) {
                $attributes['ativo'] = false;
            }

            $lembrete->update($attributes);

            return;
        }

        $base = $lembrete->proxima_execucao_em ?? $lembrete->inicio_em ?? now();

        $lembrete->update([
            'proxima_execucao_em' => $base->copy()->addHour(),
            'notificado_em' => null,
        ]);
    }
}
