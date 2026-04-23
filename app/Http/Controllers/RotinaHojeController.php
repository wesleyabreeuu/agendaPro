<?php

namespace App\Http\Controllers;

use App\Http\Requests\Rotinas\RecordRotinaExecucaoRequest;
use App\Models\Rotina;
use App\Services\RotinaAnalyticsService;
use App\Services\RotinaPlannerService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RotinaHojeController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function index(RotinaAnalyticsService $analyticsService): Response
    {
        $dashboard = $analyticsService->buildModuleDashboard(Auth::user());

        return Inertia::render('Rotinas/Today', [
            'summary' => $dashboard['summary'],
            'today' => $dashboard['today'],
            'recentProgress' => $dashboard['recentProgress'],
        ]);
    }

    public function storeExecution(
        RecordRotinaExecucaoRequest $request,
        Rotina $rotina,
        RotinaPlannerService $planner
    ): RedirectResponse {
        $this->authorize('execute', $rotina);
        $date = $request->filled('data') ? Carbon::parse($request->input('data'))->startOfDay() : now()->startOfDay();
        $status = $request->string('status')->toString();
        $modoUsado = $request->input('modo_usado', 'normal');

        if ($status === 'concluida' && $modoUsado === 'minimo' && !$rotina->modo_minimo_ativo) {
            return back()->with('error', 'Essa rotina não possui modo mínimo configurado.');
        }

        $planner->recordExecution(
            $rotina,
            Auth::id(),
            $date,
            $status,
            $modoUsado,
            $request->input('observacao')
        );

        return back()->with('success', match ($status) {
            'concluida' => $modoUsado === 'minimo' ? 'Rotina concluída no modo mínimo.' : 'Rotina concluída com sucesso.',
            'pulada' => 'Rotina marcada como pulada.',
            default => 'Status da rotina atualizado.',
        });
    }
}
