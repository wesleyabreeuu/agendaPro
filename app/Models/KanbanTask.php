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
        'urgencia',
        'status',
        'data_limite',
        'ordem',
        'finalizado_em',
    ];

    protected $casts = [
        'data_limite' => 'date',
        'finalizado_em' => 'datetime',
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
}
