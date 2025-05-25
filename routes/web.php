<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\LembreteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CompromissoController;

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


});