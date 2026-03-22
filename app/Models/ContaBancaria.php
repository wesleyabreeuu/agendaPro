<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContaBancaria extends Model
{
    use HasFactory;

    protected $table = 'conta_bancaria';

    protected $fillable = [
        'user_id',
        'nome',
        'tipo',
        'saldo_inicial',
        'saldo_atual',
        'ativa',
    ];

    protected $casts = [
        'saldo_inicial' => 'decimal:2',
        'saldo_atual' => 'decimal:2',
    ];

    public function transacoes()
    {
        return $this->hasMany(TransacaoFinanceira::class, 'conta_bancaria_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
