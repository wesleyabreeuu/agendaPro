<?php

namespace App\Services;

use App\Models\Rotina;
use App\Models\RotinaExecucao;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class RotinaPlannerService
{
    private const WEEKDAY_KEYS = [
        CarbonInterface::SUNDAY => 'dom',
        CarbonInterface::MONDAY => 'seg',
        CarbonInterface::TUESDAY => 'ter',
        CarbonInterface::WEDNESDAY => 'qua',
        CarbonInterface::THURSDAY => 'qui',
        CarbonInterface::FRIDAY => 'sex',
        CarbonInterface::SATURDAY => 'sab',
    ];

    public function shouldAppearOnDate(Rotina $rotina, CarbonInterface $date): bool
    {
        if (!$rotina->ativo) {
            return false;
        }

        $referenceDate = $this->referenceDate($rotina);
        $date = Carbon::instance($date instanceof Carbon ? $date : $date->toDateTime())->startOfDay();

        if ($date->lt($referenceDate)) {
            return false;
        }

        return match ($rotina->frequencia_tipo) {
            'diaria' => true,
            'dias_semana' => in_array($this->weekdayKey($date), $rotina->dias_semana ?? [], true),
            'intervalo' => $this->matchesInterval($referenceDate, $date, max((int) $rotina->intervalo_dias, 1)),
            default => false,
        };
    }

    public function weekdayKey(CarbonInterface $date): string
    {
        return self::WEEKDAY_KEYS[$date->dayOfWeek] ?? 'seg';
    }

    public function executionForDate(Rotina $rotina, CarbonInterface $date): ?RotinaExecucao
    {
        $dateString = $date->toDateString();

        if ($rotina->relationLoaded('execucoes')) {
            return $rotina->execucoes->first(fn (RotinaExecucao $execucao) => $execucao->data?->toDateString() === $dateString);
        }

        return $rotina->execucoes()->whereDate('data', $dateString)->first();
    }

    public function recordExecution(
        Rotina $rotina,
        int $userId,
        CarbonInterface $date,
        string $status,
        string $modoUsado = 'normal',
        ?string $observacao = null
    ): ?RotinaExecucao {
        if ($status === 'pendente') {
            RotinaExecucao::query()
                ->where('rotina_id', $rotina->id)
                ->where('user_id', $userId)
                ->whereDate('data', $date->toDateString())
                ->delete();

            return null;
        }

        $execucao = RotinaExecucao::firstOrNew([
            'rotina_id' => $rotina->id,
            'user_id' => $userId,
            'data' => $date->toDateString(),
        ]);

        $execucao->status = $status;
        $execucao->modo_usado = $status === 'concluida' ? $modoUsado : 'normal';
        $execucao->observacao = $observacao ?: null;
        $execucao->save();

        return $execucao;
    }

    public function completionRate(int $plannedCount, int $completedCount): float
    {
        if ($plannedCount <= 0) {
            return 0.0;
        }

        return round(($completedCount / $plannedCount) * 100, 1);
    }

    private function referenceDate(Rotina $rotina): Carbon
    {
        if ($rotina->data_inicio) {
            return $rotina->data_inicio->copy()->startOfDay();
        }

        return Carbon::parse($rotina->created_at)->startOfDay();
    }

    private function matchesInterval(Carbon $referenceDate, Carbon $date, int $intervalDays): bool
    {
        return $referenceDate->diffInDays($date) % $intervalDays === 0;
    }
}
