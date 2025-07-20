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
    Route::resource('compromissos', CompromissoController::class)->middleware('auth');
    Route::resource('lembretes', LembreteController::class)->middleware('auth');
    Route::get('/todo', [TodoController::class, 'index'])->name('todo.index');
    Route::post('/todo/store', [TodoController::class, 'store'])->name('todo.store');
    Route::get('/todo/{id}/edit', [TodoController::class, 'edit'])->name('todo.edit');
    Route::put('/todo/{id}', [TodoController::class, 'update'])->name('todo.update');
    Route::delete('/todo/{id}', [TodoController::class, 'destroy'])->name('todo.destroy');
    Route::get('/teste-whatsapp', [\App\Http\Controllers\LembreteController::class, 'enviarTesteWhatsApp']);
    Route::get('/lembretes/{id}/enviar-whatsapp', [LembreteController::class, 'enviarWhatsApp'])->name('lembretes.enviar-whatsapp');






});