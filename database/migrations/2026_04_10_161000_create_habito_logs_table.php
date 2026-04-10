<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habito_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habito_id')->constrained('habitos')->cascadeOnDelete();
            $table->date('data');
            $table->timestamp('concluido_em')->nullable();
            $table->timestamps();

            $table->unique(['habito_id', 'data']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habito_logs');
    }
};
