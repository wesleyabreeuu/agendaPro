<?php

namespace App\Http\Controllers;

use App\Services\StravaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class StravaController extends Controller
{
    public function __construct(private readonly StravaService $stravaService)
    {
    }

    public function redirectToStrava(): RedirectResponse
    {
        if (!$this->isConfigured()) {
            return redirect()->route('saude.dashboard')
                ->with('error', 'Configure as credenciais do Strava no arquivo .env antes de conectar.');
        }

        return redirect()->away($this->stravaService->authorizationUrl());
    }

    public function callback(Request $request): RedirectResponse
    {
        if (!$this->isConfigured()) {
            return redirect()->route('saude.dashboard')
                ->with('error', 'Configuracao do Strava incompleta no ambiente.');
        }

        if ($request->filled('error')) {
            return redirect()->route('saude.dashboard')
                ->with('error', 'A conexao com o Strava foi cancelada.');
        }

        $request->validate([
            'code' => 'required|string',
        ]);

        $payload = $this->stravaService->exchangeAuthorizationCode($request->string('code')->toString());
        $scope = $this->stravaService->normalizeScopes($payload['scope'] ?? $request->query('scope', []));

        if (!in_array('activity:read_all', $scope, true) && !in_array('activity:read', $scope, true)) {
            return redirect()->route('saude.dashboard')
                ->with('error', 'Autorize a leitura de atividades no Strava para concluir a integracao.');
        }

        $this->stravaService->persistTokenPayload(Auth::user(), $payload);

        return redirect()->route('saude.dashboard')
            ->with('success', 'Strava conectado com sucesso. Novas atividades serao importadas automaticamente.');
    }

    public function disconnect(): RedirectResponse
    {
        $this->stravaService->disconnectUser(Auth::user());

        return redirect()->route('saude.dashboard')
            ->with('success', 'Integracao com Strava removida.');
    }

    public function webhookVerify(Request $request): JsonResponse
    {
        abort_unless(
            $request->query('hub_verify_token') === config('services.strava.verify_token')
                || $request->query('hub.verify_token') === config('services.strava.verify_token'),
            403
        );

        return response()->json([
            'hub.challenge' => $request->query('hub_challenge', $request->query('hub.challenge')),
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'object_type' => 'required|string',
            'object_id' => 'required',
            'aspect_type' => 'required|string',
            'owner_id' => 'nullable',
            'updates' => 'nullable|array',
        ]);

        if ($payload['object_type'] === 'athlete' && data_get($payload, 'updates.authorized') === 'false') {
            $this->stravaService->disconnectAthlete((string) $payload['object_id']);

            return response()->json(['received' => true]);
        }

        if ($payload['object_type'] !== 'activity') {
            return response()->json(['received' => true]);
        }

        if ($payload['aspect_type'] === 'delete') {
            $this->stravaService->deleteImportedActivity($payload['object_id']);

            return response()->json(['received' => true]);
        }

        if (in_array($payload['aspect_type'], ['create', 'update'], true)) {
            $this->stravaService->importActivityByAthlete(
                (string) $payload['owner_id'],
                (string) $payload['object_id']
            );
        }

        return response()->json(['received' => true]);
    }

    private function isConfigured(): bool
    {
        return filled(config('services.strava.client_id'))
            && filled(config('services.strava.client_secret'))
            && filled(config('services.strava.verify_token'));
    }
}
