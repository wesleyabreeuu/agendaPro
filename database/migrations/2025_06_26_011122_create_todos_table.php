<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::create('todos', function (Blueprint $table) {
        $table->id();
        $table->date('data');
        $table->time('hora');
        $table->string('descricao');
        $table->enum('urgencia', ['baixa', 'media', 'alta'])->default('media');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
