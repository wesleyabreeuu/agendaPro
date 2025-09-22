<?php

namespace App\Console\Commands;

use App\Jobs\SendScheduledWhatsApp;
use App\Models\ScheduledMessage;
use Illuminate\Console\Command;

class DispatchDueMessages extends Command
{
    protected $signature = 'messages:dispatch-due';
    protected $description = 'Despacha mensagens programadas vencidas e pendentes';

    public function handle(): int
    {
        $due = ScheduledMessage::where('status','pending')
            ->where('scheduled_at','<=', now())
            ->orderBy('scheduled_at')
            ->limit(500)
            ->get();

        foreach ($due as $m) {
            SendScheduledWhatsApp::dispatch($m->id);
        }

        $this->info('Despachadas: '.$due->count());
        return self::SUCCESS;
    }
}
