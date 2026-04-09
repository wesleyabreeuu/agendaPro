<?php

namespace App\Http\Controllers;

use App\Models\DailyCheckin;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DailyCheckinController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $today = Carbon::today();

        $checkinHoje = DailyCheckin::ownedBy($userId)
            ->whereDate('data', $today)
            ->first();

        $historico = DailyCheckin::ownedBy($userId)
            ->orderByDesc('data')
            ->take(14)
            ->get();

        return Inertia::render('Checkins/Index', [
            'today' => $today->format('Y-m-d'),
            'checkinHoje' => $checkinHoje ? [
                'id' => $checkinHoje->id,
                'data' => $checkinHoje->data->format('Y-m-d'),
                'humor' => $checkinHoje->humor,
                'energia' => $checkinHoje->energia,
                'produtividade' => $checkinHoje->produtividade,
                'destaque' => $checkinHoje->destaque,
                'gratidao' => $checkinHoje->gratidao,
                'observacoes' => $checkinHoje->observacoes,
            ] : null,
            'historico' => $historico->map(fn (DailyCheckin $item) => [
                'id' => $item->id,
                'data' => $item->data->format('d/m/Y'),
                'humor' => $item->humor,
                'energia' => $item->energia,
                'produtividade' => $item->produtividade,
                'destaque' => $item->destaque,
            ])->values()->all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'data' => 'required|date',
            'humor' => 'required|integer|min:1|max:5',
            'energia' => 'required|integer|min:1|max:5',
            'produtividade' => 'required|integer|min:1|max:5',
            'destaque' => 'nullable|string|max:500',
            'gratidao' => 'nullable|string|max:500',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        DailyCheckin::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'data' => $validated['data'],
            ],
            [
                'humor' => $validated['humor'],
                'energia' => $validated['energia'],
                'produtividade' => $validated['produtividade'],
                'destaque' => $validated['destaque'] ?? null,
                'gratidao' => $validated['gratidao'] ?? null,
                'observacoes' => $validated['observacoes'] ?? null,
            ]
        );

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Check-in diário salvo com sucesso.');
    }
}
