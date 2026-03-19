<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Compromisso;
use App\Models\KanbanBoard;
use App\Models\Lembrete;
use App\Models\Todo;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $totalCompromissos = Compromisso::where('usuarios_id', $userId)->count();

        $totalLembretes = Lembrete::whereHas('compromisso', function ($query) use ($userId) {
            $query->where('usuarios_id', $userId);
        })->count();

        $totalTarefasHoje = Todo::ownedBy($userId)
            ->whereDate('data', Carbon::today())
            ->count();

        $totalQuadrosKanban = KanbanBoard::where('user_id', $userId)->count();

        $proximosCompromissos = Compromisso::where('usuarios_id', $userId)
            ->where('data_inicio', '>=', Carbon::now())
            ->orderBy('data_inicio', 'asc')
            ->take(4)
            ->get();

        return view('home', compact(
            'totalCompromissos',
            'totalLembretes',
            'totalTarefasHoje',
            'totalQuadrosKanban',
            'proximosCompromissos'
        ));
    }
}
