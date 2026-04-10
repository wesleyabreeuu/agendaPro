<?php

namespace Tests\Feature;

use App\Models\Compromisso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompromissoCompartilhamentoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_share_a_compromisso_with_another_user(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $guest = User::factory()->create(['is_admin' => true]);
        $compromisso = $this->createCompromisso($owner);

        $response = $this->actingAs($owner)->postJson("/api/compromissos/{$compromisso->id}/compartilhar", [
            'usuario_id' => $guest->id,
            'permissao' => 'visualizar',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.usuario_id', $guest->id)
            ->assertJsonPath('data.permissao', 'visualizar');

        $this->assertDatabaseHas('compromisso_compartilhamentos', [
            'compromisso_id' => $compromisso->id,
            'usuario_id' => $guest->id,
            'permissao' => 'visualizar',
        ]);
    }

    public function test_shared_user_with_visualizar_can_view_but_cannot_update(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $viewer = User::factory()->create(['is_admin' => true]);
        $compromisso = $this->createCompromisso($owner);
        $compromisso->usuariosCompartilhados()->attach($viewer->id, ['permissao' => 'visualizar']);

        $this->actingAs($viewer)
            ->getJson("/api/compromissos/{$compromisso->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $compromisso->id)
            ->assertJsonPath('data.permissao', 'visualizar')
            ->assertJsonPath('data.pode_editar', false);

        $this->actingAs($viewer)
            ->putJson("/api/compromissos/{$compromisso->id}", [
                'titulo' => 'Alterado',
                'data_inicio' => now()->addDay()->toDateTimeString(),
            ])
            ->assertForbidden();
    }

    public function test_shared_user_with_editar_can_update_compromisso(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $editor = User::factory()->create(['is_admin' => true]);
        $compromisso = $this->createCompromisso($owner);
        $compromisso->usuariosCompartilhados()->attach($editor->id, ['permissao' => 'editar']);

        $response = $this->actingAs($editor)
            ->putJson("/api/compromissos/{$compromisso->id}", [
                'titulo' => 'Compromisso editado',
                'descricao' => 'Descricao editada',
                'categoria_id' => null,
                'data_inicio' => now()->addDays(2)->toDateTimeString(),
                'data_fim' => now()->addDays(2)->addHour()->toDateTimeString(),
                'dia_inteiro' => false,
                'recorrencia' => null,
                'recorrencia_intervalo' => null,
                'data_fim_recorrencia' => null,
                'telefone' => '5511999999999',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.titulo', 'Compromisso editado')
            ->assertJsonPath('data.permissao', 'editar')
            ->assertJsonPath('data.pode_editar', true);

        $this->assertDatabaseHas('compromissos', [
            'id' => $compromisso->id,
            'titulo' => 'Compromisso editado',
        ]);
    }

    public function test_shared_compromissos_endpoint_lists_items_shared_with_user(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $sharedUser = User::factory()->create(['is_admin' => true]);
        $compromisso = $this->createCompromisso($owner, 'Reuniao compartilhada');
        $compromisso->usuariosCompartilhados()->attach($sharedUser->id, ['permissao' => 'editar']);

        $this->actingAs($sharedUser)
            ->getJson('/api/compromissos/compartilhados')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $compromisso->id)
            ->assertJsonPath('data.0.permissao', 'editar');
    }

    public function test_owner_can_remove_shared_access(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $sharedUser = User::factory()->create(['is_admin' => true]);
        $compromisso = $this->createCompromisso($owner);
        $compromisso->usuariosCompartilhados()->attach($sharedUser->id, ['permissao' => 'editar']);

        $this->actingAs($owner)
            ->deleteJson("/api/compromissos/{$compromisso->id}/compartilhar/{$sharedUser->id}")
            ->assertOk()
            ->assertJsonPath('data.usuario_id', $sharedUser->id);

        $this->assertDatabaseMissing('compromisso_compartilhamentos', [
            'compromisso_id' => $compromisso->id,
            'usuario_id' => $sharedUser->id,
        ]);
    }

    private function createCompromisso(User $owner, string $titulo = 'Compromisso teste'): Compromisso
    {
        return Compromisso::create([
            'usuarios_id' => $owner->id,
            'categoria_id' => null,
            'titulo' => $titulo,
            'descricao' => 'Descricao',
            'data_inicio' => now()->addDay(),
            'data_fim' => now()->addDay()->addHour(),
            'dia_inteiro' => false,
            'telefone' => null,
        ]);
    }
}
