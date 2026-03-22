<?php

namespace App\Http\Controllers;

use App\Models\AtividadeFisica;
use App\Models\CategoriaAtividadeFisica;
use App\Models\MetaSaude;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class SaudeController extends Controller
{
    public const CATEGORIAS_PADRAO = [
        [
            'nome' => 'Corrida',
            'icone' => 'fas fa-running',
            'cor' => '#e74c3c',
            'caloria_leve' => 8,
            'caloria_moderada' => 12,
            'caloria_intensa' => 16,
        ],
        [
            'nome' => 'Musculação',
            'icone' => 'fas fa-dumbbell',
            'cor' => '#f39c12',
            'caloria_leve' => 5,
            'caloria_moderada' => 8,
            'caloria_intensa' => 12,
        ],
        [
            'nome' => 'Yoga',
            'icone' => 'fas fa-spa',
            'cor' => '#9b59b6',
            'caloria_leve' => 3,
            'caloria_moderada' => 5,
            'caloria_intensa' => 7,
        ],
        [
            'nome' => 'Natação',
            'icone' => 'fas fa-swimmer',
            'cor' => '#3498db',
            'caloria_leve' => 8,
            'caloria_moderada' => 12,
            'caloria_intensa' => 16,
        ],
        [
            'nome' => 'Ciclismo',
            'icone' => 'fas fa-biking',
            'cor' => '#1abc9c',
            'caloria_leve' => 8,
            'caloria_moderada' => 12,
            'caloria_intensa' => 18,
        ],
        [
            'nome' => 'Futebol',
            'icone' => 'fas fa-futbol',
            'cor' => '#16a34a',
            'caloria_leve' => 8,
            'caloria_moderada' => 14,
            'caloria_intensa' => 18,
        ],
        [
            'nome' => 'Caminhada',
            'icone' => 'fas fa-person-hiking',
            'cor' => '#8bc34a',
            'caloria_leve' => 4,
            'caloria_moderada' => 6,
            'caloria_intensa' => 9,
        ],
        [
            'nome' => 'Pilates',
            'icone' => 'fas fa-person-booth',
            'cor' => '#3f51b5',
            'caloria_leve' => 4,
            'caloria_moderada' => 6,
            'caloria_intensa' => 8,
        ],
    ];

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao();

        // Período: última semana
        $dataInicio = Carbon::now()->startOfWeek();
        $dataFim = Carbon::now()->endOfWeek();

        // Atividades da semana
        $atividades = AtividadeFisica::where('user_id', $user->id)
            ->whereBetween('data', [$dataInicio, $dataFim])
            ->with('categoria')
            ->orderBy('data', 'desc')
            ->get();

        // Estatísticas
        $totalHoras = $atividades->sum('duracao_minutos') / 60;
        $totalCalorias = $atividades->sum('calorias_queimadas');
        $sessoes = $atividades->count();

        // Atividades por categoria
        $atividadesPorCategoria = $atividades->groupBy('categoria.nome')
            ->map(fn ($group) => [
                'categoria' => $group->first()->categoria->nome,
                'sessoes' => $group->count(),
                'horas' => $group->sum('duracao_minutos') / 60,
                'calorias' => $group->sum('calorias_queimadas'),
            ]);

        // Metas
        $metas = MetaSaude::where('user_id', $user->id)
            ->where('ativa', true)
            ->get();

        // Progressão de metas
        $metasProgresso = $metas->map(function ($meta) use ($atividades) {
            $progresso = match ($meta->tipo) {
                'horas_semanais' => $atividades->sum('duracao_minutos') / 60,
                'calorias_semana' => $atividades->sum('calorias_queimadas'),
                'dias_semana' => $atividades->groupBy('data')->count(),
                'sessoes_mes' => 0, // Será calculado no mês
                default => 0,
            };

            return [
                'meta' => $meta,
                'progresso' => $progresso,
                'percentual' => min(($progresso / $meta->valor_alvo) * 100, 100),
            ];
        });

        // últimas atividades
        $ultimasAtividades = AtividadeFisica::where('user_id', $user->id)
            ->with('categoria')
            ->latest('data')
            ->take(5)
            ->get();

        return view('saude.dashboard', compact(
            'totalHoras',
            'totalCalorias',
            'sessoes',
            'atividades',
            'atividadesPorCategoria',
            'metas',
            'metasProgresso',
            'ultimasAtividades'
        ));
    }

    public function atividades(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao();

        $categorias = CategoriaAtividadeFisica::query()
            ->orderBy('nome')
            ->get();
        $atividades = AtividadeFisica::where('user_id', $user->id)
            ->with('categoria')
            ->orderBy('data', 'desc')
            ->paginate(15);

        return view('saude.atividades', compact('atividades', 'categorias'));
    }

    public function storeAtividade(Request $request)
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao();

        $request->validate([
            'categoria_atividade_fisica_id' => 'required|exists:categoria_atividade_fisica,id',
            'descricao' => 'nullable|string|max:255',
            'data' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'duracao_minutos' => 'required|integer|min:1',
            'intensidade' => 'required|in:leve,moderada,intensa',
            'notas' => 'nullable|string',
        ]);

        AtividadeFisica::create([
            'user_id' => $user->id,
            'categoria_atividade_fisica_id' => $request->categoria_atividade_fisica_id,
            'descricao' => $request->descricao,
            'data' => $request->data,
            'hora_inicio' => $request->hora_inicio,
            'duracao_minutos' => $request->duracao_minutos,
            'intensidade' => $request->intensidade,
            'notas' => $request->notas,
        ]);

        return redirect()->route('saude.atividades')
            ->with('success', 'Atividade registrada com sucesso!');
    }

    public function storeCategoria(Request $request)
    {
        $this->garantirCategoriasPadrao();

        $request->validate([
            'nome' => 'required|string|max:255',
            'icone' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:20',
            'caloria_leve' => 'required|numeric|min:0',
            'caloria_moderada' => 'required|numeric|min:0',
            'caloria_intensa' => 'required|numeric|min:0',
        ]);

        CategoriaAtividadeFisica::updateOrCreate(
            ['nome' => $request->nome],
            [
                'icone' => $request->filled('icone') ? $request->icone : 'fas fa-dumbbell',
                'cor' => $request->filled('cor') ? $request->cor : '#e74c3c',
                'caloria_leve' => $request->caloria_leve,
                'caloria_moderada' => $request->caloria_moderada,
                'caloria_intensa' => $request->caloria_intensa,
            ]
        );

        return redirect()->route('saude.atividades')
            ->with('success', 'Tipo de atividade criado com sucesso!');
    }

    public function editAtividade(AtividadeFisica $atividade): View
    {
        $user = Auth::user();
        abort_unless($atividade->user_id === $user->id, 403);
        $this->garantirCategoriasPadrao();

        $categorias = CategoriaAtividadeFisica::query()
            ->orderBy('nome')
            ->get();

        return view('saude.edit-atividade', compact('atividade', 'categorias'));
    }

    public function updateAtividade(Request $request, AtividadeFisica $atividade)
    {
        $user = Auth::user();
        abort_unless($atividade->user_id === $user->id, 403);

        $request->validate([
            'categoria_atividade_fisica_id' => 'required|exists:categoria_atividade_fisica,id',
            'descricao' => 'nullable|string|max:255',
            'data' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'duracao_minutos' => 'required|integer|min:1',
            'intensidade' => 'required|in:leve,moderada,intensa',
            'notas' => 'nullable|string',
        ]);

        $atividade->update($request->only(
            'categoria_atividade_fisica_id',
            'descricao',
            'data',
            'hora_inicio',
            'duracao_minutos',
            'intensidade',
            'notas'
        ));

        return redirect()->route('saude.atividades')
            ->with('success', 'Atividade atualizada com sucesso!');
    }

    public function destroyAtividade(AtividadeFisica $atividade)
    {
        $user = Auth::user();
        abort_unless($atividade->user_id === $user->id, 403);

        $atividade->delete();

        return redirect()->route('saude.atividades')
            ->with('success', 'Atividade removida com sucesso!');
    }

    public function calendario(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao();
        $mes = request('mes', Carbon::now()->month);
        $ano = request('ano', Carbon::now()->year);

        $atividades = AtividadeFisica::where('user_id', $user->id)
            ->whereYear('data', $ano)
            ->whereMonth('data', $mes)
            ->with('categoria')
            ->get();

        $eventos = $atividades->map(fn ($atividade) => [
            'date' => $atividade->data->format('Y-m-d'),
            'title' => $atividade->categoria->nome,
            'duracao' => $atividade->duracao_minutos . 'min',
            'calorias' => $atividade->calorias_queimadas . 'kcal',
        ])->toArray();

        return view('saude.calendario', compact('eventos', 'mes', 'ano'));
    }

    public function metas(): View
    {
        $user = Auth::user();
        $metas = MetaSaude::where('user_id', $user->id)
            ->orderBy('ativa', 'desc')
            ->orderBy('data_inicio', 'desc')
            ->get();

        return view('saude.metas', compact('metas'));
    }

    public function storeMeta(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'titulo' => 'required|string|max:255',
            'tipo' => 'required|in:horas_semanais,calorias_semana,dias_semana,sessoes_mes',
            'valor_alvo' => 'required|integer|min:1',
            'periodo' => 'required|in:semanal,mensal',
        ]);

        MetaSaude::create([
            'user_id' => $user->id,
            'titulo' => $request->titulo,
            'tipo' => $request->tipo,
            'valor_alvo' => $request->valor_alvo,
            'periodo' => $request->periodo,
            'data_inicio' => now(),
        ]);

        return redirect()->route('saude.metas')
            ->with('success', 'Meta criada com sucesso!');
    }

    public function destroyMeta(MetaSaude $meta)
    {
        $user = Auth::user();
        abort_unless($meta->user_id === $user->id, 403);

        $meta->delete();

        return redirect()->route('saude.metas')
            ->with('success', 'Meta removida com sucesso!');
    }

    public function relatorios(): View
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao();

        $periodo = request('periodo', 'mes'); // mes, trimestre, ano
        $ano = request('ano', Carbon::now()->year);

        $dataInicio = match ($periodo) {
            'mes' => Carbon::now()->startOfMonth(),
            'trimestre' => Carbon::now()->startOfQuarter(),
            'ano' => Carbon::create($ano, 1, 1),
        };

        $dataFim = match ($periodo) {
            'mes' => Carbon::now()->endOfMonth(),
            'trimestre' => Carbon::now()->endOfQuarter(),
            'ano' => Carbon::create($ano, 12, 31),
        };

        $atividades = AtividadeFisica::where('user_id', $user->id)
            ->whereBetween('data', [$dataInicio, $dataFim])
            ->with('categoria')
            ->get();

        $totalHoras = $atividades->sum('duracao_minutos') / 60;
        $totalCalorias = $atividades->sum('calorias_queimadas');
        $totalSessoes = $atividades->count();
        $diasComAtividade = $atividades->groupBy('data')->count();

        // Top atividades
        $topAtividades = $atividades->groupBy('categoria.nome')
            ->map(fn ($group) => [
                'categoria' => $group->first()->categoria->nome,
                'sessoes' => $group->count(),
                'horas' => $group->sum('duracao_minutos') / 60,
                'calorias' => $group->sum('calorias_queimadas'),
            ])
            ->sortByDesc('horas')
            ->take(5);

        return view('saude.relatorios', compact(
            'totalHoras',
            'totalCalorias',
            'totalSessoes',
            'diasComAtividade',
            'topAtividades',
            'periodo',
            'ano'
        ));
    }

    private function garantirCategoriasPadrao(): void
    {
        if (CategoriaAtividadeFisica::query()->exists()) {
            return;
        }

        foreach (self::CATEGORIAS_PADRAO as $categoria) {
            CategoriaAtividadeFisica::create($categoria);
        }
    }
}
