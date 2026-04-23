<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RotinaExecucao extends Model
{
    use HasFactory;

    protected $table = 'rotina_execucoes';

    protected $fillable = [
        'rotina_id',
        'user_id',
        'data',
        'status',
        'modo_usado',
        'observacao',
    ];

    protected $casts = [
        'data' => 'date',
    ];

    public function rotina(): BelongsTo
    {
        return $this->belongsTo(Rotina::class, 'rotina_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
