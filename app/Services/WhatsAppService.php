<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $base;
    private string $session;
    private string $token;

    public function __construct()
    {
        $this->base    = rtrim(config('services.wpp.base'), '/'); // http://wppconnect-api:21465
        $this->session = config('services.wpp.session');          // agendapro
        $this->token   = config('services.wpp.token');            // seu token
    }

    public function enviarMensagem(string $numero, string $mensagem): array
    {
        $numero = preg_replace('/\D+/', '', $numero);

        $url = "{$this->base}/api/{$this->session}/send-message";

        $resp = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
        ])->post($url, [
            'phone'   => $numero,
            'message' => $mensagem,
        ]);

        if (! $resp->ok()) {
            Log::error('WPP send-message failed', [
                'http' => $resp->status(),
                'url'  => $url,
                'body' => $resp->body(),
            ]);
        }

        return $resp->json() ?? ['status' => 'error', 'http' => $resp->status()];
    }
}
