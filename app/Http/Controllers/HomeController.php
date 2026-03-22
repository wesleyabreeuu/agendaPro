<?php

namespace App\Http\Controllers;

use App\Models\AtividadeFisica;
use App\Models\Compromisso;
use App\Models\ContaBancaria;
use App\Models\KanbanBoard;
use App\Models\KanbanTask;
use App\Models\Lembrete;
use App\Models\Todo;
use App\Models\TransacaoFinanceira;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class HomeController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $today = Carbon::today();
        $startOfMonth = $today->copy()->startOfMonth();
        $endOfMonth = $today->copy()->endOfMonth();
        $startOfWeek = $today->copy()->startOfWeek();
        $endOfWeek = $today->copy()->endOfWeek();

        $compromissosMes = Compromisso::query()
            ->where('usuarios_id', $userId)
            ->whereBetween('data_inicio', [$startOfMonth, $endOfMonth])
            ->count();

        $compromissosHoje = Compromisso::query()
            ->where('usuarios_id', $userId)
            ->whereDate('data_inicio', $today)
            ->count();

        $totalLembretes = Lembrete::query()
            ->whereHas('compromisso', function ($query) use ($userId) {
                $query->where('usuarios_id', $userId);
            })
            ->count();

        $totalTarefasHoje = Todo::ownedBy($userId)
            ->whereDate('data', $today)
            ->count();

        $tarefasPendentes = Todo::ownedBy($userId)
            ->where('status', '!=', 'finalizado')
            ->count();

        $totalQuadrosKanban = Schema::hasTable('kanban_boards')
            ? KanbanBoard::query()->where('user_id', $userId)->count()
            : 0;

        $proximosCompromissos = Compromisso::query()
            ->where('usuarios_id', $userId)
            ->where('data_inicio', '>=', Carbon::now())
            ->orderBy('data_inicio')
            ->take(5)
            ->get();

        $agendaHoje = Compromisso::query()
            ->where('usuarios_id', $userId)
            ->whereDate('data_inicio', $today)
            ->orderBy('data_inicio')
            ->take(6)
            ->get();

        $tarefasHoje = Todo::ownedBy($userId)
            ->whereDate('data', $today)
            ->orderByRaw("FIELD(status, 'pendente', 'em_andamento', 'finalizado')")
            ->orderBy('hora')
            ->take(6)
            ->get();

        $compromissosPorDia = collect(range(0, 6))->map(function (int $offset) use ($today, $userId) {
            $date = $today->copy()->addDays($offset);

            return [
                'label' => $date->translatedFormat('D'),
                'total' => Compromisso::query()
                    ->where('usuarios_id', $userId)
                    ->whereDate('data_inicio', $date)
                    ->count(),
            ];
        });

        $tarefasPorStatus = Todo::ownedBy($userId)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $tarefasFinalizadasSemana = collect(range(6, 0))->map(function (int $offset) use ($today, $userId) {
            $date = $today->copy()->subDays($offset);

            return [
                'label' => $date->format('d/m'),
                'total' => Todo::ownedBy($userId)
                    ->whereDate('finalizado_em', $date)
                    ->count(),
            ];
        })->values();

        $financeiro = $this->buildFinanceiroData($userId, $startOfMonth, $endOfMonth);
        $saude = $this->buildSaudeData($userId, $startOfWeek, $endOfWeek, $today);
        $kanban = $this->buildKanbanData($userId);

        return view('home', [
            'cards' => [
                'compromissosMes' => $compromissosMes,
                'compromissosHoje' => $compromissosHoje,
                'totalLembretes' => $totalLembretes,
                'totalTarefasHoje' => $totalTarefasHoje,
                'tarefasPendentes' => $tarefasPendentes,
                'totalQuadrosKanban' => $totalQuadrosKanban,
                'saldoTotal' => $financeiro['saldoTotal'],
                'horasSemana' => $saude['horasSemana'],
            ],
            'proximosCompromissos' => $proximosCompromissos,
            'agendaHoje' => $agendaHoje,
            'tarefasHoje' => $tarefasHoje,
            'financeiro' => $financeiro,
            'saude' => $saude,
            'kanban' => $kanban,
            'chartData' => [
                'compromissosSemana' => [
                    'labels' => $compromissosPorDia->pluck('label')->values(),
                    'values' => $compromissosPorDia->pluck('total')->values(),
                ],
                'tarefasStatus' => [
                    'labels' => ['Pendentes', 'Em andamento', 'Finalizadas'],
                    'values' => [
                        (int) ($tarefasPorStatus['pendente'] ?? 0),
                        (int) ($tarefasPorStatus['em_andamento'] ?? 0),
                        (int) ($tarefasPorStatus['finalizado'] ?? 0),
                    ],
                ],
                'tarefasConcluidas' => [
                    'labels' => $tarefasFinalizadasSemana->pluck('label')->values(),
                    'values' => $tarefasFinalizadasSemana->pluck('total')->values(),
                ],
                'financeiro' => $financeiro['chart'],
                'saude' => $saude['chart'],
            ],
        ]);
    }

    private function buildFinanceiroData(int $userId, Carbon $startOfMonth, Carbon $endOfMonth): array
    {
        if (!Schema::hasTable('conta_bancaria') || !Schema::hasTable('transacao_financeira')) {
            return [
                'saldoTotal' => 0,
                'receitasMes' => 0,
                'despesasMes' => 0,
                'resultadoMes' => 0,
                'chart' => [
                    'labels' => [],
                    'receitas' => [],
                    'despesas' => [],
                ],
            ];
        }

        $saldoTotal = (float) ContaBancaria::query()
            ->where('user_id', $userId)
            ->sum('saldo_atual');

        $transacoesMes = TransacaoFinanceira::query()
            ->where('user_id', $userId)
            ->whereBetween('data', [$startOfMonth, $endOfMonth])
            ->get();

        $receitasMes = (float) $transacoesMes->where('tipo', 'receita')->sum('valor');
        $despesasMes = (float) $transacoesMes->where('tipo', 'despesa')->sum('valor');

        $months = collect(range(5, 0))->map(function (int $offset) {
            return now()->startOfMonth()->subMonths($offset);
        })->values();

        $labels = $months->map(fn (Carbon $month) => $month->translatedFormat('M'));
        $receitas = [];
        $despesas = [];

        foreach ($months as $month) {
            $monthTransactions = TransacaoFinanceira::query()
                ->where('user_id', $userId)
                ->whereYear('data', $month->year)
                ->whereMonth('data', $month->month)
                ->get();

            $receitas[] = (float) $monthTransactions->where('tipo', 'receita')->sum('valor');
            $despesas[] = (float) $monthTransactions->where('tipo', 'despesa')->sum('valor');
        }

        return [
            'saldoTotal' => $saldoTotal,
            'receitasMes' => $receitasMes,
            'despesasMes' => $despesasMes,
            'resultadoMes' => $receitasMes - $despesasMes,
            'chart' => [
                'labels' => $labels,
                'receitas' => $receitas,
                'despesas' => $despesas,
            ],
        ];
    }

    private function buildSaudeData(int $userId, Carbon $startOfWeek, Carbon $endOfWeek, Carbon $today): array
    {
        if (!Schema::hasTable('atividade_fisica')) {
            return [
                'horasSemana' => 0,
                'caloriasSemana' => 0,
                'atividadesSemana' => 0,
                'chart' => [
                    'labels' => [],
                    'duracao' => [],
                    'calorias' => [],
                ],
            ];
        }

        $atividadesSemana = AtividadeFisica::query()
            ->where('user_id', $userId)
            ->whereBetween('data', [$startOfWeek, $endOfWeek])
            ->get();

        $series = collect(range(0, 6))->map(function (int $offset) use ($startOfWeek, $userId) {
            $date = $startOfWeek->copy()->addDays($offset);
            $items = AtividadeFisica::query()
                ->where('user_id', $userId)
                ->whereDate('data', $date)
                ->get();

            return [
                'label' => $date->format('d/m'),
                'duracao' => (int) $items->sum('duracao_minutos'),
                'calorias' => (int) $items->sum('calorias_queimadas'),
            ];
        });

        return [
            'horasSemana' => round($atividadesSemana->sum('duracao_minutos') / 60, 1),
            'caloriasSemana' => (int) $atividadesSemana->sum('calorias_queimadas'),
            'atividadesSemana' => $atividadesSemana->count(),
            'chart' => [
                'labels' => $series->pluck('label')->values(),
                'duracao' => $series->pluck('duracao')->values(),
                'calorias' => $series->pluck('calorias')->values(),
            ],
        ];
    }

    private function buildKanbanData(int $userId): array
    {
        if (!Schema::hasTable('kanban_tasks') || !Schema::hasTable('kanban_boards')) {
            return [
                'pendentes' => 0,
                'andamento' => 0,
                'finalizadas' => 0,
                'atrasadas' => 0,
            ];
        }

        $tasks = KanbanTask::query()
            ->whereHas('quadro', fn ($query) => $query->where('user_id', $userId))
            ->get();

        return [
            'pendentes' => $tasks->where('status', 'pendente')->count(),
            'andamento' => $tasks->where('status', 'em_andamento')->count(),
            'finalizadas' => $tasks->where('status', 'finalizado')->count(),
            'atrasadas' => $tasks->where('status', 'atrasado')->count(),
        ];
    }
}
