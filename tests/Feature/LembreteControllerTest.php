<?php

namespace Tests\Feature;

use App\Models\Lembrete;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LembreteControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_it_allows_creating_active_reminder_for_today_when_trigger_time_is_still_in_the_future(): void
    {
        config(['app.timezone' => 'America/Sao_Paulo']);
        Carbon::setTestNow(Carbon::parse('2026-06-10 21:37:00', 'America/Sao_Paulo'));

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->post('/lembretes', [
            'tipo' => 'personalizado',
            'titulo' => 'Teste hoje',
            'descricao' => null,
            'categoria' => null,
            'inicio_em' => '2026-06-10T22:05',
            'minutos_antes' => 2,
            'recorrencia' => 'diaria',
            'intervalo_recorrencia' => 1,
            'ativo' => true,
        ]);

        $response->assertRedirect(route('lembretes.index'));

        $lembrete = Lembrete::firstOrFail();

        $this->assertSame($user->id, $lembrete->user_id);
        $this->assertSame('Teste hoje', $lembrete->titulo);
        $this->assertSame('2026-06-10 22:03:00', $lembrete->proxima_execucao_em->format('Y-m-d H:i:s'));
    }

    public function test_it_blocks_creating_active_reminder_when_trigger_time_has_already_passed_today(): void
    {
        config(['app.timezone' => 'America/Sao_Paulo']);
        Carbon::setTestNow(Carbon::parse('2026-06-10 22:04:00', 'America/Sao_Paulo'));

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->post('/lembretes', [
            'tipo' => 'personalizado',
            'titulo' => 'Teste passado',
            'inicio_em' => '2026-06-10T22:05',
            'minutos_antes' => 2,
            'ativo' => true,
        ]);

        $response->assertSessionHasErrors('minutos_antes');
        $this->assertDatabaseCount('lembretes', 0);
    }
}
