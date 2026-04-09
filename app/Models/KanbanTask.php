<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KanbanTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'kanban_board_id',
        'titulo',
        'descricao',
        'observacoes',
        'urgencia',
        'status',
        'list_key',
        'data_limite',
        'ordem',
        'finalizado_em',
        'etiquetas',
        'checklist',
        'campos_personalizados',
        'anexos',
    ];

    protected $casts = [
        'data_limite' => 'date',
        'finalizado_em' => 'datetime',
        'etiquetas' => 'array',
        'checklist' => 'array',
        'campos_personalizados' => 'array',
        'anexos' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $task) {
            if ($task->status !== 'finalizado' && $task->data_limite && Carbon::parse($task->data_limite)->isPast()) {
                $task->status = 'atrasado';
            }

            if ($task->status === 'finalizado' && !$task->finalizado_em) {
                $task->finalizado_em = now();
            }

            if ($task->status !== 'finalizado') {
                $task->finalizado_em = null;
            }
        });
    }

    public function quadro()
    {
        return $this->belongsTo(KanbanBoard::class, 'kanban_board_id');
    }

    public function getChecklistResumoAttribute(): array
    {
        $itens = collect($this->checklist ?? []);

        $total = $itens->count();
        $concluidos = $itens->where('done', true)->count();

        return [
            'total' => $total,
            'concluidos' => $concluidos,
            'percentual' => $total > 0 ? (int) round(($concluidos / $total) * 100) : 0,
        ];
    }
}
