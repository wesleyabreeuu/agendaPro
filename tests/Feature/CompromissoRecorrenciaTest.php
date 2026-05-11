<?php

namespace Tests\Feature;

use App\Models\Compromisso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompromissoRecorrenciaTest extends TestCase
{
    use RefreshDatabase;

    public function test_weekly_recurrence_creates_every_week_until_the_selected_final_date(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $this->actingAs($user)
            ->post('/compromissos', [
                'titulo' => 'Seminario de Vida no Espirito',
                'categoria_id' => null,
                'descricao' => 'Encontro semanal',
                'data_inicio' => '2026-05-07T19:00',
                'data_fim' => '2026-05-07T22:00',
                'dia_inteiro' => false,
                'recorrencia' => 'semanal',
                'recorrencia_intervalo' => 1,
                'data_fim_recorrencia' => '2026-07-02',
                'telefone' => null,
                'lead_time' => null,
            ])
            ->assertRedirect(route('compromissos.index'));

        $datasInicio = Compromisso::query()
            ->where('usuarios_id', $user->id)
            ->orderBy('data_inicio')
            ->pluck('data_inicio')
            ->map(fn ($date) => $date->format('Y-m-d H:i'))
            ->all();

        $this->assertSame([
            '2026-05-07 19:00',
            '2026-05-14 19:00',
            '2026-05-21 19:00',
            '2026-05-28 19:00',
            '2026-06-04 19:00',
            '2026-06-11 19:00',
            '2026-06-18 19:00',
            '2026-06-25 19:00',
            '2026-07-02 19:00',
        ], $datasInicio);

        $this->assertDatabaseHas('compromissos', [
            'usuarios_id' => $user->id,
            'data_inicio' => '2026-06-04 19:00:00',
            'data_fim' => '2026-06-04 22:00:00',
        ]);

        $this->assertDatabaseHas('compromissos', [
            'usuarios_id' => $user->id,
            'data_inicio' => '2026-07-02 19:00:00',
            'data_fim' => '2026-07-02 22:00:00',
        ]);
    }
}
