<?php

use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CompromissoCompartilhamentoController;
use App\Http\Controllers\Api\HabitoController;
use App\Http\Controllers\Api\HabitoLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/ai/command', [AIController::class, 'handle']);
});

Route::middleware(['web', 'auth', 'can:access-compromissos'])->group(function () {
    Route::get('/compromissos/compartilhados', [CompromissoCompartilhamentoController::class, 'index']);
    Route::get('/compromissos/{compromisso}', [CompromissoCompartilhamentoController::class, 'show']);
    Route::put('/compromissos/{compromisso}', [CompromissoCompartilhamentoController::class, 'update']);
    Route::post('/compromissos/{compromisso}/compartilhar', [CompromissoCompartilhamentoController::class, 'store']);
    Route::delete('/compromissos/{compromisso}/compartilhar/{usuario}', [CompromissoCompartilhamentoController::class, 'destroy']);
});

Route::middleware(['web', 'auth', 'can:access-dia-a-dia'])->group(function () {
    Route::get('/habitos', [HabitoController::class, 'index']);
    Route::post('/habitos', [HabitoController::class, 'store']);
    Route::get('/habitos/{habito}', [HabitoController::class, 'show']);
    Route::put('/habitos/{habito}', [HabitoController::class, 'update']);
    Route::delete('/habitos/{habito}', [HabitoController::class, 'destroy']);
    Route::post('/habitos/{habito}/concluir', [HabitoLogController::class, 'store']);
    Route::get('/habitos/{habito}/estatisticas', [HabitoController::class, 'stats']);
});
