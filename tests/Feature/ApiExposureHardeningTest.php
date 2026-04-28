<?php

namespace Tests\Feature;

use App\Models\Compromisso;
use App\Models\CompromissoCompartilhamento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiExposureHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_responses_include_secure_headers(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->getJson('/api/daily-session/check');

        $response->assertOk();
        $cacheControl = $response->headers->get('Cache-Control', '');
        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('private', $cacheControl);
        $this->assertStringContainsString('max-age=0', $cacheControl);
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_shared_user_does_not_receive_sensitive_commitment_fields(): void
    {
        $owner = User::factory()->create(['is_admin' => true]);
        $shared = User::factory()->create(['is_admin' => true]);

        $compromisso = Compromisso::create([
            'usuarios_id' => $owner->id,
            'categoria_id' => null,
            'titulo' => 'Reunião privada',
            'descricao' => 'Detalhes internos',
            'data_inicio' => now()->addDay()->startOfHour(),
            'data_fim' => now()->addDay()->startOfHour()->addHour(),
            'dia_inteiro' => false,
            'telefone' => '11999999999',
        ]);

        CompromissoCompartilhamento::create([
            'compromisso_id' => $compromisso->id,
            'usuario_id' => $shared->id,
            'permissao' => 'visualizar',
        ]);

        $response = $this->actingAs($shared)->getJson("/api/compromissos/{$compromisso->id}");

        $response->assertOk();
        $response->assertJsonPath('data.telefone', null);
        $response->assertJsonMissingPath('data.owner.email');
        $response->assertJsonPath('data.compartilhado_com', []);
    }
}
