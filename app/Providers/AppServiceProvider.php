<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use JeroenNoten\LaravelAdminLte\Components\Form\Checkbox;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Blade::component('adminlte-checkbox', Checkbox::class);
    }
}
