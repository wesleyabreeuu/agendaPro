<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'is_admin' => method_exists($request->user(), 'isAdmin') ? $request->user()->isAdmin() : false,
                    'profile_image_url' => method_exists($request->user(), 'profileImageUrl') ? $request->user()->profileImageUrl() : null,
                    'profile_role_label' => method_exists($request->user(), 'profileRoleLabel') ? $request->user()->profileRoleLabel() : null,
                    'permissions' => method_exists($request->user(), 'hasModuleAccess') ? [
                        'compromissos' => $request->user()->hasModuleAccess('compromissos'),
                        'dia_a_dia' => $request->user()->hasModuleAccess('dia_a_dia'),
                        'projetos' => $request->user()->hasModuleAccess('projetos'),
                        'financeiro' => $request->user()->hasModuleAccess('financeiro'),
                        'saude' => $request->user()->hasModuleAccess('saude'),
                    ] : [],
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'webPush' => [
                'enabled' => fn () => filled(config('services.webpush.public_key')),
                'publicKey' => fn () => config('services.webpush.public_key'),
            ],
        ]);
    }
}
