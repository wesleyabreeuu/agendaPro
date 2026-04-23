<?php

namespace App\Http\Controllers;

use App\Models\RotinaTemplate;
use App\Services\RotinaAnalyticsService;
use App\Services\RotinaTemplateCatalog;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RotinaDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function index(RotinaAnalyticsService $analyticsService, RotinaTemplateCatalog $templateCatalog): Response
    {
        $templateCatalog->ensureDefaults();

        return Inertia::render('Rotinas/Dashboard', [
            ...$analyticsService->buildModuleDashboard(Auth::user()),
            'templatesCount' => RotinaTemplate::query()->where('ativo', true)->count(),
        ]);
    }
}
