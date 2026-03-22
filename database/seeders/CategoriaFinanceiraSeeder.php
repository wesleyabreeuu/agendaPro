<?php

namespace Database\Seeders;

use App\Models\CategoriaFinanceira;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategoriaFinanceiraSeeder extends Seeder
{
    public function run(): void
    {
        $receitas = [
            ['nome' => 'Salário', 'icone' => 'fas fa-briefcase', 'cor' => '#27ae60'],
            ['nome' => 'Freelance', 'icone' => 'fas fa-laptop', 'cor' => '#2980b9'],
            ['nome' => 'Investimento', 'icone' => 'fas fa-chart-line', 'cor' => '#8e44ad'],
            ['nome' => 'Bônus', 'icone' => 'fas fa-gift', 'cor' => '#e74c3c'],
            ['nome' => 'Outros', 'icone' => 'fas fa-plus-circle', 'cor' => '#95a5a6'],
        ];

        $despesas = [
            ['nome' => 'Alimentação', 'icone' => 'fas fa-utensils', 'cor' => '#e67e22'],
            ['nome' => 'Transporte', 'icone' => 'fas fa-car', 'cor' => '#3498db'],
            ['nome' => 'Moradia', 'icone' => 'fas fa-home', 'cor' => '#c0392b'],
            ['nome' => 'Saúde', 'icone' => 'fas fa-heartbeat', 'cor' => '#e74c3c'],
            ['nome' => 'Educação', 'icone' => 'fas fa-graduation-cap', 'cor' => '#9b59b6'],
            ['nome' => 'Entretenimento', 'icone' => 'fas fa-film', 'cor' => '#1abc9c'],
            ['nome' => 'Utilidades', 'icone' => 'fas fa-lightbulb', 'cor' => '#f39c12'],
            ['nome' => 'Compras', 'icone' => 'fas fa-shopping-cart', 'cor' => '#16a34a'],
            ['nome' => 'Assinaturas', 'icone' => 'fas fa-star', 'cor' => '#2ecc71'],
            ['nome' => 'Outros', 'icone' => 'fas fa-minus-circle', 'cor' => '#95a5a6'],
        ];

        $usuarios = User::query()->get();

        foreach ($usuarios as $usuario) {
            foreach ($receitas as $cat) {
                CategoriaFinanceira::updateOrCreate(
                    [
                        'user_id' => $usuario->id,
                        'nome' => $cat['nome'],
                        'tipo' => 'receita',
                    ],
                    array_merge($cat, [
                        'user_id' => $usuario->id,
                        'tipo' => 'receita',
                    ])
                );
            }

            foreach ($despesas as $cat) {
                CategoriaFinanceira::updateOrCreate(
                    [
                        'user_id' => $usuario->id,
                        'nome' => $cat['nome'],
                        'tipo' => 'despesa',
                    ],
                    array_merge($cat, [
                        'user_id' => $usuario->id,
                        'tipo' => 'despesa',
                    ])
                );
            }
        }
    }
}
