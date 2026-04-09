<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyCheckin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'data',
        'humor',
        'energia',
        'produtividade',
        'destaque',
        'gratidao',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date',
    ];

    public function scopeOwnedBy(Builder $query, ?int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
