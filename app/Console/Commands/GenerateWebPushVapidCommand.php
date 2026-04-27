<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Minishlink\WebPush\VAPID;
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
            exec(
                sprintf('openssl ec -in %s -text -noout 2>&1', escapeshellarg($privateKeyPath)),
                $detailsOutput,
                $detailsStatus
            );

            if ($detailsStatus !== 0) {
                throw new \RuntimeException('Falha ao extrair detalhes da chave VAPID via openssl.');
            }

            $detailsText = implode("\n", $detailsOutput);
            $privateHex = $this->extractHexBlock($detailsText, '/priv:\s*((?:\s*[0-9a-f]{2}:?)+)\s*pub:/i');
            $publicHex = $this->extractHexBlock($detailsText, '/pub:\s*((?:\s*[0-9a-f]{2}:?)+)\s*(?:ASN1 OID|NIST CURVE|$)/i');

            if ($privateHex === null || $publicHex === null) {
                throw new \RuntimeException('Nao foi possivel interpretar a chave VAPID gerada pelo openssl.');
            }

            $privateKey = hex2bin(str_pad($privateHex, 64, '0', STR_PAD_LEFT));
            $publicKey = hex2bin($publicHex);

            if ($privateKey === false || $publicKey === false) {
                throw new \RuntimeException('Falha ao converter a chave VAPID gerada pelo openssl.');
            }

            return [
                'publicKey' => $this->base64UrlEncode($publicKey),
                'privateKey' => $this->base64UrlEncode($privateKey),
            ];
        } finally {
            File::delete($privateKeyPath);
        }
    }

    private function extractHexBlock(string $detailsText, string $pattern): ?string
    {
        if (!preg_match($pattern, $detailsText, $matches)) {
            return null;
        }

        return strtolower(preg_replace('/[^0-9a-f]/i', '', $matches[1]));
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
