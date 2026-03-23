<?php

namespace App\Http\Controllers;

use App\Models\KanbanBoard;
use App\Models\KanbanTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class KanbanController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(): View
    {
        $boards = KanbanBoard::where('user_id', Auth::id())
            ->withCount('tarefas')
            ->orderBy('nome')
            ->get();

        return view('kanban.index', compact('boards'));
    }

    public function show(KanbanBoard $board): View
    {
        $this->authorizeBoard($board);

        KanbanTask::whereHas('quadro', function ($query) {
            $query->where('user_id', Auth::id());
        })
            ->where('status', '!=', 'finalizado')
            ->whereDate('data_limite', '<', now()->toDateString())
            ->update(['status' => 'atrasado']);

        $board->load(['tarefas' => fn ($query) => $query->orderBy('ordem')->orderBy('id')]);

        $tarefas = $board->tarefas->groupBy(fn (KanbanTask $task) => $task->status);

        return view('kanban.show', compact('board', 'tarefas'));
    }

    public function storeBoard(Request $request): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:255',
        ]);

        $board = KanbanBoard::create([
            'user_id' => Auth::id(),
            'nome' => $request->nome,
            'descricao' => $request->descricao,
        ]);

        return redirect()
            ->route('kanban.show', $board->id)
            ->with('success', 'Quadro criado com sucesso.');
    }

    public function updateBoard(Request $request, KanbanBoard $board): RedirectResponse
    {
        $this->authorizeBoard($board);

        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:255',
        ]);

        $board->update($request->only('nome', 'descricao'));

        return redirect()
            ->route('kanban.show', $board->id)
            ->with('success', 'Quadro atualizado com sucesso.');
    }

    public function destroyBoard(KanbanBoard $board): RedirectResponse
    {
        $this->authorizeBoard($board);
        $board->delete();

        return redirect()
            ->route('kanban.index')
            ->with('success', 'Quadro excluído com sucesso.');
    }

    public function storeTask(Request $request, KanbanBoard $board): RedirectResponse
    {
        $this->authorizeBoard($board);

        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'urgencia' => 'required|in:baixa,media,alta',
            'data_limite' => 'nullable|date',
            'etiquetas' => 'nullable|array',
            'etiquetas.*.nome' => 'nullable|string|max:50',
            'etiquetas.*.cor' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'checklist' => 'nullable|array',
            'checklist.*.titulo' => 'nullable|string|max:255',
            'checklist.*.done' => 'nullable',
            'campos_personalizados' => 'nullable|array',
            'campos_personalizados.*.nome' => 'nullable|string|max:80',
            'campos_personalizados.*.valor' => 'nullable|string|max:255',
        ]);

        $ordem = (int) $board->tarefas()->where('status', 'aguardando')->max('ordem');

        $board->tarefas()->create([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'urgencia' => $request->urgencia,
            'data_limite' => $request->data_limite,
            'status' => 'aguardando',
            'ordem' => $ordem + 1,
            'etiquetas' => $this->sanitizeLabels($request->input('etiquetas', [])),
            'checklist' => $this->sanitizeChecklist($request->input('checklist', [])),
            'campos_personalizados' => $this->sanitizeCustomFields($request->input('campos_personalizados', [])),
        ]);

        return redirect()
            ->route('kanban.show', $board->id)
            ->with('success', 'Tarefa adicionada ao quadro.');
    }

    public function updateTask(Request $request, KanbanTask $task): RedirectResponse
    {
        $this->authorizeTask($task);

        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'urgencia' => 'required|in:baixa,media,alta',
            'data_limite' => 'nullable|date',
            'status' => 'required|in:aguardando,execucao,finalizado,atrasado',
            'etiquetas' => 'nullable|array',
            'etiquetas.*.nome' => 'nullable|string|max:50',
            'etiquetas.*.cor' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'checklist' => 'nullable|array',
            'checklist.*.titulo' => 'nullable|string|max:255',
            'checklist.*.done' => 'nullable',
            'campos_personalizados' => 'nullable|array',
            'campos_personalizados.*.nome' => 'nullable|string|max:80',
            'campos_personalizados.*.valor' => 'nullable|string|max:255',
        ]);

        if ($task->status === 'atrasado' && $request->status !== 'atrasado') {
            return redirect()
                ->route('kanban.show', $task->kanban_board_id)
                ->with('error', 'Itens em atraso só podem ser excluídos.');
        }

        $task->update([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'urgencia' => $request->urgencia,
            'data_limite' => $request->data_limite,
            'status' => $request->status,
            'etiquetas' => $this->sanitizeLabels($request->input('etiquetas', [])),
            'checklist' => $this->sanitizeChecklist($request->input('checklist', [])),
            'campos_personalizados' => $this->sanitizeCustomFields($request->input('campos_personalizados', [])),
        ]);

        return redirect()
            ->route('kanban.show', $task->kanban_board_id)
            ->with('success', 'Tarefa atualizada com sucesso.');
    }

    public function destroyTask(KanbanTask $task): RedirectResponse
    {
        $this->authorizeTask($task);
        $boardId = $task->kanban_board_id;
        $task->delete();

        return redirect()
            ->route('kanban.show', $boardId)
            ->with('success', 'Tarefa removida com sucesso.');
    }

    public function status(Request $request, KanbanTask $task): JsonResponse
    {
        $this->authorizeTask($task);

        $request->validate([
            'status' => 'required|in:aguardando,execucao,finalizado,atrasado',
            'ordem' => 'nullable|integer|min:0',
        ]);

        // Se tentar mover para "atrasado" quando está em outro status (sem confirmação)
        if ($task->status !== 'atrasado' && $request->status === 'atrasado' && !$request->boolean('confirmed')) {
            return response()->json([
                'ok' => false,
                'requiresConfirmation' => true,
                'message' => 'Esta tarefa ainda está no prazo. Ao movê-la para "Em atraso", sua data final será atualizada para hoje e a tarefa será marcada como atrasada. Deseja continuar?',
                'currentDeadline' => $task->data_limite?->format('d/m/Y'),
            ], 422);
        }

        if ($task->status === 'atrasado' && $request->status !== 'atrasado') {
            return response()->json([
                'ok' => false,
                'message' => 'Itens em atraso só saem da coluna se forem excluídos.',
            ], 422);
        }

        $updateData = [
            'status' => $request->status,
            'ordem' => $request->integer('ordem', $task->ordem),
        ];

        // Se está confirmando mover para atrasado, atualiza também a data_limite para hoje
        if ($request->status === 'atrasado' && $request->boolean('confirmed')) {
            $updateData['data_limite'] = now()->toDateString();
        }

        $task->update($updateData);

        return response()->json(['ok' => true]);
    }

    public function extendDeadline(Request $request, KanbanTask $task): RedirectResponse
    {
        $this->authorizeTask($task);

        $request->validate([
            'data_limite' => 'required|date|after_or_equal:today',
        ]);

        $task->update([
            'data_limite' => $request->data_limite,
            'status' => 'aguardando',
        ]);

        return redirect()
            ->route('kanban.show', $task->kanban_board_id)
            ->with('success', 'Prazo estendido com sucesso. A tarefa foi movida para "Aguardando".');
    }

    private function authorizeBoard(KanbanBoard $board): void
    {
        abort_unless($board->user_id === Auth::id(), 403);
    }

    private function authorizeTask(KanbanTask $task): void
    {
        $task->loadMissing('quadro');
        abort_unless($task->quadro && $task->quadro->user_id === Auth::id(), 403);
    }

    private function sanitizeLabels(array $labels): array
    {
        return collect($labels)
            ->map(function ($label) {
                $nome = trim((string) data_get($label, 'nome'));
                $cor = trim((string) data_get($label, 'cor', '#2563eb'));

                if ($nome === '') {
                    return null;
                }

                if (!preg_match('/^#(?:[0-9a-fA-F]{3}){1,2}$/', $cor)) {
                    $cor = '#2563eb';
                }

                return [
                    'nome' => $nome,
                    'cor' => $cor,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function sanitizeChecklist(array $items): array
    {
        return collect($items)
            ->map(function ($item) {
                $titulo = trim((string) data_get($item, 'titulo'));

                if ($titulo === '') {
                    return null;
                }

                return [
                    'titulo' => $titulo,
                    'done' => filter_var(data_get($item, 'done', false), FILTER_VALIDATE_BOOLEAN),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function sanitizeCustomFields(array $fields): array
    {
        return collect($fields)
            ->map(function ($field) {
                $nome = trim((string) data_get($field, 'nome'));
                $valor = trim((string) data_get($field, 'valor'));

                if ($nome === '' || $valor === '') {
                    return null;
                }

                return [
                    'nome' => $nome,
                    'valor' => $valor,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
