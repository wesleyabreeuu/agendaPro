<?php

namespace App\Services;

use App\Models\AtividadeFisica;
use App\Models\CategoriaAtividadeFisica;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class StravaService
{
    private const API_BASE = 'https://www.strava.com/api/v3';
    private const OAUTH_TOKEN_URL = 'https://www.strava.com/oauth/token';

    public function authorizationUrl(): string
    {
        return 'https://www.strava.com/oauth/authorize?' . http_build_query([
            'client_id' => config('services.strava.client_id'),
            'redirect_uri' => route('strava.callback'),
            'response_type' => 'code',
            'approval_prompt' => 'auto',
            'scope' => 'read,activity:read_all',
        ]);
    }

    public function exchangeAuthorizationCode(string $code): array
    {
        return $this->tokenRequest([
            'client_id' => config('services.strava.client_id'),
            'client_secret' => config('services.strava.client_secret'),
            'code' => $code,
            'grant_type' => 'authorization_code',
        ]);
    }

    public function refreshToken(User $user): User
    {
        if (!$user->hasStravaConnected()) {
            throw new RuntimeException('Usuario sem integracao Strava.');
        }

        if ($user->strava_token_expires_at && $user->strava_token_expires_at->gt(now()->addMinute())) {
            return $user;
        }

        $payload = $this->tokenRequest([
            'client_id' => config('services.strava.client_id'),
            'client_secret' => config('services.strava.client_secret'),
            'grant_type' => 'refresh_token',
            'refresh_token' => $user->strava_refresh_token,
        ]);

        $this->persistTokenPayload($user, $payload);

        return $user->fresh();
    }

    public function importActivityByAthlete(string $athleteId, string|int $activityId): ?AtividadeFisica
    {
        $user = User::query()
            ->where('strava_athlete_id', $athleteId)
            ->first();

        if (!$user) {
            return null;
        }

        $activity = $this->getActivity($user, $activityId);

        if (!$activity) {
            return null;
        }

        return $this->upsertActivityFromStrava($user, $activity);
    }

    public function deleteImportedActivity(string|int $activityId): void
    {
        AtividadeFisica::query()
            ->where('fonte', 'strava')
            ->where('fonte_id', (string) $activityId)
            ->delete();
    }

    public function disconnectAthlete(string $athleteId): void
    {
        $user = User::query()
            ->where('strava_athlete_id', $athleteId)
            ->first();

        if (!$user) {
            return;
        }

        $this->disconnectUser($user);
    }

    public function disconnectUser(User $user): void
    {
        $user->forceFill([
            'strava_athlete_id' => null,
            'strava_access_token' => null,
            'strava_refresh_token' => null,
            'strava_token_expires_at' => null,
            'strava_scope' => null,
            'strava_connected_at' => null,
        ])->save();
    }

    public function persistTokenPayload(User $user, array $payload): void
    {
        $scopes = $this->normalizeScopes($payload['scope'] ?? []);

        $user->forceFill([
            'strava_athlete_id' => (string) data_get($payload, 'athlete.id', $user->strava_athlete_id),
            'strava_access_token' => $payload['access_token'],
            'strava_refresh_token' => $payload['refresh_token'],
            'strava_token_expires_at' => Carbon::createFromTimestamp($payload['expires_at']),
            'strava_scope' => implode(',', $scopes),
            'strava_connected_at' => now(),
        ])->save();
    }

    public function getActivity(User $user, string|int $activityId): ?array
    {
        $user = $this->refreshToken($user);

        $response = Http::timeout(15)
            ->acceptJson()
            ->withToken($user->strava_access_token)
            ->get(self::API_BASE . '/activities/' . $activityId);

        if ($response->status() === 404) {
            return null;
        }

        $response->throw();

        return $response->json();
    }

    public function upsertActivityFromStrava(User $user, array $activity): AtividadeFisica
    {
        $categoria = $this->resolveCategoryForSport((string) ($activity['sport_type'] ?? $activity['type'] ?? 'Workout'));
        $start = Carbon::parse($activity['start_date_local'] ?? $activity['start_date'] ?? now());

        $payload = [
            'user_id' => $user->id,
            'categoria_atividade_fisica_id' => $categoria->id,
            'descricao' => $activity['name'] ?? $categoria->nome,
            'data' => $start->toDateString(),
            'hora_inicio' => $start->format('H:i'),
            'duracao_minutos' => max(1, (int) ceil(($activity['moving_time'] ?? $activity['elapsed_time'] ?? 0) / 60)),
            'intensidade' => $this->guessIntensity($activity),
            'calorias_queimadas' => $this->extractCalories($activity),
            'notas' => $this->buildNotes($activity),
            'fonte' => 'strava',
            'fonte_id' => (string) $activity['id'],
            'sincronizado_em' => now(),
        ];

        return AtividadeFisica::query()->updateOrCreate(
            [
                'fonte' => 'strava',
                'fonte_id' => (string) $activity['id'],
            ],
            $payload
        );
    }

    private function tokenRequest(array $payload): array
    {
        $response = Http::asForm()
            ->acceptJson()
            ->timeout(15)
            ->post(self::OAUTH_TOKEN_URL, $payload);

        $response->throw();

        return $response->json();
    }

    public function normalizeScopes(array|string $scopes): array
    {
        if (is_string($scopes)) {
            return array_values(array_filter(array_map('trim', explode(',', $scopes))));
        }

        return array_values(array_filter($scopes));
    }

    private function resolveCategoryForSport(string $sportType): CategoriaAtividadeFisica
    {
        $name = match ($sportType) {
            'Run', 'TrailRun', 'VirtualRun' => 'Corrida',
            'Ride', 'GravelRide', 'EBikeRide', 'MountainBikeRide', 'VirtualRide' => 'Ciclismo',
            'Walk', 'Hike' => 'Caminhada',
            'Swim' => 'Natação',
            'WeightTraining', 'Workout' => 'Musculação',
            'Yoga' => 'Yoga',
            'Soccer' => 'Futebol',
            default => $sportType,
        };

        $defaults = $this->categoryDefaults($name);

        return CategoriaAtividadeFisica::query()->firstOrCreate(
            ['nome' => $name],
            $defaults
        );
    }

    private function categoryDefaults(string $name): array
    {
        return match ($name) {
            'Corrida' => ['icone' => 'fas fa-running', 'cor' => '#e74c3c', 'caloria_leve' => 8, 'caloria_moderada' => 12, 'caloria_intensa' => 16],
            'Ciclismo' => ['icone' => 'fas fa-biking', 'cor' => '#1abc9c', 'caloria_leve' => 8, 'caloria_moderada' => 12, 'caloria_intensa' => 18],
            'Caminhada' => ['icone' => 'fas fa-person-hiking', 'cor' => '#8bc34a', 'caloria_leve' => 4, 'caloria_moderada' => 6, 'caloria_intensa' => 9],
            'Natação' => ['icone' => 'fas fa-swimmer', 'cor' => '#3498db', 'caloria_leve' => 8, 'caloria_moderada' => 12, 'caloria_intensa' => 16],
            'Musculação' => ['icone' => 'fas fa-dumbbell', 'cor' => '#f39c12', 'caloria_leve' => 5, 'caloria_moderada' => 8, 'caloria_intensa' => 12],
            'Yoga' => ['icone' => 'fas fa-spa', 'cor' => '#9b59b6', 'caloria_leve' => 3, 'caloria_moderada' => 5, 'caloria_intensa' => 7],
            'Futebol' => ['icone' => 'fas fa-futbol', 'cor' => '#16a34a', 'caloria_leve' => 8, 'caloria_moderada' => 14, 'caloria_intensa' => 18],
            default => ['icone' => 'fas fa-dumbbell', 'cor' => '#607d8b', 'caloria_leve' => 4, 'caloria_moderada' => 6, 'caloria_intensa' => 8],
        };
    }

    private function guessIntensity(array $activity): string
    {
        $sportType = (string) ($activity['sport_type'] ?? $activity['type'] ?? '');
        $distance = (float) ($activity['distance'] ?? 0);
        $movingTime = max(1, (int) ($activity['moving_time'] ?? 0));
        $speed = $distance / $movingTime;

        if (in_array($sportType, ['Run', 'TrailRun', 'VirtualRun'], true)) {
            return $speed >= 3.2 ? 'intensa' : ($speed >= 2.4 ? 'moderada' : 'leve');
        }

        if (in_array($sportType, ['Ride', 'GravelRide', 'EBikeRide', 'MountainBikeRide', 'VirtualRide'], true)) {
            return $speed >= 7 ? 'intensa' : ($speed >= 4 ? 'moderada' : 'leve');
        }

        return 'moderada';
    }

    private function extractCalories(array $activity): ?int
    {
        $calories = $activity['calories'] ?? null;

        if (is_numeric($calories)) {
            return (int) round((float) $calories);
        }

        return null;
    }

    private function buildNotes(array $activity): ?string
    {
        $parts = ['Importado automaticamente do Strava'];

        if (!empty($activity['distance'])) {
            $parts[] = 'Distancia: ' . number_format(((float) $activity['distance']) / 1000, 2, ',', '.') . ' km';
        }

        if (!empty($activity['total_elevation_gain'])) {
            $parts[] = 'Elevacao: ' . number_format((float) $activity['total_elevation_gain'], 0, ',', '.') . ' m';
        }

        return implode(' | ', $parts);
    }
}
