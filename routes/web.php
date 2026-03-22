<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\LembreteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\KanbanController;
use App\Http\Controllers\CompromissoController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\SaudeController;
use App\Http\Controllers\StravaController;

Route::get('/', function () {
    return view('auth/login');
});

Route::get('integracoes/strava/callback', [StravaController::class, 'callback'])->middleware('auth')->name('strava.callback');
Route::get('integracoes/strava/webhook', [StravaController::class, 'webhookVerify'])->name('strava.webhook.verify');
Route::post('integracoes/strava/webhook', [StravaController::class, 'webhook'])->name('strava.webhook');

Auth::routes();

Route::middleware('auth')->group(function () {
    Route::get('/home', [HomeController::class, 'index'])->name('home');

    Route::resource('usuarios', UsuarioController::class)->middleware('auth');
    Route::resource('categorias', CategoriaController::class)->middleware('auth');
    Route::resource('compromissos', CompromissoController::class)
    ->except(['show'])
    ->middleware('auth');

    Route::resource('lembretes', LembreteController::class)->middleware('auth');

    Route::patch('todo/{todo}/status', [TodoController::class, 'status'])
        ->whereNumber('todo')
        ->name('todo.status');

    Route::resource('todo', TodoController::class)
        ->whereNumber('todo');

    // outras rotas que você já tinha
    Route::get('/teste-whatsapp', [LembreteController::class, 'enviarTesteWhatsApp']);
    Route::get('/lembretes/{id}/enviar-whatsapp', [LembreteController::class, 'enviarWhatsApp'])
        ->name('lembretes.enviar-whatsapp');
    Route::get('/lembretes/due/feed', [LembreteController::class, 'due'])->name('lembretes.due');
    Route::get('compromissos/calendario', [CompromissoController::class, 'calendario'])->name('compromissos.calendario');
    Route::get('compromissos/calendario/eventos', [CompromissoController::class, 'calendarioEventos'])->name('compromissos.calendario.eventos');

    Route::get('kanban', [KanbanController::class, 'index'])->name('kanban.index');
    Route::post('kanban/boards', [KanbanController::class, 'storeBoard'])->name('kanban.boards.store');
    Route::put('kanban/boards/{board}', [KanbanController::class, 'updateBoard'])->name('kanban.boards.update');
    Route::delete('kanban/boards/{board}', [KanbanController::class, 'destroyBoard'])->name('kanban.boards.destroy');
    Route::post('kanban/boards/{board}/tasks', [KanbanController::class, 'storeTask'])->name('kanban.tasks.store');
    Route::put('kanban/tasks/{task}', [KanbanController::class, 'updateTask'])->name('kanban.tasks.update');
    Route::delete('kanban/tasks/{task}', [KanbanController::class, 'destroyTask'])->name('kanban.tasks.destroy');
    Route::patch('kanban/tasks/{task}/status', [KanbanController::class, 'status'])->name('kanban.tasks.status');
    Route::post('kanban/tasks/{task}/extend-deadline', [KanbanController::class, 'extendDeadline'])->name('kanban.tasks.extend-deadline');

    // Rotas Financeiro
    Route::prefix('financeiro')->name('financeiro.')->group(function () {
        Route::get('/', [FinanceiroController::class, 'dashboard'])->name('dashboard');
        Route::get('transacoes', [FinanceiroController::class, 'transacoes'])->name('transacoes');
        Route::post('transacoes', [FinanceiroController::class, 'storeTransacao'])->name('store-transacao');
        Route::get('transacoes/{transacao}/edit', [FinanceiroController::class, 'editTransacao'])->name('edit-transacao');
        Route::put('transacoes/{transacao}', [FinanceiroController::class, 'updateTransacao'])->name('update-transacao');
        Route::delete('transacoes/{transacao}', [FinanceiroController::class, 'destroyTransacao'])->name('destroy-transacao');
        Route::post('categorias', [FinanceiroController::class, 'storeCategoria'])->name('store-categoria');
        Route::get('contas', [FinanceiroController::class, 'contas'])->name('contas');
        Route::post('contas', [FinanceiroController::class, 'storeConta'])->name('store-conta');
        Route::get('relatorios', [FinanceiroController::class, 'relatorios'])->name('relatorios');
    });

    // Rotas Saúde
    Route::prefix('saude')->name('saude.')->group(function () {
        Route::get('/', [SaudeController::class, 'dashboard'])->name('dashboard');
        Route::get('atividades', [SaudeController::class, 'atividades'])->name('atividades');
        Route::post('atividades', [SaudeController::class, 'storeAtividade'])->name('store-atividade');
        Route::post('categorias', [SaudeController::class, 'storeCategoria'])->name('store-categoria');
        Route::get('atividades/{atividade}/edit', [SaudeController::class, 'editAtividade'])->name('edit-atividade');
        Route::put('atividades/{atividade}', [SaudeController::class, 'updateAtividade'])->name('update-atividade');
        Route::delete('atividades/{atividade}', [SaudeController::class, 'destroyAtividade'])->name('destroy-atividade');
        Route::get('calendario', [SaudeController::class, 'calendario'])->name('calendario');
        Route::get('metas', [SaudeController::class, 'metas'])->name('metas');
        Route::post('metas', [SaudeController::class, 'storeMeta'])->name('store-meta');
        Route::delete('metas/{meta}', [SaudeController::class, 'destroyMeta'])->name('destroy-meta');
        Route::get('relatorios', [SaudeController::class, 'relatorios'])->name('relatorios');
    });

    Route::prefix('integracoes/strava')->name('strava.')->group(function () {
        Route::get('connect', [StravaController::class, 'redirectToStrava'])->name('connect');
        Route::post('disconnect', [StravaController::class, 'disconnect'])->name('disconnect');
    });

});
