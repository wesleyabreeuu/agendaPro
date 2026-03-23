<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metas_economia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo');
            $table->string('descricao')->nullable();
            $table->decimal('valor_alvo', 12, 2);
            $table->decimal('valor_atual', 12, 2)->default(0);
            $table->enum('periodicidade', ['dia', 'mes', 'ano'])->default('mes');
            $table->date('prazo_final');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metas_economia');
    }
};
