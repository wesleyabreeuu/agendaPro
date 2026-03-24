<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('atividade_fisica', function (Blueprint $table) {
            $table->decimal('distancia_metros', 10, 2)->nullable()->after('calorias_queimadas');
            $table->decimal('elevacao_ganho_metros', 8, 2)->nullable()->after('distancia_metros');
            $table->decimal('velocidade_media_mps', 8, 3)->nullable()->after('elevacao_ganho_metros');
            $table->decimal('velocidade_maxima_mps', 8, 3)->nullable()->after('velocidade_media_mps');
            $table->unsignedInteger('ritmo_medio_segundos')->nullable()->after('velocidade_maxima_mps');
            $table->text('mapa_resumo_polyline')->nullable()->after('ritmo_medio_segundos');
        });
    }

    public function down(): void
    {
        Schema::table('atividade_fisica', function (Blueprint $table) {
            $table->dropColumn([
                'distancia_metros',
                'elevacao_ganho_metros',
                'velocidade_media_mps',
                'velocidade_maxima_mps',
                'ritmo_medio_segundos',
                'mapa_resumo_polyline',
            ]);
        });
    }
};
