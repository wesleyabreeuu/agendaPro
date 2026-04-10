<?php

namespace App\Services;

use App\Models\Lembrete;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReminderDispatchService
{
    public function due(?int $userId = null, ?Carbon $now = null): Collection
    {
        $now ??= now();

        return Lembrete::with(['compromisso', 'user'])
            ->when($userId, fn ($query) => $query->where('user_id', $userId))
            ->where('ativo', true)
            ->get()
            ->filter(function (Lembrete $lembrete) use ($now) {
                $momento = $lembrete->momento_disparo;

                if (!$momento) {
                    return false;
                }

                if ($lembrete->isStandalone()) {
                    return $momento->lessThanOrEqualTo($now);
                }

                return is_null($lembrete->notificado_em)
                    && $momento->lessThanOrEqualTo($now);
            })
            ->values();
    }

    public function acknowledge(Lembrete $lembrete, ?Carbon $now = null): void
    {
        $now ??= now();

        if ($lembrete->isStandalone()) {
            $this->advanceStandaloneReminder($lembrete, $now);
            return;
        }

        $lembrete->update([
            'notificado_em' => $now,
            'ultima_execucao_em' => $now,
        ]);
    }

    public function payload(Lembrete $lembrete): array
    {
        $momento = $lembrete->momento_disparo;
        $mensagemBase = $lembrete->descricao_exibicao
            ?: 'Seu lembrete esta programado para agora.';

        return [
            'id' => $lembrete->id,
            'titulo' => $lembrete->titulo_exibicao,
            'mensagem' => $mensagemBase,
            'quando' => $momento ? $momento->format('d/m/Y H:i') : now()->format('d/m/Y H:i'),
            'url' => $lembrete->compromisso_id
                ? route('compromissos.edit', $lembrete->compromisso_id)
                : route('lembretes.edit', $lembrete->id),
            'icon' => '/icons/icon-192x192.png',
            'badge' => '/icons/icon-192x192.png',
            'tag' => 'lembrete-' . $lembrete->id,
        ];
    }

    private function advanceStandaloneReminder(Lembrete $lembrete, Carbon $now): void
    {
        $proximaExecucao = $this->calculateNextExecution($lembrete);

        $lembrete->update([
            'notificado_em' => $now,
            'ultima_execucao_em' => $now,
            'proxima_execucao_em' => $proximaExecucao,
            'ativo' => !is_null($proximaExecucao),
        ]);
    }

    private function calculateNextExecution(Lembrete $lembrete): ?Carbon
    {
        $base = $lembrete->proxima_execucao_em
            ? Carbon::parse($lembrete->proxima_execucao_em)
            : Carbon::parse($lembrete->inicio_em);

        if (!$lembrete->recorrencia) {
            return null;
        }

        $intervalo = max((int) ($lembrete->intervalo_recorrencia ?? 1), 1);
        $proxima = match ($lembrete->recorrencia) {
            'diaria' => $base->copy()->addDays($intervalo),
            'semanal' => $base->copy()->addWeeks($intervalo),
            'mensal' => $base->copy()->addMonthsNoOverflow($intervalo),
            'dias_semana' => $this->nextWeekdayOccurrence($base, $lembrete->dias_semana ?? []),
            default => null,
        };

        if (!$proxima) {
            return null;
        }

        if ($lembrete->fim_recorrencia_em && $proxima->greaterThan($lembrete->fim_recorrencia_em->copy()->endOfDay())) {
            return null;
        }

        return $proxima;
    }

    private function nextWeekdayOccurrence(Carbon $base, array $weekdays): ?Carbon
    {
        $dias = collect($weekdays)
            ->map(fn ($dia) => (int) $dia)
            ->unique()
            ->sort()
            ->values();

        if ($dias->isEmpty()) {
            return null;
        }

        $cursor = $base->copy()->addDay();
        for ($i = 0; $i < 14; $i++) {
            if ($dias->contains($cursor->dayOfWeek)) {
                return $cursor;
            }

            $cursor->addDay();
        }

        return null;
    }
}
