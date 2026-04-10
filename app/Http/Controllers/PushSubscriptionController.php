<?php

namespace App\Http\Controllers;

use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request, WebPushService $webPushService): JsonResponse
    {
        if (!$webPushService->isConfigured()) {
            return response()->json([
                'message' => 'Web Push ainda nao esta configurado no servidor.',
            ], 503);
        }

        $validated = $request->validate([
            'endpoint' => 'required|string',
            'expirationTime' => 'nullable',
            'contentEncoding' => 'nullable|string',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $subscription = $webPushService->subscribe(
            $request->user(),
            $validated,
            $request->userAgent()
        );

        return response()->json([
            'ok' => true,
            'id' => $subscription->id,
        ]);
    }

    public function destroy(Request $request, WebPushService $webPushService): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        $webPushService->unsubscribe($request->user(), $validated['endpoint']);

        return response()->json([
            'ok' => true,
        ]);
    }
}
