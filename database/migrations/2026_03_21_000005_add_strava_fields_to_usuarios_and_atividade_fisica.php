<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('strava_athlete_id')->nullable()->after('remember_token');
            $table->text('strava_access_token')->nullable()->after('strava_athlete_id');
            $table->text('strava_refresh_token')->nullable()->after('strava_access_token');
            $table->timestamp('strava_token_expires_at')->nullable()->after('strava_refresh_token');
            $table->string('strava_scope')->nullable()->after('strava_token_expires_at');
            $table->timestamp('strava_connected_at')->nullable()->after('strava_scope');
        });

        Schema::table('atividade_fisica', function (Blueprint $table) {
            $table->string('fonte')->nullable()->after('notas');
            $table->string('fonte_id')->nullable()->after('fonte');
            $table->timestamp('sincronizado_em')->nullable()->after('fonte_id');

            $table->unique(['fonte', 'fonte_id'], 'atividade_fisica_fonte_unique');
        });
    }

    public function down(): void
    {
        Schema::table('atividade_fisica', function (Blueprint $table) {
            $table->dropUnique('atividade_fisica_fonte_unique');
            $table->dropColumn(['fonte', 'fonte_id', 'sincronizado_em']);
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'strava_athlete_id',
                'strava_access_token',
                'strava_refresh_token',
                'strava_token_expires_at',
                'strava_scope',
                'strava_connected_at',
            ]);
        });
    }
};
