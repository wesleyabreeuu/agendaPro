<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarLembreteWhatsAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $telefone;
    protected $mensagem;

    public function __construct($telefone, $mensagem)
    {
        $this->telefone = $telefone;
        $this->mensagem = $mensagem;
    }

    public function handle()
    {
        $whatsAppService = new WhatsAppService();
        $whatsAppService->enviarMensagem($this->telefone, $this->mensagem);
    }
}
