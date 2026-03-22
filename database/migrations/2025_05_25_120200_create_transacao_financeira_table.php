<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('transacao_financeira')) {
            return;
        }

        Schema::create('transacao_financeira', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('conta_bancaria_id')->constrained('conta_bancaria')->onDelete('cascade');
            $table->foreignId('categoria_financeira_id')->constrained('categoria_financeira')->onDelete('restrict');
            $table->enum('tipo', ['receita', 'despesa']);
            $table->string('descricao');
            $table->decimal('valor', 12, 2);
            $table->date('data');
            $table->boolean('recorrente')->default(false);
            $table->string('frequencia')->nullable(); // mensal, semanal, diária
            $table->date('proxima_data')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'data']);
            $table->index(['user_id', 'categoria_financeira_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transacao_financeira');
    }
};
