<?php

namespace App\Http\Controllers;

use App\Services\RelatorioGeralService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RelatorioGeralController extends Controller
{
    public function index(Request $request, RelatorioGeralService $service): Response
    {
        $filters = $request->validate([
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date'],
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:40'],
            'secoes' => ['nullable', 'array'],
            'secoes.*' => ['string', 'max:80'],
            'campos' => ['nullable', 'array'],
            'campos.*' => ['string', 'max:120'],
        ]);

        return Inertia::render('Relatorios/Geral', [
            'relatorio' => $service->gerar($request->user(), $filters),
        ]);
    }
}
