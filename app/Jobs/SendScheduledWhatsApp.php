<?php

namespace App\Jobs;

use App\Models\ScheduledMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Throwable;

class SendScheduledWhatsApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;      // tentativas de retry
    public int $backoff = 60;   // intervalo entre tentativas (s)
    public int $timeout = 30;   // timeout do job (s)

    public function __construct(public int $scheduledMessageId) {}

    public function handle(): void
    {
        // 1) Carrega a mensagem
        $m = ScheduledMessage::find($this->scheduledMessageId);
        if (!$m || $m->status !== 'pending') {
            return; // já cancelada/enviada/ausente
        }

        // 2) Transição atômica: pending -> sending (idempotência)
        $changed = ScheduledMessage::where('id', $m->id)
            ->where('status', 'pending')
            ->update(['status' => 'sending']);
        if (!$changed) {
            return;
        }

        try {
            // 3) Config WPPConnect
            $cfg = config('whatsapp.wppconnect');
            if (empty($cfg['base_url']) || empty($cfg['session']) || empty($cfg['token'])) {
                throw new \RuntimeException('WPPConnect config ausente: verifique WPP_BASE_URL, WPP_SESSION e WPP_TOKEN.');
            }

            $base = rtrim($cfg['base_url'], '/');
            $url  = $base . "/api/{$cfg['session']}/send-message";

            // Normaliza o número para só dígitos (espera E.164: 55DDDNNNNNNNN)
            $phone = preg_replace('/\D+/', '', (string) $m->recipient);

            // 4) Chamada ao WPPConnect
            $resp = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $cfg['token'],
                    'Accept'        => 'application/json',
                ])
                ->post($url, [
                    'phone'   => $phone,
                    'message' => $m->message,
                ]);

            if ($resp->failed()) {
                throw new \RuntimeException('WPPConnect send failed: ' . $resp->body());
            }

            $j = $resp->json();

            // 5) Marca como enviada
            $m->status = 'sent';
            $m->sent_at = now();
            $m->provider_message_id = $j['message']['id'] ?? ($j['id'] ?? null);
            $m->last_error = null;
            $m->save();

        } catch (Throwable $e) {
            // 6) Falha (deixa pro retry do queue)
            $m->status = 'failed';
            $m->last_error = $e->getMessage();
            $m->save();
            throw $e;
        }
    }
}
