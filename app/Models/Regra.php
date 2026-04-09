<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Regra extends Model
{
    use HasFactory;

    protected $table = 'regras';

    protected $fillable = [
        'nome',
        'slug',
        'descricao',
        'acesso_compromissos',
        'acesso_dia_a_dia',
        'acesso_projetos',
        'acesso_financeiro',
        'acesso_saude',
    ];

    protected $casts = [
        'acesso_compromissos' => 'boolean',
        'acesso_dia_a_dia' => 'boolean',
        'acesso_projetos' => 'boolean',
        'acesso_financeiro' => 'boolean',
        'acesso_saude' => 'boolean',
    ];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'regra_id');
    }
}
