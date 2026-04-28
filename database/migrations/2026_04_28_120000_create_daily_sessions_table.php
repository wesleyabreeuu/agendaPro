<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->date('date');
            $table->boolean('started')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_sessions');
    }
};
