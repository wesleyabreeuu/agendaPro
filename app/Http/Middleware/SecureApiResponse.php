<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureApiResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('Cache-Control', 'no-store, private, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'same-origin');
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');

        return $response;
    }
}
