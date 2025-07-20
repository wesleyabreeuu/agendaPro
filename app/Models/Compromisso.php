<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compromisso extends Model
{
    protected $table = 'compromissos';

    protected $fillable = [
        'usuarios_id',
        'categoria_id',
        'titulo',
        'descricao',
        'data_inicio',
        'data_fim',
        'dia_inteiro',
        'recorrencia',
        'recorrencia_intervalo',
        'data_fim_recorrencia',
        'telefone',
    ];

    protected $casts = [
        'data_inicio' => 'datetime',
        'data_fim' => 'datetime',
        'dia_inteiro' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuarios_id');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function lembretes()
    {
        return $this->hasMany(Lembrete::class);
    }
}
