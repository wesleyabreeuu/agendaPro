<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE kanban_tasks MODIFY urgencia ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE kanban_tasks MODIFY urgencia ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media'");
        }
    }
};
