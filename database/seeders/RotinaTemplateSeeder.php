<?php

namespace Database\Seeders;

use App\Services\RotinaTemplateCatalog;
use Illuminate\Database\Seeder;

class RotinaTemplateSeeder extends Seeder
{
    public function run(): void
    {
        app(RotinaTemplateCatalog::class)->ensureDefaults();
    }
}
