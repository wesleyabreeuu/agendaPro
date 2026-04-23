<?php

namespace App\Http\Controllers;

use App\Http\Requests\Rotinas\ApplyRotinaTemplateRequest;
use App\Models\Rotina;
use App\Models\RotinaTemplate;
use App\Services\RotinaTemplateCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RotinaTemplateController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function index(RotinaTemplateCatalog $catalog): Response
    {
        $catalog->ensureDefaults();
        $templates = RotinaTemplate::query()->where('ativo', true)->orderBy('nome')->get();

        return Inertia::render('Rotinas/Templates', [
            'templates' => $templates->map(fn (RotinaTemplate $template) => [
                'id' => $template->id,
                'nome' => $template->nome,
                'descricao' => $template->descricao,
                'categoria' => $template->categoria,
                'total_rotinas' => count($template->rotinas ?? []),
                'rotinas' => collect($template->rotinas ?? [])->map(fn (array $item) => [
                    'nome' => $item['nome'] ?? 'Rotina',
                    'categoria' => $item['categoria'] ?? $template->categoria,
                    'modo_minimo_ativo' => (bool) ($item['modo_minimo_ativo'] ?? false),
                ])->values()->all(),
            ])->values()->all(),
        ]);
    }

    public function apply(ApplyRotinaTemplateRequest $request, RotinaTemplate $template): RedirectResponse
    {
        $catalog = collect($template->rotinas ?? []);
        $startingOrder = (int) Rotina::ownedBy(Auth::id())->max('ordem');

        $catalog->each(function (array $item, int $index) use ($template, $startingOrder) {
            Rotina::create([
                'user_id' => Auth::id(),
                'nome' => $item['nome'] ?? 'Rotina',
                'descricao' => $item['descricao'] ?? null,
                'categoria' => $item['categoria'] ?? $template->categoria,
                'frequencia_tipo' => $item['frequencia_tipo'] ?? 'diaria',
                'dias_semana' => $item['dias_semana'] ?? null,
                'intervalo_dias' => $item['intervalo_dias'] ?? null,
                'data_inicio' => now()->toDateString(),
                'horario' => $item['horario'] ?? null,
                'dificuldade' => $item['dificuldade'] ?? 'media',
                'energia_recomendada' => $item['energia_recomendada'] ?? null,
                'modo_minimo_ativo' => (bool) ($item['modo_minimo_ativo'] ?? false),
                'modo_minimo_descricao' => $item['modo_minimo_descricao'] ?? null,
                'cor' => $item['cor'] ?? null,
                'icone' => $item['icone'] ?? null,
                'ativo' => true,
                'ordem' => $startingOrder + $index + 1,
            ]);
        });

        return redirect()
            ->route('rotinas.index')
            ->with('success', 'Template aplicado com sucesso.');
    }
}
