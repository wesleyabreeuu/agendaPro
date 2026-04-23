<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;

class DailyCheckinController extends Controller
{
    public function __construct()
    {
    }

    public function index(): RedirectResponse
    {
        return redirect()->route('rotinas.dashboard');
    }
}
