<?php

namespace App\Services;

use App\Models\Habito;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class HabitStreakService
{
    public function forHabit(Habito $habito): array
    {
        $dates = $habito->relationLoaded('logs')
            ? $habito->logs->pluck('data')
            : $habito->logs()->orderByDesc('data')->pluck('data');

        return $this->fromDates($dates);
    }

    public function fromDates(Collection $dates): array
    {
        $normalized = $dates
            ->map(fn ($date) => Carbon::parse($date)->toDateString())
            ->unique()
            ->sortDesc()
            ->values();

        return [
            'streak_atual' => $this->currentStreak($normalized),
            'maior_streak' => $this->highestStreak($normalized),
            'total_registros' => $normalized->count(),
        ];
    }

    private function currentStreak(Collection $dates): int
    {
        if ($dates->isEmpty()) {
            return 0;
        }

        $cursor = now()->toDateString();
        $streak = 0;

        if ($dates->first() !== $cursor) {
            $cursor = Carbon::parse($cursor)->subDay()->toDateString();
            if ($dates->first() !== $cursor) {
                return 0;
            }
        }

        foreach ($dates as $date) {
            if ($date !== $cursor) {
                break;
            }

            $streak++;
            $cursor = Carbon::parse($cursor)->subDay()->toDateString();
        }

        return $streak;
    }

    private function highestStreak(Collection $dates): int
    {
        if ($dates->isEmpty()) {
            return 0;
        }

        $sortedAsc = $dates->sort()->values();
        $highest = 0;
        $current = 0;
        $previous = null;

        foreach ($sortedAsc as $date) {
            if ($previous === null) {
                $current = 1;
                $highest = 1;
                $previous = $date;
                continue;
            }

            $expected = Carbon::parse($previous)->addDay()->toDateString();
            $current = $date === $expected ? $current + 1 : 1;
            $highest = max($highest, $current);
            $previous = $date;
        }

        return $highest;
    }
}
