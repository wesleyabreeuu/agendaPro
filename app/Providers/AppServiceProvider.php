<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Compromisso;
use App\Models\Habito;
use App\Models\Rotina;
use App\Models\User;
use App\Policies\CompromissoPolicy;
use App\Policies\HabitoPolicy;
use App\Policies\RotinaPolicy;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api-authenticated', function (Request $request) {
            return Limit::perMinute(180)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai-commands', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('data-feeds', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Gate::policy(Compromisso::class, CompromissoPolicy::class);
        Gate::policy(Habito::class, HabitoPolicy::class);
        Gate::policy(Rotina::class, RotinaPolicy::class);
        Gate::define('admin-only', fn (User $user) => $user->isAdmin());
        Gate::define('access-compromissos', fn (User $user) => $user->hasModuleAccess('compromissos'));
        Gate::define('access-dia-a-dia', fn (User $user) => $user->hasModuleAccess('dia_a_dia'));
        Gate::define('access-projetos', fn (User $user) => $user->hasModuleAccess('projetos'));
        Gate::define('access-financeiro', fn (User $user) => $user->hasModuleAccess('financeiro'));
        Gate::define('access-saude', fn (User $user) => $user->hasModuleAccess('saude'));
    }
}
