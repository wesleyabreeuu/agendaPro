<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Todo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $dataSelecionada = $request->input('data', Carbon::now()->toDateString());
        $visualizacao = $request->input('view', 'lista');

        $tarefas = Todo::ownedBy(Auth::id())
            ->where('data', $dataSelecionada)
            ->orderBy('hora')
            ->get();

        return Inertia::render('Todo/Index', [
            'tarefas' => $tarefas->map(fn (Todo $tarefa) => [
                'id' => $tarefa->id,
                'data' => $tarefa->data?->format('Y-m-d'),
                'hora' => $tarefa->hora,
                'descricao' => $tarefa->descricao,
                'observacao' => $tarefa->observacao,
                'urgencia' => $tarefa->urgencia,
                'status' => $tarefa->status,
                'concluida' => $tarefa->status === 'finalizado',
            ])->values()->all(),
            'dataSelecionada' => $dataSelecionada,
            'visualizacao' => $visualizacao,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'data' => 'required|date',
            'hora' => 'required',
            'descricao' => 'required|string|max:255',
            'observacao' => 'nullable|string',
            'urgencia' => 'required|in:baixa,media,alta,urgente',
        ]);

        $status = $request->boolean('concluida') ? 'finalizado' : 'aguardando';

        Todo::create([
            'user_id' => Auth::id(),
            'data' => $request->data,
            'hora' => $request->hora,
            'descricao' => $request->descricao,
            'observacao' => $request->observacao,
            'urgencia' => $request->urgencia,
            'status' => $status,
            'finalizado_em' => $status === 'finalizado' ? now() : null,
        ]);

        return redirect()
            ->route('todo.index', ['data' => $request->data])
            ->with('success', 'Tarefa criada com sucesso!');
    }

    public function edit($id)
    {
        $tarefa = Todo::ownedBy(Auth::id())->findOrFail($id);
        return Inertia::render('Todo/Edit', [
            'tarefa' => [
                'id' => $tarefa->id,
            'data' => $tarefa->data?->format('Y-m-d'),
            'hora' => $tarefa->hora,
            'descricao' => $tarefa->descricao,
            'observacao' => $tarefa->observacao,
            'urgencia' => $tarefa->urgencia,
            'status' => $tarefa->status,
        ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'data' => 'required|date',
            'hora' => 'required',
            'descricao' => 'required|string|max:255',
            'observacao' => 'nullable|string',
            'urgencia' => 'required|in:baixa,media,alta,urgente',
            'status' => 'nullable|in:aguardando,execucao,finalizado', // opcional
        ]);

        $tarefa = Todo::ownedBy(Auth::id())->findOrFail($id);
        $status = $request->boolean('concluida')
            ? 'finalizado'
            : ($request->status ?? $tarefa->status);

        $tarefa->update([
            'data' => $request->data,
            'hora' => $request->hora,
            'descricao' => $request->descricao,
            'observacao' => $request->observacao,
            'urgencia' => $request->urgencia,
            'status' => $status,
            'finalizado_em' => $status === 'finalizado' ? now() : null,
        ]);

        return redirect()
            ->route('todo.index', ['data' => $request->data])
            ->with('success', 'Tarefa atualizada com sucesso!');
    }

    // ✅ MÉTODO QUE ESTAVA FALTANDO (resolve o erro do PATCH status)
        public function status(Request $request, $id)
        {
            $request->validate([
                'status' => 'required|in:aguardando,execucao,finalizado',
            ]);

            $tarefa = Todo::ownedBy(Auth::id())->findOrFail($id);
            $tarefa->status = $request->status;
            $tarefa->finalizado_em = $request->status === 'finalizado' ? now() : null;
            $tarefa->save();

            // ✅ Se for AJAX, retorna JSON (evita redirect)
            if ($request->expectsJson()) {
                return response()->json(['ok' => true]);
            }

            return back()->with('success', 'Status atualizado com sucesso!');
        }


    // ✅ MÉTODO QUE ESTAVA FALTANDO (resolve o erro do DELETE destroy)
    public function destroy($id)
    {
        $tarefa = Todo::ownedBy(Auth::id())->findOrFail($id);
        $data = $tarefa->data;

        $tarefa->delete();

        return redirect()
            ->route('todo.index', ['data' => $data])
            ->with('success', 'Tarefa excluída com sucesso!');
    }
}
