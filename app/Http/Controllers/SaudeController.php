<?php

namespace App\Http\Controllers;

use App\Models\AtividadeFisica;
use App\Models\CategoriaAtividadeFisica;
use App\Models\MetaSaude;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

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

    public function dashboard(): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

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

        return Inertia::render('Saude/Dashboard', [
            'resumo' => [
                'total_horas' => (float) $totalHoras,
                'total_calorias' => (int) $totalCalorias,
                'sessoes' => (int) $sessoes,
                'tipos_atividade' => (int) $atividadesPorCategoria->count(),
            ],
            'strava' => [
                'connected' => $user->hasStravaConnected(),
            ],
            'atividadesPorCategoria' => $atividadesPorCategoria->values()->all(),
            'metasProgresso' => $metasProgresso->map(fn (array $item) => [
                'meta' => $this->serializeMeta($item['meta']),
                'progresso' => (float) $item['progresso'],
                'percentual' => (float) $item['percentual'],
            ])->values()->all(),
            'ultimasAtividades' => $ultimasAtividades->map(fn (AtividadeFisica $atividade) => $this->serializeAtividade($atividade))->values()->all(),
        ]);
    }

    public function atividades(): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

        $categorias = CategoriaAtividadeFisica::ownedBy($user->id)
            ->orderBy('nome')
            ->get();
        $atividades = AtividadeFisica::where('user_id', $user->id)
            ->with('categoria')
            ->orderBy('data', 'desc')
            ->paginate(15);

        return Inertia::render('Saude/Atividades', [
            'atividades' => [
                'data' => $atividades->getCollection()->map(fn (AtividadeFisica $atividade) => $this->serializeAtividade($atividade))->values()->all(),
                'current_page' => $atividades->currentPage(),
                'last_page' => $atividades->lastPage(),
                'per_page' => $atividades->perPage(),
                'total' => $atividades->total(),
            ],
            'categorias' => $categorias->map(fn (CategoriaAtividadeFisica $categoria) => $this->serializeCategoria($categoria))->values()->all(),
        ]);
    }

    public function storeAtividade(Request $request)
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

        $request->validate([
            'categoria_atividade_fisica_id' => 'required|exists:categoria_atividade_fisica,id',
            'descricao' => 'nullable|string|max:255',
            'data' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'duracao_minutos' => 'required|integer|min:1',
            'intensidade' => 'required|in:leve,moderada,intensa',
            'notas' => 'nullable|string',
        ]);

        $categoria = CategoriaAtividadeFisica::ownedBy($user->id)
            ->findOrFail($request->categoria_atividade_fisica_id);

        AtividadeFisica::create([
            'user_id' => $user->id,
            'categoria_atividade_fisica_id' => $categoria->id,
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
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

        $request->validate([
            'nome' => 'required|string|max:255',
            'icone' => 'nullable|string|max:255',
            'cor' => 'nullable|string|max:20',
            'caloria_leve' => 'required|numeric|min:0',
            'caloria_moderada' => 'required|numeric|min:0',
            'caloria_intensa' => 'required|numeric|min:0',
        ]);

        CategoriaAtividadeFisica::updateOrCreate(
            [
                'user_id' => $user->id,
                'nome' => $request->nome,
            ],
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

    public function editAtividade(AtividadeFisica $atividade): Response
    {
        $user = Auth::user();
        abort_unless($atividade->user_id === $user->id, 403);
        $this->garantirCategoriasPadrao($user->id);

        $categorias = CategoriaAtividadeFisica::ownedBy($user->id)
            ->orderBy('nome')
            ->get();

        return Inertia::render('Saude/EditAtividade', [
            'atividade' => $this->serializeAtividadeForm($atividade),
            'categorias' => $categorias->map(fn (CategoriaAtividadeFisica $categoria) => $this->serializeCategoria($categoria))->values()->all(),
        ]);
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

        $categoria = CategoriaAtividadeFisica::ownedBy($user->id)
            ->findOrFail($request->categoria_atividade_fisica_id);

        $atividade->update(array_merge($request->only(
            'categoria_atividade_fisica_id',
            'descricao',
            'data',
            'hora_inicio',
            'duracao_minutos',
            'intensidade',
            'notas'
        ), [
            'categoria_atividade_fisica_id' => $categoria->id,
        ]));

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

    public function calendario(): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);
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

        return Inertia::render('Saude/Calendario', [
            'eventos' => $eventos,
            'mes' => (int) $mes,
            'ano' => (int) $ano,
        ]);
    }

    public function metas(): Response
    {
        $user = Auth::user();
        $metas = MetaSaude::where('user_id', $user->id)
            ->orderBy('ativa', 'desc')
            ->orderBy('data_inicio', 'desc')
            ->get();

        return Inertia::render('Saude/Metas', [
            'metas' => $metas->map(fn (MetaSaude $meta) => $this->serializeMeta($meta))->values()->all(),
        ]);
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

    public function relatorios(): Response
    {
        $user = Auth::user();
        $this->garantirCategoriasPadrao($user->id);

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

        return Inertia::render('Saude/Relatorios', [
            'resumo' => [
                'total_horas' => (float) $totalHoras,
                'total_calorias' => (int) $totalCalorias,
                'total_sessoes' => (int) $totalSessoes,
                'dias_com_atividade' => (int) $diasComAtividade,
            ],
            'topAtividades' => $topAtividades->values()->all(),
            'periodo' => $periodo,
            'ano' => (int) $ano,
        ]);
    }

    private function garantirCategoriasPadrao(int $userId): void
    {
        if (CategoriaAtividadeFisica::ownedBy($userId)->exists()) {
            return;
        }

        foreach (self::CATEGORIAS_PADRAO as $categoria) {
            CategoriaAtividadeFisica::create(array_merge($categoria, [
                'user_id' => $userId,
            ]));
        }
    }

    private function serializeCategoria(CategoriaAtividadeFisica $categoria): array
    {
        return [
            'id' => $categoria->id,
            'nome' => $categoria->nome,
            'icone' => $categoria->icone,
            'cor' => $categoria->cor,
            'caloria_leve' => (float) $categoria->caloria_leve,
            'caloria_moderada' => (float) $categoria->caloria_moderada,
            'caloria_intensa' => (float) $categoria->caloria_intensa,
        ];
    }

    private function serializeAtividade(AtividadeFisica $atividade): array
    {
        return [
            'id' => $atividade->id,
            'categoria' => $atividade->categoria ? $this->serializeCategoria($atividade->categoria) : null,
            'descricao' => $atividade->descricao,
            'data' => $atividade->data?->format('d/m/Y'),
            'data_iso' => $atividade->data?->toDateString(),
            'hora_inicio' => $atividade->hora_inicio,
            'duracao_minutos' => (int) $atividade->duracao_minutos,
            'intensidade' => $atividade->intensidade,
            'calorias_queimadas' => (int) $atividade->calorias_queimadas,
            'distancia_formatada' => $atividade->distancia_formatada,
            'elevacao_formatada' => $atividade->elevacao_formatada,
            'velocidade_media_kmh' => $atividade->velocidade_media_kmh,
            'ritmo_medio_formatado' => $atividade->ritmo_medio_formatado,
            'notas' => $atividade->notas,
            'fonte' => $atividade->fonte,
            'strava_url' => $atividade->stravaUrl(),
            'mapa_resumo_svg_path' => $atividade->mapaResumoSvgPath(),
        ];
    }

    private function serializeAtividadeForm(AtividadeFisica $atividade): array
    {
        return [
            'id' => $atividade->id,
            'categoria_atividade_fisica_id' => $atividade->categoria_atividade_fisica_id,
            'descricao' => $atividade->descricao,
            'data' => $atividade->data?->toDateString(),
            'hora_inicio' => $atividade->hora_inicio,
            'duracao_minutos' => (int) $atividade->duracao_minutos,
            'intensidade' => $atividade->intensidade,
            'notas' => $atividade->notas,
        ];
    }

    private function serializeMeta(MetaSaude $meta): array
    {
        return [
            'id' => $meta->id,
            'titulo' => $meta->titulo,
            'tipo' => $meta->tipo,
            'valor_alvo' => (int) $meta->valor_alvo,
            'periodo' => $meta->periodo,
            'ativa' => (bool) $meta->ativa,
            'data_inicio' => $meta->data_inicio?->format('d/m/Y'),
            'data_fim' => $meta->data_fim?->format('d/m/Y'),
        ];
    }
}
