<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'wpp' => [
    'base'    => env('WPP_BASE_URL', 'http://wppconnect:21465'),
    'session' => env('WPP_SESSION', 'agendapro'),
    'token'   => env('WPP_TOKEN', 'agendapro123'),
],

    'whatsapp' => [
        'enabled' => env('WHATSAPP_ENABLED', false),
        // 'base_url' => env('WPP_BASE_URL'),
        // 'secret'   => env('WPP_SECRET'),
        // 'session'  => env('WPP_SESSION'),
    ],

    'strava' => [
        'client_id' => env('STRAVA_CLIENT_ID'),
        'client_secret' => env('STRAVA_CLIENT_SECRET'),
        'verify_token' => env('STRAVA_VERIFY_TOKEN'),
        'webhook_callback_url' => env('STRAVA_WEBHOOK_CALLBACK_URL'),
    ],



];
