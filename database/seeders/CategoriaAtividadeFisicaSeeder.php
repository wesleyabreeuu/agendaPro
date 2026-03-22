<?php

namespace Database\Seeders;

use App\Http\Controllers\SaudeController;
use App\Models\CategoriaAtividadeFisica;
use Illuminate\Database\Seeder;

class CategoriaAtividadeFisicaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = SaudeController::CATEGORIAS_PADRAO;

        foreach ($categorias as $categoria) {
            CategoriaAtividadeFisica::updateOrCreate(
                ['nome' => $categoria['nome']],
                $categoria
            );
        }
    }
}
