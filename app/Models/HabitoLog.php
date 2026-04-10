<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HabitoLog extends Model
{
    use HasFactory;

    protected $table = 'habito_logs';

    protected $fillable = [
        'habito_id',
        'data',
        'concluido_em',
    ];

    protected $casts = [
        'data' => 'date',
        'concluido_em' => 'datetime',
    ];

    public function habito(): BelongsTo
    {
        return $this->belongsTo(Habito::class, 'habito_id');
    }
}
