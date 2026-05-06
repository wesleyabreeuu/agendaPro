<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('atividade_fisica', function (Blueprint $table) {
            $table->string('sport_type')->nullable()->after('fonte_id');
            $table->unsignedInteger('tempo_movimento_segundos')->nullable()->after('duracao_minutos');
            $table->unsignedInteger('tempo_decorrido_segundos')->nullable()->after('tempo_movimento_segundos');
            $table->decimal('elevacao_maxima_metros', 8, 2)->nullable()->after('elevacao_ganho_metros');
            $table->decimal('elevacao_minima_metros', 8, 2)->nullable()->after('elevacao_maxima_metros');
            $table->unsignedInteger('achievement_count')->nullable()->after('ritmo_medio_segundos');
            $table->unsignedInteger('pr_count')->nullable()->after('achievement_count');
            $table->unsignedInteger('total_photo_count')->nullable()->after('pr_count');
            $table->decimal('start_latitude', 10, 7)->nullable()->after('total_photo_count');
            $table->decimal('start_longitude', 10, 7)->nullable()->after('start_latitude');
            $table->decimal('end_latitude', 10, 7)->nullable()->after('start_longitude');
            $table->decimal('end_longitude', 10, 7)->nullable()->after('end_latitude');
            $table->json('stream_data')->nullable()->after('mapa_resumo_polyline');
        });
    }

    public function down(): void
    {
        Schema::table('atividade_fisica', function (Blueprint $table) {
            $table->dropColumn([
                'sport_type',
                'tempo_movimento_segundos',
                'tempo_decorrido_segundos',
                'elevacao_maxima_metros',
                'elevacao_minima_metros',
                'achievement_count',
                'pr_count',
                'total_photo_count',
                'start_latitude',
                'start_longitude',
                'end_latitude',
                'end_longitude',
                'stream_data',
            ]);
        });
    }
};
