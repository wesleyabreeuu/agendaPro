<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'AgendaPro') }}</title>
    <meta name="theme-color" content="#17212E">
    <link rel="icon" type="image/svg+xml" href="/brand/agendapro-mark.svg">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    <link rel="manifest" href="/manifest.json">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="min-h-screen bg-white text-zinc-950 antialiased">
    @inertia
</body>
</html>
