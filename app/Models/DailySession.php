<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailySession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'started',
    ];

    protected $casts = [
        'date' => 'date',
        'started' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
