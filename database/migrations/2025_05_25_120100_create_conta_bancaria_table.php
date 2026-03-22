<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('conta_bancaria')) {
            return;
        }

        Schema::create('conta_bancaria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('nome');
            $table->enum('tipo', ['bancaria', 'cartao', 'dinheiro'])->default('bancaria');
            $table->decimal('saldo_inicial', 12, 2)->default(0);
            $table->decimal('saldo_atual', 12, 2)->default(0);
            $table->boolean('ativa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conta_bancaria');
    }
};
