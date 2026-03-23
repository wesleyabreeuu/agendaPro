<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metas_bem_material', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('nome_bem');
            $table->string('descricao')->nullable();
            $table->decimal('valor_bem', 12, 2);
            $table->decimal('valor_ja_guardado', 12, 2)->default(0);
            $table->decimal('valor_guardar_mes', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metas_bem_material');
    }
};
