<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaAtividadeFisica extends Model
{
    use HasFactory;

    protected $table = 'categoria_atividade_fisica';

    protected $fillable = [
        'nome',
        'icone',
        'cor',
        'caloria_leve',
        'caloria_moderada',
        'caloria_intensa',
    ];

    protected $casts = [
        'caloria_leve' => 'decimal:2',
        'caloria_moderada' => 'decimal:2',
        'caloria_intensa' => 'decimal:2',
    ];

    public function atividades()
    {
        return $this->hasMany(AtividadeFisica::class, 'categoria_atividade_fisica_id');
    }

    public function getCalorias($intensidade = 'moderada')
    {
        return match ($intensidade) {
            'leve' => $this->caloria_leve,
            'intensa' => $this->caloria_intensa,
            default => $this->caloria_moderada,
        };
    }
}
