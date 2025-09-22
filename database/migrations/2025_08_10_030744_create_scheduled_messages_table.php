<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('scheduled_messages', function (Blueprint $t) {
            $t->id();
            $t->morphs('related'); // vincular ao Compromisso ou outro
            $t->unsignedBigInteger('user_id');
            $t->string('recipient'); // E.164 ex: 55DDDNNNNNNNN
            $t->text('message');
            $t->timestamp('scheduled_at'); // UTC
            $t->string('timezone')->default('America/Sao_Paulo');
            $t->enum('status', ['pending','sending','sent','canceled','failed'])->default('pending');
            $t->timestamp('sent_at')->nullable();
            $t->string('provider_message_id')->nullable();
            $t->text('last_error')->nullable();
            $t->timestamps();

            $t->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('scheduled_messages');
    }
};
