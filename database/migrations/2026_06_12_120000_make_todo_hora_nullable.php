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
            $table->time('hora')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('todos')->whereNull('hora')->update(['hora' => '00:00:00']);

        Schema::table('todos', function (Blueprint $table) {
            $table->time('hora')->nullable(false)->change();
        });
    }
};
