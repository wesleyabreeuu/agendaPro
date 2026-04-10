<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('web_push_subscriptions')) {
            if (!Schema::hasColumn('web_push_subscriptions', 'endpoint_hash')) {
                Schema::table('web_push_subscriptions', function (Blueprint $table) {
                    $table->char('endpoint_hash', 64)->nullable()->after('endpoint');
                });

                DB::table('web_push_subscriptions')
                    ->select(['id', 'endpoint'])
                    ->orderBy('id')
                    ->chunkById(100, function ($subscriptions) {
                        foreach ($subscriptions as $subscription) {
                            DB::table('web_push_subscriptions')
                                ->where('id', $subscription->id)
                                ->update([
                                    'endpoint_hash' => hash('sha256', $subscription->endpoint),
                                ]);
                        }
                    });
            }

            $indexes = collect(Schema::getIndexes('web_push_subscriptions'));
            $hasEndpointHashUnique = $indexes->contains(function (array $index) {
                return ($index['name'] ?? null) === 'web_push_subscriptions_endpoint_hash_unique';
            });

            if (!$hasEndpointHashUnique) {
                Schema::table('web_push_subscriptions', function (Blueprint $table) {
                    $table->unique('endpoint_hash');
                });
            }

            return;
        }

        Schema::create('web_push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->text('endpoint');
            $table->char('endpoint_hash', 64)->unique();
            $table->text('public_key');
            $table->text('auth_token');
            $table->string('content_encoding', 32)->default('aes128gcm');
            $table->string('user_agent')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('last_sent_at')->nullable();
            $table->text('last_failure_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_push_subscriptions');
    }
};
