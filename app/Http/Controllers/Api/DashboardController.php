<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $dashboardService): JsonResponse
    {
        $period = (int) $request->integer('period', 7);
        $period = in_array($period, [7, 15, 30], true) ? $period : 7;

        return response()->json([
            'data' => $dashboardService->build(Auth::user(), $period),
        ]);
    }
}
