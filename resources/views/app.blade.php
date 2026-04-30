<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'AgendaPro') }}</title>
    <meta name="theme-color" content="#17212E">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" type="image/svg+xml" href="/brand/agendapro-mark.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">
    <link rel="manifest" href="/manifest.json">
    <script>
        (function () {
            if (!('serviceWorker' in navigator) || !window.caches) {
                return;
            }

            var cleanupKey = 'agendapro.service-worker-cleaned';

            if (window.sessionStorage.getItem(cleanupKey) === 'true') {
                return;
            }

            window.sessionStorage.setItem(cleanupKey, 'true');

            window.addEventListener('load', function () {
                Promise.all([
                    navigator.serviceWorker.getRegistrations()
                        .then(function (registrations) {
                            return Promise.all(registrations.map(function (registration) {
                                return registration.unregister();
                            }));
                        }),
                    caches.keys()
                        .then(function (keys) {
                            return Promise.all(keys.map(function (key) {
                                return key.indexOf('agenda-pro-') === 0 ? caches.delete(key) : Promise.resolve(false);
                            }));
                        }),
                ]).then(function () {
                    window.location.reload();
                }).catch(function () {
                    window.location.reload();
                });
            });
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="min-h-screen bg-white text-zinc-950 antialiased">
    @inertia
</body>
</html>
