<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotinas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('categoria', 40);
            $table->string('frequencia_tipo', 30);
            $table->json('dias_semana')->nullable();
            $table->unsignedInteger('intervalo_dias')->nullable();
            $table->date('data_inicio')->nullable();
            $table->time('horario')->nullable();
            $table->string('dificuldade', 20);
            $table->string('energia_recomendada', 20)->nullable();
            $table->boolean('modo_minimo_ativo')->default(false);
            $table->string('modo_minimo_descricao', 500)->nullable();
            $table->string('cor', 20)->nullable();
            $table->string('icone', 60)->nullable();
            $table->boolean('ativo')->default(true);
            $table->unsignedInteger('ordem')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'ativo']);
            $table->index(['user_id', 'categoria']);
            $table->index(['user_id', 'frequencia_tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rotinas');
    }
};
