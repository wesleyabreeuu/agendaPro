<?php

namespace Database\Seeders;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GoalSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
            ]
        );

        $goal = Goal::firstOrCreate(
            [
                'user_id' => $user->id,
                'titulo' => 'Pedal Valença → Aparecida',
            ],
            [
                'descricao' => 'Realizar um pedal de aproximadamente 250 km em dezembro.',
                'categoria' => 'Esportes',
                'data_inicio' => '2026-07-01',
                'data_meta' => '2026-12-20',
                'status' => 'planejamento',
                'cor' => '#2563eb',
                'icone' => '🚲',
                'peso_inicial' => 110,
                'peso_meta' => 95,
                'distancia_meta' => 250,
                'valor_meta' => 250,
                'tipo_meta' => 'distancia',
            ]
        );

        if ($goal->milestones()->count() === 0) {
            foreach ([50, 80, 100, 150, 200, 250] as $index => $distance) {
                $goal->milestones()->create([
                    'titulo' => "{$distance} km",
                    'descricao' => $distance === 250 ? 'Chegar em Aparecida' : "Pedalar {$distance} km",
                    'ordem' => $index + 1,
                    'meta_valor' => $distance,
                ]);
            }
        }
    }
}
