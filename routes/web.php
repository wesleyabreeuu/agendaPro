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

Route::get('/', function () {
    return view('auth/login');
});

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

});
