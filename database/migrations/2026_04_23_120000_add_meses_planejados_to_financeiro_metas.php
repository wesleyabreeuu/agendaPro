<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('metas_economia') && !Schema::hasColumn('metas_economia', 'meses_planejados')) {
            Schema::table('metas_economia', function (Blueprint $table) {
                $table->unsignedInteger('meses_planejados')->nullable()->after('prazo_final');
            });
        }

        if (Schema::hasTable('metas_bem_material') && !Schema::hasColumn('metas_bem_material', 'meses_planejados')) {
            Schema::table('metas_bem_material', function (Blueprint $table) {
                $table->unsignedInteger('meses_planejados')->nullable()->after('valor_guardar_mes');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('metas_economia') && Schema::hasColumn('metas_economia', 'meses_planejados')) {
            Schema::table('metas_economia', function (Blueprint $table) {
                $table->dropColumn('meses_planejados');
            });
        }

        if (Schema::hasTable('metas_bem_material') && Schema::hasColumn('metas_bem_material', 'meses_planejados')) {
            Schema::table('metas_bem_material', function (Blueprint $table) {
                $table->dropColumn('meses_planejados');
            });
        }
    }
};
