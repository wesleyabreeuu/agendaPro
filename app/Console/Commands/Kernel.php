<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define as tarefas agendadas.
     */
    protected function schedule(Schedule $schedule): void
    {
        // 👉 Aqui vai o agendamento do comando reminders:send
        $schedule->command('reminders:send')->hourly();
    }

    /**
     * Registra os comandos Artisan.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
