<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
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

        Todo::create($request->only(['data', 'hora', 'descricao', 'urgencia']));

        return redirect()->route('todo.index', ['data' => $request->data])
                         ->with('success', 'Tarefa criada com sucesso!');
    }

        public function edit($id)
    {
        $tarefa = \App\Models\Todo::findOrFail($id);
        return view('todo.edit', compact('tarefa'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'data' => 'required|date',
            'hora' => 'required',
            'descricao' => 'required|string|max:255',
            'urgencia' => 'required|in:baixa,media,alta',
        ]);

        $tarefa = Todo::findOrFail($id);
        $tarefa->update($request->only(['data', 'hora', 'descricao', 'urgencia']));

        return redirect()->route('todo.index', ['data' => $request->data])
                         ->with('success', 'Tarefa atualizada com sucesso!');
    }
}


