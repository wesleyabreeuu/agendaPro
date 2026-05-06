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

        $dataInicioSemana = Carbon::now()->startOfWeek();
        $dataFimSemana = Carbon::now()->endOfWeek();

        $atividadesSemana = AtividadeFisica::where('user_id', $user->id)
            ->whereBetween('data', [$dataInicioSemana, $dataFimSemana])
            ->with('categoria')
            ->orderBy('data', 'desc')
            ->get();

        $atividades = AtividadeFisica::where('user_id', $user->id)
            ->with('categoria')
            ->orderBy('data')
            ->get();

        $pedais = $atividades->filter(fn (AtividadeFisica $atividade) => $this->isRideActivity($atividade));

        $totalTempoMovimento = $pedais->sum(fn (AtividadeFisica $atividade) => $this->movingSeconds($atividade));
        $totalTempoDecorrido = $pedais->sum(fn (AtividadeFisica $atividade) => $this->elapsedSeconds($atividade));
        $totalDistancia = $pedais->sum(fn (AtividadeFisica $atividade) => (float) ($atividade->distancia_metros ?? 0));
        $velocidadeMedia = $totalTempoMovimento > 0 ? ($totalDistancia / $totalTempoMovimento) * 3.6 : 0;

        $atividadesPorCategoria = $atividades->groupBy('categoria.nome')
            ->map(fn ($group) => [
                'categoria' => $group->first()->categoria->nome,
                'sessoes' => $group->count(),
                'horas' => $group->sum(fn (AtividadeFisica $atividade) => $this->movingSeconds($atividade)) / 3600,
                'calorias' => $group->sum('calorias_queimadas'),
                'distancia_km' => round($group->sum(fn (AtividadeFisica $atividade) => (float) ($atividade->distancia_metros ?? 0)) / 1000, 1),
            ]);

        $metas = MetaSaude::where('user_id', $user->id)
            ->where('ativa', true)
            ->get();

        $metasProgresso = $metas->map(function ($meta) use ($atividadesSemana) {
            $progresso = match ($meta->tipo) {
                'horas_semanais' => $atividadesSemana->sum(fn (AtividadeFisica $atividade) => $this->movingSeconds($atividade)) / 3600,
                'calorias_semana' => $atividadesSemana->sum('calorias_queimadas'),
                'dias_semana' => $atividadesSemana->groupBy('data')->count(),
                'sessoes_mes' => 0, // Será calculado no mês
                default => 0,
            };

            return [
                'meta' => $meta,
                'progresso' => $progresso,
                'percentual' => min(($progresso / $meta->valor_alvo) * 100, 100),
            ];
        });

        $ultimasAtividades = AtividadeFisica::where('user_id', $user->id)
            ->with('categoria')
            ->latest('data')
            ->take(6)
            ->get();

        return Inertia::render('Saude/Dashboard', [
            'resumo' => [
                'total_horas' => round($totalTempoMovimento / 3600, 1),
                'tempo_decorrido_horas' => round($totalTempoDecorrido / 3600, 1),
                'total_calorias' => (int) $pedais->sum('calorias_queimadas'),
                'sessoes' => (int) $pedais->count(),
                'tipos_atividade' => (int) $atividadesPorCategoria->count(),
                'total_km' => round($totalDistancia / 1000, 1),
                'altimetria_total_m' => (int) round($pedais->sum(fn (AtividadeFisica $atividade) => (float) ($atividade->elevacao_ganho_metros ?? 0))),
                'velocidade_media_kmh' => round($velocidadeMedia, 1),
                'velocidade_maxima_kmh' => round((float) $pedais->max(fn (AtividadeFisica $atividade) => (float) ($atividade->velocidade_maxima_kmh ?? 0)), 1),
                'maior_pedal_km' => round(((float) $pedais->max(fn (AtividadeFisica $atividade) => (float) ($atividade->distancia_metros ?? 0))) / 1000, 1),
                'maior_ganho_elevacao_m' => (int) round((float) $pedais->max(fn (AtividadeFisica $atividade) => (float) ($atividade->elevacao_ganho_metros ?? 0))),
                'pico_altimetria_m' => (int) round((float) $pedais->max(fn (AtividadeFisica $atividade) => (float) ($atividade->elevacao_maxima_metros ?? 0))),
            ],
            'strava' => [
                'connected' => $user->hasStravaConnected(),
            ],
            'atividadesPorCategoria' => $atividadesPorCategoria->values()->all(),
            'graficos' => [
                'evolucao_mensal' => $this->buildMonthlyRideSeries($pedais),
                'pedais_recentes' => $this->buildRecentRideSeries($pedais),
                'perfil_altimetria' => $this->buildElevationProfile($pedais),
                'ranking' => $this->buildRideRanking($pedais),
            ],
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

    private function isRideActivity(AtividadeFisica $atividade): bool
    {
        $sportType = $atividade->sport_type;
        $categoria = $atividade->categoria?->nome;

        return in_array($sportType, ['Ride', 'GravelRide', 'EBikeRide', 'MountainBikeRide', 'VirtualRide'], true)
            || $categoria === 'Ciclismo';
    }

    private function movingSeconds(AtividadeFisica $atividade): int
    {
        return (int) ($atividade->tempo_movimento_segundos ?: ($atividade->duracao_minutos * 60));
    }

    private function elapsedSeconds(AtividadeFisica $atividade): int
    {
        return (int) ($atividade->tempo_decorrido_segundos ?: $this->movingSeconds($atividade));
    }

    private function buildMonthlyRideSeries($pedais): array
    {
        $months = collect(range(11, 0))
            ->mapWithKeys(function (int $offset) {
                $date = now()->subMonths($offset);

                return [$date->format('Y-m') => [
                    'date' => $date->startOfMonth()->toDateString(),
                    'mes' => $date->translatedFormat('M/y'),
                    'km' => 0,
                    'altimetria' => 0,
                    'calorias' => 0,
                    'horas' => 0,
                    'sessoes' => 0,
                ]];
            });

        $pedais
            ->filter(fn (AtividadeFisica $atividade) => $atividade->data?->gte(now()->subMonths(11)->startOfMonth()))
            ->groupBy(fn (AtividadeFisica $atividade) => $atividade->data?->format('Y-m'))
            ->each(function ($group, string $key) use (&$months) {
                if (!$months->has($key)) {
                    return;
                }

                $months[$key] = [
                    'date' => $months[$key]['date'],
                    'mes' => $months[$key]['mes'],
                    'km' => round($group->sum(fn (AtividadeFisica $atividade) => (float) ($atividade->distancia_metros ?? 0)) / 1000, 1),
                    'altimetria' => (int) round($group->sum(fn (AtividadeFisica $atividade) => (float) ($atividade->elevacao_ganho_metros ?? 0))),
                    'calorias' => (int) $group->sum('calorias_queimadas'),
                    'horas' => round($group->sum(fn (AtividadeFisica $atividade) => $this->movingSeconds($atividade)) / 3600, 1),
                    'sessoes' => $group->count(),
                ];
            });

        return $months->values()->all();
    }

    private function buildRecentRideSeries($pedais): array
    {
        return $pedais
            ->sortByDesc('data')
            ->take(12)
            ->reverse()
            ->values()
            ->map(fn (AtividadeFisica $atividade) => [
                'label' => $atividade->data?->format('d/m') ?? '-',
                'nome' => $atividade->descricao ?: 'Pedal',
                'km' => round(((float) ($atividade->distancia_metros ?? 0)) / 1000, 1),
                'altimetria' => (int) round((float) ($atividade->elevacao_ganho_metros ?? 0)),
                'velocidade_media' => round((float) ($atividade->velocidade_media_kmh ?? 0), 1),
                'velocidade_maxima' => round((float) ($atividade->velocidade_maxima_kmh ?? 0), 1),
                'calorias' => (int) ($atividade->calorias_queimadas ?? 0),
            ])
            ->all();
    }

    private function buildElevationProfile($pedais): array
    {
        $atividade = $pedais
            ->filter(fn (AtividadeFisica $atividade) => !empty($atividade->stream_data['altitude']) && !empty($atividade->stream_data['distance']))
            ->sortByDesc('data')
            ->first();

        if (!$atividade) {
            return [
                'atividade' => null,
                'pontos' => [],
            ];
        }

        $altitude = $atividade->stream_data['altitude'] ?? [];
        $distance = $atividade->stream_data['distance'] ?? [];
        $velocity = $atividade->stream_data['velocity_smooth'] ?? [];
        $limit = min(count($altitude), count($distance));
        $points = [];

        for ($index = 0; $index < $limit; $index++) {
            $points[] = [
                'km' => round(((float) $distance[$index]) / 1000, 2),
                'altitude' => round((float) $altitude[$index], 1),
                'velocidade' => isset($velocity[$index]) ? round(((float) $velocity[$index]) * 3.6, 1) : null,
            ];
        }

        return [
            'atividade' => $this->serializeAtividade($atividade),
            'pontos' => $points,
        ];
    }

    private function buildRideRanking($pedais): array
    {
        $build = fn ($collection) => $collection
            ->take(5)
            ->values()
            ->map(fn (AtividadeFisica $atividade) => [
                'id' => $atividade->id,
                'nome' => $atividade->descricao ?: 'Pedal',
                'data' => $atividade->data?->format('d/m/Y'),
                'km' => round(((float) ($atividade->distancia_metros ?? 0)) / 1000, 1),
                'altimetria' => (int) round((float) ($atividade->elevacao_ganho_metros ?? 0)),
                'velocidade_media' => round((float) ($atividade->velocidade_media_kmh ?? 0), 1),
                'velocidade_maxima' => round((float) ($atividade->velocidade_maxima_kmh ?? 0), 1),
                'calorias' => (int) ($atividade->calorias_queimadas ?? 0),
            ])
            ->all();

        return [
            'distancia' => $build($pedais->sortByDesc(fn (AtividadeFisica $atividade) => (float) ($atividade->distancia_metros ?? 0))),
            'altimetria' => $build($pedais->sortByDesc(fn (AtividadeFisica $atividade) => (float) ($atividade->elevacao_ganho_metros ?? 0))),
            'velocidade' => $build($pedais->sortByDesc(fn (AtividadeFisica $atividade) => (float) ($atividade->velocidade_media_kmh ?? 0))),
        ];
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
            'tempo_movimento_segundos' => (int) ($atividade->tempo_movimento_segundos ?: $this->movingSeconds($atividade)),
            'tempo_decorrido_segundos' => (int) ($atividade->tempo_decorrido_segundos ?: $this->elapsedSeconds($atividade)),
            'tempo_movimento_formatado' => $atividade->tempo_movimento_formatado,
            'tempo_decorrido_formatado' => $atividade->tempo_decorrido_formatado,
            'intensidade' => $atividade->intensidade,
            'calorias_queimadas' => (int) $atividade->calorias_queimadas,
            'distancia_metros' => $atividade->distancia_metros,
            'distancia_km' => $atividade->distancia_km,
            'distancia_formatada' => $atividade->distancia_formatada,
            'elevacao_ganho_metros' => $atividade->elevacao_ganho_metros,
            'elevacao_maxima_metros' => $atividade->elevacao_maxima_metros,
            'elevacao_minima_metros' => $atividade->elevacao_minima_metros,
            'elevacao_formatada' => $atividade->elevacao_formatada,
            'elevacao_maxima_formatada' => $atividade->elevacao_maxima_formatada,
            'velocidade_media_kmh' => $atividade->velocidade_media_kmh,
            'velocidade_maxima_kmh' => $atividade->velocidade_maxima_kmh,
            'ritmo_medio_formatado' => $atividade->ritmo_medio_formatado,
            'achievement_count' => $atividade->achievement_count,
            'pr_count' => $atividade->pr_count,
            'total_photo_count' => $atividade->total_photo_count,
            'sport_type' => $atividade->sport_type,
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
