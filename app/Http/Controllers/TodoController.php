<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Todo;
use Carbon\Carbon;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $dataSelecionada = $request->input('data', Carbon::now()->toDateString());

        $tarefas = Todo::where('data', $dataSelecionada)
            ->orderBy('hora')
            ->get();

        return view('todo.index', compact('tarefas', 'dataSelecionada'));
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
        $tarefa = Todo::findOrFail($id);
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

        $tarefa = Todo::findOrFail($id);

        $tarefa->update([
            'data' => $request->data,
            'hora' => $request->hora,
            'descricao' => $request->descricao,
            'urgencia' => $request->urgencia,
            'status' => $request->status ?? $tarefa->status, // mantém se não vier
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

            $tarefa = Todo::findOrFail($id);
            $tarefa->status = $request->status;
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
        $tarefa = Todo::findOrFail($id);
        $data = $tarefa->data;

        $tarefa->delete();

        return redirect()
            ->route('todo.index', ['data' => $data])
            ->with('success', 'Tarefa excluída com sucesso!');
    }

        public function kanban(Request $request)
    {
        $dataSelecionada = $request->input('data', now()->toDateString());

        $tarefas = Todo::where('data', $dataSelecionada)
            ->orderBy('hora')
            ->get()
            ->groupBy(fn($t) => $t->status ?? 'aguardando');

        return view('todo.kanban', compact('tarefas', 'dataSelecionada'));
    }

}
