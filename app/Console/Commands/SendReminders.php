<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Services\EvolutionApiService;
use Carbon\Carbon;

class SendReminders extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Enviar lembretes de compromissos próximos via WhatsApp';

    public function handle()
    {
        $api = new EvolutionApiService();

        $now = Carbon::now();
        $nextDay = $now->copy()->addDay();

        $appointments = Appointment::whereBetween('date', [$now, $nextDay])->get();

        foreach ($appointments as $appointment) {
            $message = "Olá {$appointment->client_name}, lembrete: seu compromisso está agendado para {$appointment->date->format('d/m/Y H:i')}.";
            $api->sendTextMessage($appointment->client_phone, $message);
            $this->info("Lembrete enviado para {$appointment->client_name}");
        }
    }
}
