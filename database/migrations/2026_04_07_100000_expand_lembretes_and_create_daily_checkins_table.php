<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        Schema::table('lembretes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('tipo')->default('compromisso')->after('user_id');
            $table->string('titulo')->nullable()->after('tipo');
            $table->text('descricao')->nullable()->after('titulo');
            $table->string('categoria')->nullable()->after('descricao');
            $table->dateTime('inicio_em')->nullable()->after('categoria');
            $table->dateTime('proxima_execucao_em')->nullable()->after('inicio_em');
            $table->string('recorrencia')->nullable()->after('proxima_execucao_em');
            $table->unsignedInteger('intervalo_recorrencia')->nullable()->after('recorrencia');
            $table->json('dias_semana')->nullable()->after('intervalo_recorrencia');
            $table->date('fim_recorrencia_em')->nullable()->after('dias_semana');
            $table->boolean('ativo')->default(true)->after('fim_recorrencia_em');
            $table->timestamp('ultima_execucao_em')->nullable()->after('notificado_em');
        });

        if ($driver === 'sqlite') {
            DB::table('lembretes')
                ->select('lembretes.id', 'compromissos.usuarios_id', 'compromissos.titulo', 'compromissos.descricao', 'compromissos.data_inicio')
                ->join('compromissos', 'compromissos.id', '=', 'lembretes.compromisso_id')
                ->orderBy('lembretes.id')
                ->get()
                ->each(function ($lembrete) {
                    DB::table('lembretes')
                        ->where('id', $lembrete->id)
                        ->update([
                            'user_id' => $lembrete->usuarios_id,
                            'titulo' => $lembrete->titulo,
                            'descricao' => $lembrete->descricao,
                            'inicio_em' => $lembrete->data_inicio,
                        ]);
                });
        } else {
            DB::table('lembretes')
                ->join('compromissos', 'compromissos.id', '=', 'lembretes.compromisso_id')
                ->update([
                    'lembretes.user_id' => DB::raw('compromissos.usuarios_id'),
                    'lembretes.titulo' => DB::raw('compromissos.titulo'),
                    'lembretes.descricao' => DB::raw('compromissos.descricao'),
                    'lembretes.inicio_em' => DB::raw('compromissos.data_inicio'),
                ]);

            DB::statement('ALTER TABLE lembretes MODIFY compromisso_id BIGINT UNSIGNED NULL');
        }

        Schema::create('daily_checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->date('data');
            $table->unsignedTinyInteger('humor');
            $table->unsignedTinyInteger('energia');
            $table->unsignedTinyInteger('produtividade');
            $table->text('destaque')->nullable();
            $table->text('gratidao')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'data']);
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        Schema::dropIfExists('daily_checkins');

        if ($driver !== 'sqlite') {
            DB::statement('ALTER TABLE lembretes MODIFY compromisso_id BIGINT UNSIGNED NOT NULL');
        }

        Schema::table('lembretes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn([
                'tipo',
                'titulo',
                'descricao',
                'categoria',
                'inicio_em',
                'proxima_execucao_em',
                'recorrencia',
                'intervalo_recorrencia',
                'dias_semana',
                'fim_recorrencia_em',
                'ativo',
                'ultima_execucao_em',
            ]);
        });
    }
};
