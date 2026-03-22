<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('atividade_fisica')) {
            return;
        }

        Schema::create('atividade_fisica', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('categoria_atividade_fisica_id')->constrained('categoria_atividade_fisica')->onDelete('restrict');
            $table->string('descricao')->nullable();
            $table->date('data');
            $table->time('hora_inicio')->nullable();
            $table->integer('duracao_minutos');
            $table->enum('intensidade', ['leve', 'moderada', 'intensa'])->default('moderada');
            $table->integer('calorias_queimadas')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'data']);
            $table->index(['user_id', 'categoria_atividade_fisica_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atividade_fisica');
    }
};
