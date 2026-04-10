<?php

namespace App\Console\Commands;

use App\Services\ReminderDispatchService;
use App\Services\WebPushService;
use Illuminate\Console\Command;

class SendDueReminderPushes extends Command
{
    protected $signature = 'reminders:push-due';
    protected $description = 'Envia lembretes vencidos via Web Push para dispositivos inscritos';

    public function handle(ReminderDispatchService $reminders, WebPushService $webPushService): int
    {
        if (!$webPushService->isConfigured()) {
            $this->warn('Web Push nao configurado. Defina WEBPUSH_SUBJECT, WEBPUSH_PUBLIC_KEY e WEBPUSH_PRIVATE_KEY.');
            return self::SUCCESS;
        }

        $due = $reminders->due();
        $sentCount = 0;
        $skippedCount = 0;

        foreach ($due as $lembrete) {
            $user = $lembrete->user;

            if (!$user) {
                $skippedCount++;
                continue;
            }

            $result = $webPushService->sendToUser($user, $reminders->payload($lembrete));

            if (($result['success'] ?? 0) > 0) {
                $reminders->acknowledge($lembrete);
                $sentCount++;
                continue;
            }

            $skippedCount++;
        }

        $this->info("Push enviados: {$sentCount}");
        $this->info("Lembretes sem entrega push: {$skippedCount}");

        return self::SUCCESS;
    }
}
