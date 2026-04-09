<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->text('observacao')->nullable()->after('descricao');
        });

        DB::statement("ALTER TABLE todos MODIFY urgencia ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE todos MODIFY urgencia ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media'");

        Schema::table('todos', function (Blueprint $table) {
            $table->dropColumn('observacao');
        });
    }
};
