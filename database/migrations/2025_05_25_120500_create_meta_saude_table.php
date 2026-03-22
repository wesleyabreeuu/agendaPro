<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('meta_saude')) {
            return;
        }

        Schema::create('meta_saude', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('titulo');
            $table->enum('tipo', ['horas_semanais', 'calorias_semana', 'dias_semana', 'sessoes_mes'])->default('horas_semanais');
            $table->integer('valor_alvo');
            $table->enum('periodo', ['semanal', 'mensal'])->default('semanal');
            $table->boolean('ativa')->default(true);
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'ativa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_saude');
    }
};
