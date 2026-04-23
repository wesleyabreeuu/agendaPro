<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotina_templates', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('categoria', 40);
            $table->json('rotinas');
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->unique('nome');
            $table->index(['categoria', 'ativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rotina_templates');
    }
};
