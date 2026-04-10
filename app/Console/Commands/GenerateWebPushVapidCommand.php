<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Jose\Component\KeyManagement\JWKFactory;
use Minishlink\WebPush\Utils;
use Minishlink\WebPush\VAPID;
use Base64Url\Base64Url;
use Throwable;

class GenerateWebPushVapidCommand extends Command
{
    protected $signature = 'webpush:vapid';
    protected $description = 'Gera um novo par de chaves VAPID para Web Push';

    public function handle(): int
    {
        try {
            $keys = VAPID::createVapidKeys();
        } catch (Throwable) {
            $keys = $this->generateWithOpenSsl();
        }

        $this->line('Adicione estas chaves ao seu .env:');
        $this->newLine();
        $this->line('WEBPUSH_SUBJECT=' . config('app.url', 'http://localhost'));
        $this->line('WEBPUSH_PUBLIC_KEY=' . $keys['publicKey']);
        $this->line('WEBPUSH_PRIVATE_KEY=' . $keys['privateKey']);

        return self::SUCCESS;
    }

    private function generateWithOpenSsl(): array
    {
        $privateKeyPath = tempnam(sys_get_temp_dir(), 'agendapro-webpush-');
        if ($privateKeyPath === false) {
            throw new \RuntimeException('Nao foi possivel criar arquivo temporario para a chave VAPID.');
        }

        exec(sprintf('openssl ecparam -name prime256v1 -genkey -noout -out %s 2>&1', escapeshellarg($privateKeyPath)), $output, $status);

        if ($status !== 0) {
            File::delete($privateKeyPath);
            throw new \RuntimeException('Falha ao gerar chave VAPID via openssl.');
        }

        try {
            $jwk = JWKFactory::createFromKeyFile($privateKeyPath);

            return [
                'publicKey' => base64_encode(hex2bin(Utils::serializePublicKeyFromJWK($jwk))),
                'privateKey' => base64_encode(str_pad(Base64Url::decode($jwk->get('d')), 32, '0', STR_PAD_LEFT)),
            ];
        } finally {
            File::delete($privateKeyPath);
        }
    }
}
