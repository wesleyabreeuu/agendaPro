<?php

namespace App\Http\Controllers;

use App\Models\KanbanBoard;
use App\Models\KanbanTask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KanbanController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(): Response
    {
        $boards = KanbanBoard::where('user_id', Auth::id())
            ->withCount('tarefas')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Kanban/Index', [
            'boards' => $boards->map(fn (KanbanBoard $board) => [
                'id' => $board->id,
                'nome' => $board->nome,
                'descricao' => $board->descricao,
                'background_style' => $board->background_style ?: 'violet',
                'listas_count' => count($this->boardLists($board)),
                'tarefas_count' => $board->tarefas_count,
            ])->values()->all(),
            'backgroundOptions' => $this->backgroundOptions(),
        ]);
    }

    public function show(KanbanBoard $board): Response
    {
        $this->authorizeBoard($board);

        KanbanTask::whereHas('quadro', function ($query) {
            $query->where('user_id', Auth::id());
        })
            ->where('status', '!=', 'finalizado')
            ->whereDate('data_limite', '<', now()->toDateString())
            ->update(['status' => 'atrasado']);

        $board->load(['tarefas' => fn ($query) => $query->orderBy('ordem')->orderBy('id')]);

        $lists = $this->boardLists($board);
        $tarefas = $board->tarefas->groupBy(fn (KanbanTask $task) => $task->list_key ?: $this->legacyStatusToListKey($task->status));

        return Inertia::render('Kanban/Show', [
            'board' => [
                'id' => $board->id,
                'nome' => $board->nome,
                'descricao' => $board->descricao,
                'background_style' => $board->background_style ?: 'violet',
                'listas' => $lists,
            ],
            'backgroundOptions' => $this->backgroundOptions(),
            'lists' => $lists,
            'tarefas' => collect($lists)
                ->mapWithKeys(fn (array $list) => [
                    $list['key'] => ($tarefas[$list['key']] ?? collect())->map(fn (KanbanTask $task) => $this->serializeTask($task, $list['key']))->values()->all(),
                ])->all(),
        ]);
    }

    public function storeBoard(Request $request): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:255',
            'background_style' => 'nullable|string|max:50',
        ]);

        $board = KanbanBoard::create([
            'user_id' => Auth::id(),
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'background_style' => $request->background_style ?: 'violet',
            'listas' => $this->defaultLists(),
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
            'background_style' => 'nullable|string|max:50',
            'listas' => 'nullable|array',
            'listas.*.key' => 'nullable|string|max:80',
            'listas.*.title' => 'nullable|string|max:80',
        ]);

        $board->update([
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'background_style' => $request->background_style ?: $board->background_style ?: 'violet',
            'listas' => $this->sanitizeLists($request->input('listas', $board->listas ?? $this->defaultLists())),
        ]);

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
            'observacoes' => 'nullable|string',
            'urgencia' => 'required|in:baixa,media,alta,urgente',
            'data_limite' => 'nullable|date',
            'list_key' => 'nullable|string|max:80',
            'etiquetas' => 'nullable|array',
            'etiquetas.*.nome' => 'nullable|string|max:50',
            'etiquetas.*.cor' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'checklist' => 'nullable|array',
            'checklist.*.titulo' => 'nullable|string|max:255',
            'checklist.*.done' => 'nullable',
            'campos_personalizados' => 'nullable|array',
            'campos_personalizados.*.nome' => 'nullable|string|max:80',
            'campos_personalizados.*.valor' => 'nullable|string|max:255',
            'anexos' => 'nullable|array',
            'anexos.*.nome' => 'nullable|string|max:120',
            'anexos.*.url' => 'nullable|url|max:500',
        ]);

        $listKey = $request->input('list_key') ?: data_get($this->boardLists($board), '0.key', 'a-fazer');
        $ordem = (int) $board->tarefas()->where('list_key', $listKey)->max('ordem');

        $board->tarefas()->create([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'observacoes' => $request->observacoes,
            'urgencia' => $request->urgencia,
            'data_limite' => $request->data_limite,
            'status' => $this->deriveStatusFromListKey($listKey),
            'list_key' => $listKey,
            'ordem' => $ordem + 1,
            'etiquetas' => $this->sanitizeLabels($request->input('etiquetas', [])),
            'checklist' => $this->sanitizeChecklist($request->input('checklist', [])),
            'campos_personalizados' => $this->sanitizeCustomFields($request->input('campos_personalizados', [])),
            'anexos' => $this->sanitizeAttachments($request->input('anexos', [])),
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
            'observacoes' => 'nullable|string',
            'urgencia' => 'required|in:baixa,media,alta,urgente',
            'data_limite' => 'nullable|date',
            'status' => 'nullable|in:aguardando,execucao,finalizado,atrasado',
            'list_key' => 'nullable|string|max:80',
            'etiquetas' => 'nullable|array',
            'etiquetas.*.nome' => 'nullable|string|max:50',
            'etiquetas.*.cor' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'checklist' => 'nullable|array',
            'checklist.*.titulo' => 'nullable|string|max:255',
            'checklist.*.done' => 'nullable',
            'campos_personalizados' => 'nullable|array',
            'campos_personalizados.*.nome' => 'nullable|string|max:80',
            'campos_personalizados.*.valor' => 'nullable|string|max:255',
            'anexos' => 'nullable|array',
            'anexos.*.nome' => 'nullable|string|max:120',
            'anexos.*.url' => 'nullable|url|max:500',
        ]);

        $listKey = $request->input('list_key') ?: $task->list_key ?: $this->legacyStatusToListKey($task->status);
        $status = $request->input('status') ?: $this->deriveStatusFromListKey($listKey);

        $task->update([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'observacoes' => $request->observacoes,
            'urgencia' => $request->urgencia,
            'data_limite' => $request->data_limite,
            'status' => $status,
            'list_key' => $listKey,
            'etiquetas' => $this->sanitizeLabels($request->input('etiquetas', [])),
            'checklist' => $this->sanitizeChecklist($request->input('checklist', [])),
            'campos_personalizados' => $this->sanitizeCustomFields($request->input('campos_personalizados', [])),
            'anexos' => $this->sanitizeAttachments($request->input('anexos', [])),
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

    public function status(Request $request, KanbanTask $task): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $this->authorizeTask($task);

        $request->validate([
            'list_key' => 'required|string|max:80',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $updateData = [
            'list_key' => $request->list_key,
            'status' => $this->deriveStatusFromListKey($request->list_key),
            'ordem' => $request->integer('ordem', $task->ordem),
        ];

        $task->update($updateData);

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect()
            ->route('kanban.show', $task->kanban_board_id)
            ->with('success', 'Cartão movido com sucesso.');
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

    private function sanitizeAttachments(array $items): array
    {
        return collect($items)
            ->map(function ($item) {
                $nome = trim((string) data_get($item, 'nome'));
                $url = trim((string) data_get($item, 'url'));

                if ($url === '') {
                    return null;
                }

                return [
                    'nome' => $nome !== '' ? $nome : (parse_url($url, PHP_URL_HOST) ?: 'Anexo'),
                    'url' => $url,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function boardLists(KanbanBoard $board): array
    {
        return $this->sanitizeLists($board->listas ?? $this->defaultLists());
    }

    private function defaultLists(): array
    {
        return [
            ['key' => 'recursos', 'title' => 'Recursos'],
            ['key' => 'a-fazer', 'title' => 'A fazer'],
            ['key' => 'pendente', 'title' => 'Pendente'],
            ['key' => 'bloqueio', 'title' => 'Bloqueio'],
            ['key' => 'concluido', 'title' => 'Concluído'],
        ];
    }

    private function sanitizeLists(array $lists): array
    {
        $sanitized = collect($lists)
            ->map(function ($list, $index) {
                $title = trim((string) data_get($list, 'title'));
                if ($title === '') {
                    return null;
                }

                $key = trim((string) data_get($list, 'key'));
                $key = $key !== '' ? $key : str($title)->slug('-')->toString();
                if ($key === '') {
                    $key = 'lista-'.$index;
                }

                return [
                    'key' => $key,
                    'title' => $title,
                ];
            })
            ->filter()
            ->unique('key')
            ->values()
            ->all();

        return count($sanitized) ? $sanitized : $this->defaultLists();
    }

    private function legacyStatusToListKey(string $status): string
    {
        return match ($status) {
            'execucao' => 'pendente',
            'finalizado' => 'concluido',
            'atrasado' => 'bloqueio',
            default => 'a-fazer',
        };
    }

    private function deriveStatusFromListKey(string $listKey): string
    {
        return match ($listKey) {
            'concluido' => 'finalizado',
            'bloqueio' => 'atrasado',
            'pendente' => 'execucao',
            default => 'aguardando',
        };
    }

    private function backgroundOptions(): array
    {
        return [
            ['value' => 'violet', 'label' => 'Violeta'],
            ['value' => 'ocean', 'label' => 'Oceano'],
            ['value' => 'sunset', 'label' => 'Pôr do sol'],
            ['value' => 'forest', 'label' => 'Floresta'],
            ['value' => 'paper', 'label' => 'Claro neutro'],
        ];
    }

    private function serializeTask(KanbanTask $task, ?string $fallbackListKey = null): array
    {
        return [
            'id' => $task->id,
            'titulo' => $task->titulo,
            'descricao' => $task->descricao,
            'observacoes' => $task->observacoes,
            'urgencia' => $task->urgencia,
            'status' => $task->status,
            'list_key' => $task->list_key ?: $fallbackListKey ?: $this->legacyStatusToListKey($task->status),
            'data_limite' => $task->data_limite?->format('Y-m-d'),
            'data_limite_label' => $task->data_limite?->format('d/m/Y'),
            'etiquetas' => $task->etiquetas ?? [],
            'checklist' => $task->checklist ?? [],
            'campos_personalizados' => $task->campos_personalizados ?? [],
            'anexos' => $task->anexos ?? [],
            'checklist_resumo' => $task->checklist_resumo,
        ];
    }
}
