<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('compromissos', function (Blueprint $table) {
        $table->string('recorrencia')->nullable(); // diaria, semanal, mensal
        $table->integer('recorrencia_intervalo')->nullable(); // Ex: a cada X dias/semanas/meses
        $table->date('data_fim_recorrencia')->nullable(); // até quando repetir
    });
}

public function down()
{
    Schema::table('compromissos', function (Blueprint $table) {
        $table->dropColumn('recorrencia');
        $table->dropColumn('recorrencia_intervalo');
        $table->dropColumn('data_fim_recorrencia');
    });
}
};
