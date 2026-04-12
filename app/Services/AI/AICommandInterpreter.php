<?php

namespace App\Services\AI;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AICommandInterpreter
{
    public function interpret(string $command): array
    {
        $apiKey = (string) config('services.openai.api_key');
        $model = (string) config('services.openai.model');
        $baseUrl = rtrim((string) config('services.openai.base_url'), '/');
        $timeout = (int) config('services.openai.timeout', 30);

        if ($apiKey === '') {
            throw new RuntimeException('A integracao com a OpenAI nao esta configurada.');
        }

        $response = Http::baseUrl($baseUrl)
            ->withToken($apiKey)
            ->acceptJson()
            ->timeout($timeout)
            ->post('/chat/completions', [
                'model' => $model,
                'temperature' => 0,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $this->buildSystemPrompt()],
                    ['role' => 'user', 'content' => trim($command)],
                ],
            ])
            ->throw()
            ->json();

        $content = data_get($response, 'choices.0.message.content');

        if (!is_string($content) || trim($content) === '') {
            throw new RuntimeException('A IA retornou uma resposta vazia.');
        }

        $decoded = $this->decodeAssistantJson($content);

        if (!is_array($decoded) || !array_key_exists('action', $decoded)) {
            throw new RuntimeException('A IA nao retornou o formato JSON esperado.');
        }

        if (!array_key_exists('data', $decoded) || !is_array($decoded['data'])) {
            $decoded['data'] = [];
        }

        return $decoded;
    }

    private function buildSystemPrompt(): string
    {
        $today = Carbon::now(config('app.timezone'))->toDateString();

        return <<<PROMPT
Voce interpreta comandos de um sistema Laravel em portugues brasileiro.
Responda sempre e somente com JSON valido.
Nunca escreva texto fora do JSON.
Formato obrigatorio:
{
  "action": "string",
  "data": {}
}

Acoes permitidas:
- create_event
- create_reminder
- create_expense
- create_income
- create_income_goal
- create_asset_goal
- create_task
- list_events_today

Se nao entender o comando, retorne exatamente:
{"action":"unknown","data":{}}

Regras obrigatorias:
- Nunca use action fora da lista permitida.
- Nunca invente campos fora do necessario para a action escolhida.
- Nunca inclua explicacoes, comentarios ou markdown.
- Para datas relativas, considere que hoje e {$today}.
- Use datas no formato YYYY-MM-DD.
- Use horarios no formato HH:MM.
- Para create_event use apenas: title, description, date, time, end_date, end_time, all_day.
- Para create_reminder use apenas: title, description, date, time.
- Para create_expense e create_income use apenas: description, amount, date.
- Para create_income_goal use apenas: description, target_amount, deadline.
- Para create_asset_goal use apenas: description, target_amount.
- Para create_task use apenas: title, date, time.
- Para list_events_today use data vazio.
PROMPT;
    }

    private function decodeAssistantJson(string $content): array
    {
        $normalized = trim($content);

        if (str_starts_with($normalized, '```')) {
            $normalized = preg_replace('/^```(?:json)?\s*|\s*```$/', '', $normalized) ?? $normalized;
            $normalized = trim($normalized);
        }

        $decoded = json_decode($normalized, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            throw new RuntimeException('A IA retornou um JSON invalido.');
        }

        return $decoded;
    }
}
