<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regras', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('slug')->unique();
            $table->text('descricao')->nullable();
            $table->boolean('acesso_compromissos')->default(false);
            $table->boolean('acesso_dia_a_dia')->default(false);
            $table->boolean('acesso_projetos')->default(false);
            $table->boolean('acesso_financeiro')->default(false);
            $table->boolean('acesso_saude')->default(false);
            $table->timestamps();
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('telefone', 30)->nullable()->after('email');
            $table->string('endereco')->nullable()->after('telefone');
            $table->string('foto_path')->nullable()->after('endereco');
            $table->boolean('is_admin')->default(false)->after('foto_path');
            $table->foreignId('regra_id')->nullable()->after('is_admin')->constrained('regras')->nullOnDelete();
        });

        DB::table('regras')->insert([
            [
                'nome' => 'Comum',
                'slug' => 'comum',
                'descricao' => 'Acesso aos módulos Compromissos e Dia a dia.',
                'acesso_compromissos' => true,
                'acesso_dia_a_dia' => true,
                'acesso_projetos' => false,
                'acesso_financeiro' => false,
                'acesso_saude' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Premium',
                'slug' => 'premium',
                'descricao' => 'Acesso aos módulos Compromissos, Dia a dia e Projetos.',
                'acesso_compromissos' => true,
                'acesso_dia_a_dia' => true,
                'acesso_projetos' => true,
                'acesso_financeiro' => false,
                'acesso_saude' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Platinum',
                'slug' => 'platinum',
                'descricao' => 'Acesso a todos os módulos da plataforma.',
                'acesso_compromissos' => true,
                'acesso_dia_a_dia' => true,
                'acesso_projetos' => true,
                'acesso_financeiro' => true,
                'acesso_saude' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $regraComumId = DB::table('regras')->where('slug', 'comum')->value('id');
        DB::table('usuarios')->update(['regra_id' => $regraComumId]);

        $adminEmail = 'wesleyavivabr@gmail.com';
        $adminId = DB::table('usuarios')->where('email', $adminEmail)->value('id');
        if (!$adminId) {
            $adminId = DB::table('usuarios')->orderBy('id')->value('id');
        }

        if ($adminId) {
            DB::table('usuarios')
                ->where('id', $adminId)
                ->update(['is_admin' => true]);
        }
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('regra_id');
            $table->dropColumn([
                'telefone',
                'endereco',
                'foto_path',
                'is_admin',
            ]);
        });

        Schema::dropIfExists('regras');
    }
};
