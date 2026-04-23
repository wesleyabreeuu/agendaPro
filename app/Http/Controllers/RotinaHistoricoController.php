<?php

namespace App\Http\Controllers;

use App\Models\Rotina;
use App\Models\RotinaExecucao;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RotinaHistoricoController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $inicio = $request->filled('data_inicio') ? Carbon::parse($request->input('data_inicio'))->startOfDay() : now()->subDays(29)->startOfDay();
        $fim = $request->filled('data_fim') ? Carbon::parse($request->input('data_fim'))->endOfDay() : now()->endOfDay();

        $query = RotinaExecucao::query()
            ->where('user_id', $user->id)
            ->whereBetween('data', [$inicio->toDateString(), $fim->toDateString()])
            ->with('rotina')
            ->orderByDesc('data')
            ->orderByDesc('updated_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('categoria')) {
            $categoria = $request->string('categoria')->toString();
            $query->whereHas('rotina', fn ($builder) => $builder->where('categoria', $categoria));
        }

        $execucoes = $query->get();

        return Inertia::render('Rotinas/History', [
            'filters' => [
                'data_inicio' => $inicio->toDateString(),
                'data_fim' => $fim->toDateString(),
                'status' => $request->string('status')->toString(),
                'categoria' => $request->string('categoria')->toString(),
            ],
            'summary' => [
                'total' => $execucoes->count(),
                'concluidas' => $execucoes->where('status', 'concluida')->count(),
                'modo_minimo' => $execucoes->where('status', 'concluida')->where('modo_usado', 'minimo')->count(),
                'puladas' => $execucoes->where('status', 'pulada')->count(),
            ],
            'historico' => $execucoes
                ->groupBy(fn (RotinaExecucao $execucao) => $execucao->data?->toDateString())
                ->map(function ($items, $date) {
                    return [
                        'data' => $date,
                        'data_formatada' => Carbon::parse($date)->format('d/m/Y'),
                        'items' => $items->map(fn (RotinaExecucao $execucao) => [
                            'id' => $execucao->id,
                            'rotina' => $execucao->rotina?->nome,
                            'categoria' => $execucao->rotina?->categoria,
                            'status' => $execucao->status,
                            'modo_usado' => $execucao->modo_usado,
                            'observacao' => $execucao->observacao,
                            'atualizado_em' => $execucao->updated_at?->format('H:i'),
                        ])->values()->all(),
                    ];
                })
                ->values()
                ->all(),
            'categorias' => Rotina::ownedBy($user->id)->distinct()->orderBy('categoria')->pluck('categoria')->values()->all(),
        ]);
    }
}
