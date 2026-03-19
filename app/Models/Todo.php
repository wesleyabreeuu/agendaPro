<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Todo extends Model
{
    use HasFactory;

    protected $table = 'todos';

    protected $fillable = [
        'user_id',
        'data',
        'hora',
        'descricao',
        'urgencia',
        'status',
        'finalizado_em',
    ];

    protected $casts = [
        'data' => 'date',
        'finalizado_em' => 'datetime',
    ];

    public function scopeOwnedBy(Builder $query, ?int $userId): Builder
    {
        return $query->where(function (Builder $builder) use ($userId) {
            $builder->where('user_id', $userId)
                ->orWhereNull('user_id');
        });
    }
}
