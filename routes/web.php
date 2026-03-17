<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\LembreteController;
use App\Http\Controllers\CategoriaController;
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

    /**
     * TODO
     * - Mantém o resource (index/store/edit/update/destroy etc)
     * - Adiciona apenas as rotas EXTRAS: kanban + status
     * - Evita conflito: kanban precisa vir ANTES do resource
     */
    Route::get('todo/kanban', [TodoController::class, 'kanban'])->name('todo.kanban');

    Route::patch('todo/{todo}/status', [TodoController::class, 'status'])
        ->whereNumber('todo')
        ->name('todo.status');

    Route::resource('todo', TodoController::class)
        ->whereNumber('todo');

    // outras rotas que você já tinha
    Route::get('/teste-whatsapp', [LembreteController::class, 'enviarTesteWhatsApp']);
    Route::get('/lembretes/{id}/enviar-whatsapp', [LembreteController::class, 'enviarWhatsApp'])
        ->name('lembretes.enviar-whatsapp');
    Route::get('compromissos/calendario', [CompromissoController::class, 'calendario'])->name('compromissos.calendario');
    Route::get('compromissos/calendario/eventos', [CompromissoController::class, 'calendarioEventos'])->name('compromissos.calendario.eventos');

});
