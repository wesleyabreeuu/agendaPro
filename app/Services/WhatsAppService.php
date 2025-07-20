<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    protected $apiUrl = 'http://wppconnect-api:21465/api/THISISMYSECURETOKEN/send-message';
    protected $token = 'THISISMYSECURETOKEN';
    protected $session = 'meu-teste';

    public function enviarMensagem($numero, $mensagem)
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}"
        ])->post($this->apiUrl, [
            'session' => $this->session,
            'phone' => $numero, // Ex: 5511999999999
            'message' => $mensagem,
        ]);

        \Log::info("WhatsApp response: " . $response->body());

        return $response->successful();
    }
}

