<?php

use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CompromissoCompartilhamentoController;
use App\Http\Controllers\Api\HabitoController;
use App\Http\Controllers\Api\HabitoLogController;
use App\Http\Controllers\DailySessionController;
use App\Http\Controllers\MeuDiaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'throttle:api-authenticated'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/ai/command', [AIController::class, 'handle'])->middleware('throttle:ai-commands');
});

Route::middleware(['web', 'auth', 'can:access-compromissos', 'throttle:api-authenticated'])->group(function () {
    Route::get('/compromissos/compartilhados', [CompromissoCompartilhamentoController::class, 'index']);
    Route::get('/compromissos/{compromisso}', [CompromissoCompartilhamentoController::class, 'show']);
    Route::put('/compromissos/{compromisso}', [CompromissoCompartilhamentoController::class, 'update']);
    Route::post('/compromissos/{compromisso}/compartilhar', [CompromissoCompartilhamentoController::class, 'store']);
    Route::delete('/compromissos/{compromisso}/compartilhar/{usuario}', [CompromissoCompartilhamentoController::class, 'destroy']);
});

Route::middleware(['web', 'auth', 'can:access-dia-a-dia', 'throttle:api-authenticated'])->group(function () {
    Route::get('/habitos', [HabitoController::class, 'index']);
    Route::post('/habitos', [HabitoController::class, 'store']);
    Route::get('/habitos/{habito}', [HabitoController::class, 'show']);
    Route::put('/habitos/{habito}', [HabitoController::class, 'update']);
    Route::delete('/habitos/{habito}', [HabitoController::class, 'destroy']);
    Route::post('/habitos/{habito}/concluir', [HabitoLogController::class, 'store']);
    Route::get('/habitos/{habito}/estatisticas', [HabitoController::class, 'stats']);
    Route::get('/meu-dia', [MeuDiaController::class, 'index']);
    Route::post('/meu-dia/action', [MeuDiaController::class, 'action']);
    Route::get('/daily-session/check', [DailySessionController::class, 'check']);
    Route::post('/daily-session/start', [DailySessionController::class, 'start']);
});
