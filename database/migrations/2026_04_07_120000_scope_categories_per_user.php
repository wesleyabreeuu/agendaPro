<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('usuarios')->cascadeOnDelete();
        });

        Schema::table('categoria_atividade_fisica', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('usuarios')->cascadeOnDelete();
        });

        Schema::table('categoria_atividade_fisica', function (Blueprint $table) {
            $table->dropUnique('categoria_atividade_fisica_nome_unique');
        });

        $this->migrateCompromissoCategories();
        $this->migrateAtividadeCategories();

        Schema::table('categorias', function (Blueprint $table) {
            $table->unique(['user_id', 'nome']);
        });

        Schema::table('categoria_atividade_fisica', function (Blueprint $table) {
            $table->unique(['user_id', 'nome']);
        });
    }

    public function down(): void
    {
        Schema::table('categoria_atividade_fisica', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'nome']);
            $table->unique('nome');
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('categorias', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'nome']);
            $table->dropConstrainedForeignId('user_id');
        });
    }

    private function migrateCompromissoCategories(): void
    {
        $rows = DB::table('compromissos')
            ->join('categorias', 'categorias.id', '=', 'compromissos.categoria_id')
            ->select(
                'compromissos.id as compromisso_id',
                'compromissos.usuarios_id as user_id',
                'categorias.id as categoria_id',
                'categorias.nome as categoria_nome'
            )
            ->get();

        $map = [];

        foreach ($rows as $row) {
            $key = $row->user_id . '|' . $row->categoria_nome;

            if (!isset($map[$key])) {
                $existingId = DB::table('categorias')
                    ->where('user_id', $row->user_id)
                    ->where('nome', $row->categoria_nome)
                    ->value('id');

                if (!$existingId) {
                    $existingId = DB::table('categorias')->insertGetId([
                        'user_id' => $row->user_id,
                        'nome' => $row->categoria_nome,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $map[$key] = $existingId;
            }

            DB::table('compromissos')
                ->where('id', $row->compromisso_id)
                ->update(['categoria_id' => $map[$key]]);
        }
    }

    private function migrateAtividadeCategories(): void
    {
        $rows = DB::table('atividade_fisica')
            ->join('categoria_atividade_fisica', 'categoria_atividade_fisica.id', '=', 'atividade_fisica.categoria_atividade_fisica_id')
            ->select(
                'atividade_fisica.id as atividade_id',
                'atividade_fisica.user_id',
                'categoria_atividade_fisica.nome',
                'categoria_atividade_fisica.icone',
                'categoria_atividade_fisica.cor',
                'categoria_atividade_fisica.caloria_leve',
                'categoria_atividade_fisica.caloria_moderada',
                'categoria_atividade_fisica.caloria_intensa'
            )
            ->get();

        $map = [];

        foreach ($rows as $row) {
            $key = $row->user_id . '|' . $row->nome;

            if (!isset($map[$key])) {
                $existingId = DB::table('categoria_atividade_fisica')
                    ->where('user_id', $row->user_id)
                    ->where('nome', $row->nome)
                    ->value('id');

                if (!$existingId) {
                    $existingId = DB::table('categoria_atividade_fisica')->insertGetId([
                        'user_id' => $row->user_id,
                        'nome' => $row->nome,
                        'icone' => $row->icone,
                        'cor' => $row->cor,
                        'caloria_leve' => $row->caloria_leve,
                        'caloria_moderada' => $row->caloria_moderada,
                        'caloria_intensa' => $row->caloria_intensa,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $map[$key] = $existingId;
            }

            DB::table('atividade_fisica')
                ->where('id', $row->atividade_id)
                ->update(['categoria_atividade_fisica_id' => $map[$key]]);
        }
    }
};
