<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::define('admin-only', fn (User $user) => $user->isAdmin());
        Gate::define('access-compromissos', fn (User $user) => $user->hasModuleAccess('compromissos'));
        Gate::define('access-dia-a-dia', fn (User $user) => $user->hasModuleAccess('dia_a_dia'));
        Gate::define('access-projetos', fn (User $user) => $user->hasModuleAccess('projetos'));
        Gate::define('access-financeiro', fn (User $user) => $user->hasModuleAccess('financeiro'));
        Gate::define('access-saude', fn (User $user) => $user->hasModuleAccess('saude'));
    }
}
