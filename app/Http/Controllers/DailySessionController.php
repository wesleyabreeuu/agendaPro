<?php

namespace App\Http\Controllers;

use App\Models\DailySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DailySessionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-dia-a-dia']);
    }

    public function check(): JsonResponse
    {
        $session = DailySession::query()
            ->where('user_id', Auth::id())
            ->whereDate('date', today())
            ->first();

        return response()->json([
            'iniciado' => (bool) $session?->started,
            'date' => today()->toDateString(),
        ]);
    }

    public function start(): JsonResponse
    {
        DailySession::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'date' => today()->toDateString(),
            ],
            [
                'started' => true,
            ]
        );

        return response()->json([
            'iniciado' => true,
            'date' => today()->toDateString(),
        ]);
    }
}
