<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotina_execucoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rotina_id')->constrained('rotinas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->date('data');
            $table->string('status', 20);
            $table->string('modo_usado', 20)->default('normal');
            $table->string('observacao', 500)->nullable();
            $table->timestamps();

            $table->unique(['rotina_id', 'user_id', 'data']);
            $table->index(['user_id', 'data']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rotina_execucoes');
    }
};
