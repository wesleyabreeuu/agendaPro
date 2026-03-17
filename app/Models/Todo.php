<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    use HasFactory;

    protected $table = 'todos';

    protected $fillable = [
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
}
