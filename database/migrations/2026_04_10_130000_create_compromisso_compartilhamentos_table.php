<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compromisso_compartilhamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compromisso_id')->constrained('compromissos')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('permissao', ['visualizar', 'editar']);
            $table->timestamps();

            $table->unique(['compromisso_id', 'usuario_id'], 'compromisso_usuario_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compromisso_compartilhamentos');
    }
};
