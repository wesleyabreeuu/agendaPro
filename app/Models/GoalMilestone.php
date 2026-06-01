<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoalMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'titulo',
        'descricao',
        'ordem',
        'meta_valor',
        'concluido',
        'concluido_em',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'meta_valor' => 'decimal:2',
        'concluido' => 'boolean',
        'concluido_em' => 'datetime',
    ];

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class, 'goal_id');
    }
}
