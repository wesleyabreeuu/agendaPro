<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('transacao_financeira')) {
            Schema::table('transacao_financeira', function (Blueprint $table) {
                if (!Schema::hasColumn('transacao_financeira', 'status')) {
                    $table->enum('status', ['pendente', 'pago', 'recebido'])->default('pago')->after('tipo');
                }

                if (!Schema::hasColumn('transacao_financeira', 'forma_pagamento')) {
                    $table->enum('forma_pagamento', ['dinheiro', 'pix', 'conta'])->nullable()->after('status');
                }

                if (!Schema::hasColumn('transacao_financeira', 'complemento')) {
                    $table->string('complemento')->nullable()->after('descricao');
                }
            });
        }

        if (Schema::hasTable('conta_bancaria')) {
            Schema::table('conta_bancaria', function (Blueprint $table) {
                if (!Schema::hasColumn('conta_bancaria', 'instituicao')) {
                    $table->string('instituicao')->nullable()->after('nome');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('transacao_financeira')) {
            Schema::table('transacao_financeira', function (Blueprint $table) {
                $columns = [];

                if (Schema::hasColumn('transacao_financeira', 'status')) {
                    $columns[] = 'status';
                }

                if (Schema::hasColumn('transacao_financeira', 'forma_pagamento')) {
                    $columns[] = 'forma_pagamento';
                }

                if (Schema::hasColumn('transacao_financeira', 'complemento')) {
                    $columns[] = 'complemento';
                }

                if ($columns !== []) {
                    $table->dropColumn($columns);
                }
            });
        }

        if (Schema::hasTable('conta_bancaria') && Schema::hasColumn('conta_bancaria', 'instituicao')) {
            Schema::table('conta_bancaria', function (Blueprint $table) {
                $table->dropColumn('instituicao');
            });
        }
    }
};
