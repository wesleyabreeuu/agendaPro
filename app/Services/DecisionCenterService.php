<?php

namespace App\Services;

use App\Models\AtividadeFisica;
use App\Models\MetaEconomia;
use App\Models\Todo;
use App\Models\TransacaoFinanceira;
use App\Models\User;

class DecisionCenterService
{
    public function analyze(User $user, array $context): array
    {
        $items = collect();

        $tarefasAtrasadas = Todo::ownedBy($user->id)
            ->whereDate('data', '<', today())
            ->where('status', '!=', 'finalizado')
            ->count();

        if ($tarefasAtrasadas > 0) {
            $items->push([
                'tipo' => 'tarefas_atrasadas',
                'titulo' => "{$tarefasAtrasadas} tarefa" . ($tarefasAtrasadas === 1 ? ' atrasada' : 's atrasadas'),
                'descricao' => 'Resolva ou reprograme antes de assumir novos compromissos.',
                'severidade' => 'alta',
            ]);
        }

        if ($user->hasModuleAccess('financeiro')) {
            $contasVencendo = TransacaoFinanceira::query()
                ->where('user_id', $user->id)
                ->where('tipo', 'despesa')
                ->whereBetween('data', [today(), today()->copy()->addDays(3)])
                ->where(function ($query) {
                    $query->whereNull('status')->orWhere('status', 'pendente');
                })
                ->count();

            if ($contasVencendo > 0) {
                $items->push([
                    'tipo' => 'contas_vencendo',
                    'titulo' => "{$contasVencendo} conta" . ($contasVencendo === 1 ? ' vencendo' : 's vencendo'),
                    'descricao' => 'Confira caixa, vencimentos e prioridades de pagamento.',
                    'severidade' => 'media',
                ]);
            }

            $metasAbaixo = MetaEconomia::query()
                ->where('user_id', $user->id)
                ->whereDate('prazo_final', '>=', today())
                ->get()
                ->filter(fn (MetaEconomia $meta) => (float) $meta->valor_alvo > 0 && ((float) $meta->valor_atual / (float) $meta->valor_alvo) < 0.35)
                ->count();

            if ($metasAbaixo > 0) {
                $items->push([
                    'tipo' => 'meta_financeira_baixa',
                    'titulo' => 'Meta financeira abaixo do esperado',
                    'descricao' => 'Uma ação comercial ou economia planejada pode recuperar o ritmo.',
                    'severidade' => 'media',
                ]);
            }
        }

        if ($user->hasModuleAccess('saude')) {
            $ultimaAtividade = AtividadeFisica::query()
                ->where('user_id', $user->id)
                ->orderByDesc('data')
                ->first();

            $diasSemAtividade = $ultimaAtividade?->data ? $ultimaAtividade->data->diffInDays(today()) : 999;

            if ($diasSemAtividade >= 4) {
                $items->push([
                    'tipo' => 'saude_negligenciada',
                    'titulo' => $diasSemAtividade >= 900 ? 'Sem atividade física registrada' : "Sem atividade física há {$diasSemAtividade} dias",
                    'descricao' => 'Reserve um bloco leve hoje para proteger energia e constância.',
                    'severidade' => 'media',
                ]);
            }
        }

        foreach (($context['objetivos_em_risco'] ?? []) as $goal) {
            $items->push([
                'tipo' => 'objetivo_em_risco',
                'titulo' => "Objetivo em risco: {$goal['titulo']}",
                'descricao' => "Próxima ação: {$goal['proxima_acao']}",
                'severidade' => 'alta',
            ]);
        }

        return $items->sortBy(fn (array $item) => $item['severidade'] === 'alta' ? 0 : 1)->values()->all();
    }
}
