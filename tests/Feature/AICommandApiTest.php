<?php

namespace Tests\Feature;

use App\Models\Compromisso;
use App\Models\Lembrete;
use App\Models\MetaBemMaterial;
use App\Models\MetaEconomia;
use App\Models\Todo;
use App\Models\TransacaoFinanceira;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AICommandApiTest extends TestCase
{
    use RefreshDatabase;

    private const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    public function test_it_creates_a_task_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_task',
            'data' => [
                'title' => 'Estudar Laravel',
                'date' => '2026-04-11',
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'adiciona tarefa estudar laravel hoje',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_task')
            ->assertJsonPath('data.title', 'Estudar Laravel')
            ->assertJsonPath('data.date', '2026-04-11');

        $this->assertDatabaseHas('todos', [
            'user_id' => $user->id,
            'descricao' => 'Estudar Laravel',
            'data' => '2026-04-11 00:00:00',
            'hora' => '09:00',
            'status' => 'aguardando',
        ]);
    }

    public function test_it_returns_fallback_when_ai_cannot_understand_the_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'unknown',
            'data' => new \stdClass(),
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'faz alguma coisa estranha',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'unknown')
            ->assertJsonPath('message', 'Nao entendi o comando. Pode reformular?');

        $this->assertDatabaseCount('todos', 0);
    }

    public function test_it_lists_todays_events_without_creating_anything(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'list_events_today',
            'data' => new \stdClass(),
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        Compromisso::create([
            'usuarios_id' => $user->id,
            'categoria_id' => null,
            'titulo' => 'Reuniao de alinhamento',
            'descricao' => 'Equipe comercial',
            'data_inicio' => now()->startOfDay()->addHours(14),
            'data_fim' => now()->startOfDay()->addHours(15),
            'dia_inteiro' => false,
            'telefone' => null,
        ]);

        Compromisso::create([
            'usuarios_id' => $user->id,
            'categoria_id' => null,
            'titulo' => 'Evento de amanha',
            'descricao' => null,
            'data_inicio' => now()->addDay()->startOfDay()->addHours(10),
            'data_fim' => now()->addDay()->startOfDay()->addHours(11),
            'dia_inteiro' => false,
            'telefone' => null,
        ]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'quais sao meus compromissos de hoje?',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'list_events_today')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Reuniao de alinhamento');
    }

    public function test_it_blocks_actions_outside_the_whitelist(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'delete_user',
            'data' => new \stdClass(),
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'deleta o usuario 1',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('action', 'delete_user');

        $this->assertDatabaseCount('todos', 0);
        $this->assertSame(0, Todo::count());
    }

    public function test_it_creates_an_event_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_event',
            'data' => [
                'title' => 'Compromisso com Joao',
                'date' => '2026-04-12',
                'time' => '14:00',
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'cria um compromisso amanha as 14h com Joao',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_event')
            ->assertJsonPath('data.title', 'Compromisso com Joao')
            ->assertJsonPath('data.date', '2026-04-12')
            ->assertJsonPath('data.time', '14:00');

        $this->assertDatabaseHas('compromissos', [
            'usuarios_id' => $user->id,
            'titulo' => 'Compromisso com Joao',
        ]);
    }

    public function test_it_creates_a_reminder_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_reminder',
            'data' => [
                'description' => 'Pagar conta de luz',
                'date' => '2026-04-12',
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'me lembra de pagar conta de luz amanha',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_reminder')
            ->assertJsonPath('data.description', 'Pagar conta de luz')
            ->assertJsonPath('data.date', '2026-04-12');

        $this->assertDatabaseHas('lembretes', [
            'user_id' => $user->id,
            'descricao' => 'Pagar conta de luz',
            'tipo' => 'personalizado',
        ]);
    }

    public function test_it_creates_an_expense_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_expense',
            'data' => [
                'description' => 'Gasolina',
                'amount' => 50,
                'date' => '2026-04-12',
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'gastei 50 reais com gasolina hoje',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_expense')
            ->assertJsonPath('data.type', 'despesa')
            ->assertJsonPath('data.amount', 50);

        $this->assertDatabaseHas('transacao_financeira', [
            'user_id' => $user->id,
            'tipo' => 'despesa',
            'descricao' => 'Gasolina',
            'status' => 'pago',
        ]);

        $this->assertSame(1, TransacaoFinanceira::count());
    }

    public function test_it_creates_an_income_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_income',
            'data' => [
                'description' => 'Salario',
                'amount' => 2000,
                'date' => '2026-04-12',
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'recebi 2000 de salario hoje',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_income')
            ->assertJsonPath('data.type', 'receita')
            ->assertJsonPath('data.amount', 2000);

        $this->assertDatabaseHas('transacao_financeira', [
            'user_id' => $user->id,
            'tipo' => 'receita',
            'descricao' => 'Salario',
            'status' => 'recebido',
        ]);
    }

    public function test_it_creates_an_income_goal_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_income_goal',
            'data' => [
                'description' => 'Meta de economia',
                'target_amount' => 10000,
                'deadline' => '2026-12-31',
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'quero guardar 10 mil reais ate dezembro',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_income_goal')
            ->assertJsonPath('data.target_amount', 10000)
            ->assertJsonPath('data.deadline', '2026-12-31');

        $this->assertDatabaseHas('metas_economia', [
            'user_id' => $user->id,
            'titulo' => 'Meta de economia',
        ]);

        $this->assertSame(1, MetaEconomia::count());
    }

    public function test_it_creates_an_asset_goal_from_ai_command(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_asset_goal',
            'data' => [
                'description' => 'Comprar carro',
                'target_amount' => 50000,
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'quero comprar um carro de 50 mil',
        ]);

        $response->assertOk()
            ->assertJsonPath('action', 'create_asset_goal')
            ->assertJsonPath('data.description', 'Comprar carro')
            ->assertJsonPath('data.target_amount', 50000);

        $this->assertDatabaseHas('metas_bem_material', [
            'user_id' => $user->id,
            'nome_bem' => 'Comprar carro',
        ]);

        $this->assertSame(1, MetaBemMaterial::count());
    }

    public function test_it_blocks_unexpected_fields_returned_by_ai(): void
    {
        $this->fakeAssistantResponse([
            'action' => 'create_task',
            'data' => [
                'title' => 'Estudar Laravel',
                'date' => '2026-04-12',
                'admin' => true,
            ],
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'adiciona tarefa estudar laravel hoje',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Os dados interpretados pela IA nao passaram na validacao.');

        $this->assertDatabaseCount('todos', 0);
    }

    public function test_it_returns_422_when_openai_is_not_configured(): void
    {
        config([
            'services.openai.api_key' => null,
            'services.openai.base_url' => 'https://api.openai.com/v1',
        ]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->postJson('/api/ai/command', [
            'command' => 'adiciona tarefa estudar laravel hoje',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'A integracao com a OpenAI nao esta configurada.');
    }

    private function fakeAssistantResponse(array $payload): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.model' => 'gpt-4o-mini',
            'services.openai.base_url' => 'https://api.openai.com/v1',
        ]);

        Http::fake([
            self::OPENAI_ENDPOINT => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => json_encode($payload, JSON_UNESCAPED_UNICODE),
                    ],
                ]],
            ]),
        ]);
    }
}
