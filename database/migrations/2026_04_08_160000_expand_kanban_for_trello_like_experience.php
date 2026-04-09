<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kanban_boards', function (Blueprint $table) {
            $table->string('background_style')->nullable()->after('descricao');
            $table->json('listas')->nullable()->after('background_style');
        });

        Schema::table('kanban_tasks', function (Blueprint $table) {
            $table->string('list_key')->nullable()->after('status');
            $table->text('observacoes')->nullable()->after('descricao');
            $table->json('anexos')->nullable()->after('campos_personalizados');
        });
    }

    public function down(): void
    {
        Schema::table('kanban_tasks', function (Blueprint $table) {
            $table->dropColumn(['list_key', 'observacoes', 'anexos']);
        });

        Schema::table('kanban_boards', function (Blueprint $table) {
            $table->dropColumn(['background_style', 'listas']);
        });
    }
};
