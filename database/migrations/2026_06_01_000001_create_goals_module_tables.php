<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('categoria', 80)->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_meta')->nullable();
            $table->string('status', 30)->default('planejamento');
            $table->string('cor', 20)->nullable();
            $table->string('icone', 60)->nullable();
            $table->decimal('peso_inicial', 10, 2)->nullable();
            $table->decimal('peso_meta', 10, 2)->nullable();
            $table->decimal('distancia_meta', 12, 2)->nullable();
            $table->decimal('valor_meta', 14, 2)->nullable();
            $table->string('tipo_meta', 30)->default('personalizado');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'tipo_meta']);
            $table->index(['user_id', 'data_meta']);
        });

        Schema::create('goal_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->unsignedInteger('ordem')->default(1);
            $table->decimal('meta_valor', 14, 2)->nullable();
            $table->boolean('concluido')->default(false);
            $table->timestamp('concluido_em')->nullable();
            $table->timestamps();

            $table->index(['goal_id', 'ordem']);
            $table->index(['goal_id', 'concluido']);
        });

        Schema::create('goal_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();
            $table->date('data');
            $table->string('descricao');
            $table->decimal('valor', 14, 2)->nullable();
            $table->string('tipo', 40);
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['goal_id', 'data']);
            $table->index(['goal_id', 'tipo']);
        });

        Schema::create('goal_rotina', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();
            $table->foreignId('rotina_id')->constrained('rotinas')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['goal_id', 'rotina_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_rotina');
        Schema::dropIfExists('goal_progress');
        Schema::dropIfExists('goal_milestones');
        Schema::dropIfExists('goals');
    }
};
