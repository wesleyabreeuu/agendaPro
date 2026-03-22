<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaFinanceira extends Model
{
    use HasFactory;

    protected $table = 'categoria_financeira';

    protected $fillable = [
        'user_id',
        'tipo',
        'nome',
        'icone',
        'cor',
    ];

    public function transacoes()
    {
        return $this->hasMany(TransacaoFinanceira::class, 'categoria_financeira_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
