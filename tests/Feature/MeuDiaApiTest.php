<?php

namespace Tests\Feature;

use App\Models\Compromisso;
use App\Models\DailySession;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeuDiaApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_daily_timeline_and_summary(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        Compromisso::create([
            'usuarios_id' => $user->id,
            'categoria_id' => null,
            'titulo' => 'Reunião de planejamento',
            'descricao' => 'Definir prioridades da semana',
            'data_inicio' => today()->copy()->addHours(9),
            'data_fim' => today()->copy()->addHours(10),
            'dia_inteiro' => false,
        ]);

        Todo::create([
            'user_id' => $user->id,
            'data' => today()->toDateString(),
            'hora' => '14:00',
            'descricao' => 'Fechar relatório',
            'observacao' => 'Enviar para o cliente',
            'urgencia' => 'alta',
            'status' => 'aguardando',
        ]);

        $response = $this->actingAs($user)->getJson('/api/meu-dia');

        $response->assertOk()
            ->assertJsonStructure([
                'timeline',
                'pendencias',
                'resumo' => ['total', 'concluidos', 'percentual', 'itens_por_tipo'],
            ])
            ->assertJsonPath('resumo.itens_por_tipo.compromissos', 1)
            ->assertJsonPath('resumo.itens_por_tipo.tarefas', 1);
    }

    public function test_it_checks_and_starts_daily_session(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $this->actingAs($user)
            ->getJson('/api/daily-session/check')
            ->assertOk()
            ->assertJsonPath('iniciado', false);

        $this->actingAs($user)
            ->postJson('/api/daily-session/start')
            ->assertOk()
            ->assertJsonPath('iniciado', true);

        $this->assertDatabaseHas('daily_sessions', [
            'user_id' => $user->id,
            'date' => today()->toDateString() . ' 00:00:00',
            'started' => true,
        ]);

        $this->assertSame(1, DailySession::count());
    }
}
