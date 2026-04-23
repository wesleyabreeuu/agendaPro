<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    protected $signature = 'mail:test {to : E-mail de destino para o teste}';

    protected $description = 'Envia um e-mail simples para validar a configuracao SMTP atual';

    public function handle(): int
    {
        $to = (string) $this->argument('to');

        try {
            Mail::raw(
                "Este e-mail confirma que o SMTP do AgendaPro esta funcionando.\n\nEnviado em: " . now()->format('d/m/Y H:i:s'),
                function ($message) use ($to): void {
                    $message
                        ->to($to)
                        ->subject('Teste de e-mail do AgendaPro');
                }
            );
        } catch (\Throwable $e) {
            $this->error('Falha ao enviar e-mail: ' . $e->getMessage());

            return self::FAILURE;
        }

        $this->info('E-mail enviado com sucesso para: ' . $to);

        return self::SUCCESS;
    }
}
