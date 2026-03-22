<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('categoria_atividade_fisica')) {
            return;
        }

        Schema::create('categoria_atividade_fisica', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->string('icone')->default('fas fa-dumbbell');
            $table->string('cor')->default('#e74c3c');
            $table->decimal('caloria_leve', 5, 2)->default(3); // calorias por minuto
            $table->decimal('caloria_moderada', 5, 2)->default(6);
            $table->decimal('caloria_intensa', 5, 2)->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categoria_atividade_fisica');
    }
};
