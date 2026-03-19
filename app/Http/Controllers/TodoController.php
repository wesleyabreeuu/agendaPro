<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Todo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

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

        return view('todo.index', compact('tarefas', 'dataSelecionada', 'visualizacao'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'data' => 'required|date',
            'hora' => 'required',
            'descricao' => 'required|string|max:255',
            'urgencia' => 'required|in:baixa,media,alta',
        ]);

        // garante status default (se seu banco/model tiver esse campo)
        Todo::create([
            'user_id' => Auth::id(),
            'data' => $request->data,
            'hora' => $request->hora,
            'descricao' => $request->descricao,
            'urgencia' => $request->urgencia,
            'status' => 'aguardando', // <-- importante
        ]);

        return redirect()
            ->route('todo.index', ['data' => $request->data])
            ->with('success', 'Tarefa criada com sucesso!');
    }

    public function edit($id)
    {
        $tarefa = Todo::ownedBy(Auth::id())->findOrFail($id);
        return view('todo.edit', compact('tarefa'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'data' => 'required|date',
            'hora' => 'required',
            'descricao' => 'required|string|max:255',
            'urgencia' => 'required|in:baixa,media,alta',
            'status' => 'nullable|in:aguardando,execucao,finalizado', // opcional
        ]);

        $tarefa = Todo::ownedBy(Auth::id())->findOrFail($id);
        $status = $request->status ?? $tarefa->status;

        $tarefa->update([
            'data' => $request->data,
            'hora' => $request->hora,
            'descricao' => $request->descricao,
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
