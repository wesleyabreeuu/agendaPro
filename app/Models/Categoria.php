<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categorias';

    protected $fillable = [
        'nome',
    ];

    public function compromissos()
    {
        return $this->hasMany(Compromisso::class);
    }
}
