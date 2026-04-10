<?php

namespace App\Services;

use App\Models\User;
use App\Models\WebPushSubscription;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    public function isConfigured(): bool
    {
        return filled(config('services.webpush.subject'))
            && filled(config('services.webpush.public_key'))
            && filled(config('services.webpush.private_key'));
    }

    public function publicKey(): ?string
    {
        return $this->isConfigured() ? config('services.webpush.public_key') : null;
    }

    public function subscribe(User $user, array $subscription, ?string $userAgent = null): WebPushSubscription
    {
        $endpoint = $subscription['endpoint'];

        return WebPushSubscription::updateOrCreate(
            ['endpoint_hash' => hash('sha256', $endpoint)],
            [
                'user_id' => $user->id,
                'endpoint' => $endpoint,
                'public_key' => $subscription['keys']['p256dh'],
                'auth_token' => $subscription['keys']['auth'],
                'content_encoding' => $subscription['contentEncoding'] ?? 'aes128gcm',
                'user_agent' => $userAgent,
                'last_seen_at' => now(),
                'last_failure_reason' => null,
                'is_active' => true,
            ]
        );
    }

    public function unsubscribe(User $user, string $endpoint): void
    {
        $user->pushSubscriptions()
            ->where('endpoint_hash', hash('sha256', $endpoint))
            ->update([
                'is_active' => false,
                'last_failure_reason' => 'Unsubscribed by client',
            ]);
    }

    public function sendToUser(User $user, array $payload): array
    {
        $subscriptions = $user->pushSubscriptions()
            ->active()
            ->get();

        if (!$this->isConfigured() || $subscriptions->isEmpty()) {
            return [
                'attempted' => 0,
                'success' => 0,
                'failed' => 0,
            ];
        }

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.subject'),
                'publicKey' => config('services.webpush.public_key'),
                'privateKey' => config('services.webpush.private_key'),
            ],
        ]);
        $webPush->setReuseVAPIDHeaders(true);

        $payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $byEndpoint = [];

        foreach ($subscriptions as $subscriptionModel) {
            $byEndpoint[$subscriptionModel->endpoint] = $subscriptionModel;

            $webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $subscriptionModel->endpoint,
                    'publicKey' => $subscriptionModel->public_key,
                    'authToken' => $subscriptionModel->auth_token,
                    'contentEncoding' => $subscriptionModel->content_encoding ?: 'aes128gcm',
                ]),
                $payloadJson,
                ['TTL' => 300]
            );
        }

        $result = [
            'attempted' => $subscriptions->count(),
            'success' => 0,
            'failed' => 0,
        ];

        foreach ($webPush->flush() as $report) {
            $subscriptionModel = $byEndpoint[$report->getEndpoint()] ?? null;

            if (!$subscriptionModel) {
                continue;
            }

            if ($report->isSuccess()) {
                $subscriptionModel->forceFill([
                    'last_sent_at' => now(),
                    'last_failure_reason' => null,
                    'is_active' => true,
                ])->save();

                $result['success']++;
                continue;
            }

            $subscriptionModel->forceFill([
                'last_failure_reason' => mb_strimwidth($report->getReason(), 0, 1000, '...'),
                'is_active' => $report->isSubscriptionExpired() ? false : $subscriptionModel->is_active,
            ])->save();

            $result['failed']++;
        }

        return $result;
    }
}
