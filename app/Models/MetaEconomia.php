<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetaEconomia extends Model
{
    use HasFactory;

    protected $table = 'metas_economia';

    protected $fillable = [
        'user_id',
        'titulo',
        'descricao',
        'valor_alvo',
        'valor_atual',
        'periodicidade',
        'prazo_final',
        'meses_planejados',
    ];

    protected $casts = [
        'valor_alvo' => 'decimal:2',
        'valor_atual' => 'decimal:2',
        'prazo_final' => 'date',
        'meses_planejados' => 'integer',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
