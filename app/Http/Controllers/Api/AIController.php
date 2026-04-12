<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AICommandRequest;
use App\Models\User;
use App\Services\AI\AIActionExecutor;
use App\Services\AI\AICommandInterpreter;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class AIController extends Controller
{
    public function __construct(
        private readonly AICommandInterpreter $interpreter,
        private readonly AIActionExecutor $executor,
    ) {
    }

    public function handle(AICommandRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $command = $request->validated('command');

        try {
            $aiResponse = $this->interpreter->interpret($command);
            $action = $aiResponse['action'] ?? 'unknown';
            $data = $aiResponse['data'] ?? [];

            if ($action === 'unknown') {
                return response()->json([
                    'message' => 'Nao entendi o comando. Pode reformular?',
                    'action' => 'unknown',
                    'data' => new \stdClass(),
                ]);
            }

            if (!$this->executor->isAllowedAction($action)) {
                return response()->json([
                    'message' => 'A IA retornou uma acao invalida. Nenhuma operacao foi executada.',
                    'action' => $action,
                    'data' => new \stdClass(),
                ], 422);
            }

            $validatedData = $this->executor->validate($action, is_array($data) ? $data : []);
            $result = DB::transaction(fn () => $this->executor->execute($action, $validatedData, $user));

            return response()->json([
                'message' => 'Acao executada com sucesso',
                'action' => $action,
                'data' => $result,
            ]);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Os dados interpretados pela IA nao passaram na validacao.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        } catch (RequestException $exception) {
            Log::error('Falha ao consultar OpenAI para comandos de IA.', [
                'status' => $exception->response?->status(),
                'body' => $exception->response?->body(),
            ]);

            return response()->json([
                'message' => 'Nao foi possivel consultar o assistente agora. Tente novamente em instantes.',
            ], 502);
        } catch (RuntimeException $exception) {
            Log::warning('Falha ao processar comando de IA.', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        } catch (Throwable $exception) {
            Log::error('Erro inesperado no endpoint de comandos de IA.', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Ocorreu um erro ao processar o comando.',
            ], 500);
        }
    }
}
