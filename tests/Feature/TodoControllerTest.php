<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_task_for_the_date_chosen_by_the_user(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->post('/todo', [
            'data' => '2026-06-15',
            'hora' => '15:06',
            'descricao' => 'Validar migracao',
            'observacao' => null,
            'urgencia' => 'alta',
            'status' => 'execucao',
            'concluida' => false,
        ]);

        $response->assertRedirect(route('todo.index', ['data' => '2026-06-15']));

        $this->assertDatabaseHas('todos', [
            'user_id' => $user->id,
            'data' => '2026-06-15 00:00:00',
            'hora' => '15:06',
            'descricao' => 'Validar migracao',
            'urgencia' => 'alta',
            'status' => 'execucao',
        ]);
    }

    public function test_it_updates_task_date_and_name(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $todo = Todo::create([
            'user_id' => $user->id,
            'data' => '2026-06-11',
            'hora' => '09:00',
            'descricao' => 'Nome antigo',
            'observacao' => null,
            'urgencia' => 'media',
            'status' => 'aguardando',
        ]);

        $response = $this->actingAs($user)->put("/todo/{$todo->id}", [
            'data' => '2026-06-18',
            'hora' => '10:30',
            'descricao' => 'Nome atualizado',
            'observacao' => 'Detalhe mantido',
            'urgencia' => 'urgente',
            'status' => 'execucao',
            'concluida' => false,
        ]);

        $response->assertRedirect(route('todo.index', ['data' => '2026-06-18']));

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'data' => '2026-06-18 00:00:00',
            'hora' => '10:30',
            'descricao' => 'Nome atualizado',
            'observacao' => 'Detalhe mantido',
            'urgencia' => 'urgente',
            'status' => 'execucao',
        ]);
    }
}
