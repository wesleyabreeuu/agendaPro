<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('categoria_financeira')) {
            return;
        }

        Schema::create('categoria_financeira', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->enum('tipo', ['receita', 'despesa']);
            $table->string('nome');
            $table->string('icone')->default('fas fa-tag');
            $table->string('cor')->default('#3498db');
            $table->timestamps();

            $table->unique(['user_id', 'nome', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categoria_financeira');
    }
};
