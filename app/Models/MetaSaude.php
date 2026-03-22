<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetaSaude extends Model
{
    use HasFactory;

    protected $table = 'meta_saude';

    protected $fillable = [
        'user_id',
        'titulo',
        'tipo',
        'valor_alvo',
        'periodo',
        'ativa',
        'data_inicio',
        'data_fim',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'ativa' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
