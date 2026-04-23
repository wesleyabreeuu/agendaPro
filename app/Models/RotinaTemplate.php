<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RotinaTemplate extends Model
{
    use HasFactory;

    protected $table = 'rotina_templates';

    protected $fillable = [
        'nome',
        'descricao',
        'categoria',
        'rotinas',
        'ativo',
    ];

    protected $casts = [
        'rotinas' => 'array',
        'ativo' => 'boolean',
    ];
}
