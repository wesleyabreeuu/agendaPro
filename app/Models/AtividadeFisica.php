<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AtividadeFisica extends Model
{
    use HasFactory;

    protected $table = 'atividade_fisica';

    protected $fillable = [
        'user_id',
        'categoria_atividade_fisica_id',
        'descricao',
        'data',
        'hora_inicio',
        'duracao_minutos',
        'intensidade',
        'calorias_queimadas',
        'notas',
        'fonte',
        'fonte_id',
        'sincronizado_em',
    ];

    protected $casts = [
        'data' => 'date',
        'duracao_minutos' => 'integer',
        'calorias_queimadas' => 'integer',
        'sincronizado_em' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $atividade) {
            if (!$atividade->calorias_queimadas && $atividade->categoria) {
                $calorias_por_minuto = $atividade->categoria->getCalorias($atividade->intensidade);
                $atividade->calorias_queimadas = (int) ($atividade->duracao_minutos * $calorias_por_minuto);
            }
        });

        static::updating(function (self $atividade) {
            if ($atividade->isDirty(['duracao_minutos', 'intensidade', 'categoria_atividade_fisica_id'])) {
                if ($atividade->categoria) {
                    $calorias_por_minuto = $atividade->categoria->getCalorias($atividade->intensidade);
                    $atividade->calorias_queimadas = (int) ($atividade->duracao_minutos * $calorias_por_minuto);
                }
            }
        });
    }

    public function categoria()
    {
        return $this->belongsTo(CategoriaAtividadeFisica::class, 'categoria_atividade_fisica_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
