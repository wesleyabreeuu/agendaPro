<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class StravaSubscribeWebhookCommand extends Command
{
    protected $signature = 'strava:webhook:subscribe';

    protected $description = 'Cria a assinatura de webhook do Strava para importar atividades automaticamente';

    public function handle(): int
    {
        $clientId = config('services.strava.client_id');
        $clientSecret = config('services.strava.client_secret');
        $verifyToken = config('services.strava.verify_token');
        $callbackUrl = config('services.strava.webhook_callback_url');

        if (!$clientId || !$clientSecret || !$verifyToken || !$callbackUrl) {
            $this->error('Defina STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_VERIFY_TOKEN e STRAVA_WEBHOOK_CALLBACK_URL.');

            return self::FAILURE;
        }

        $response = Http::asForm()
            ->acceptJson()
            ->timeout(20)
            ->post('https://www.strava.com/api/v3/push_subscriptions', [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'callback_url' => $callbackUrl,
                'verify_token' => $verifyToken,
            ]);

        if ($response->failed()) {
            $this->error('Falha ao criar webhook no Strava.');
            $this->line($response->body());

            return self::FAILURE;
        }

        $this->info('Webhook do Strava criado com sucesso.');
        $this->line($response->body());

        return self::SUCCESS;
    }
}
