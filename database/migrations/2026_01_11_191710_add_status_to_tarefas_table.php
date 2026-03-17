<?php

// database/migrations/xxxx_xx_xx_add_status_to_tarefas_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::table('todos', function (Blueprint $table) {
      $table->string('status')->default('aguardando')->after('urgencia');
      // opcional: se quiser controlar data de finalização
      $table->timestamp('finalizado_em')->nullable()->after('status');
    });
  }

  public function down(): void
  {
    Schema::table('todos', function (Blueprint $table) {
      $table->dropColumn(['status', 'finalizado_em']);
    });
  }
};
