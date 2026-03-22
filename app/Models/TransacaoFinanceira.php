<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransacaoFinanceira extends Model
{
    use HasFactory;

    protected $table = 'transacao_financeira';

    protected $fillable = [
        'user_id',
        'conta_bancaria_id',
        'categoria_financeira_id',
        'tipo',
        'descricao',
        'valor',
        'data',
        'recorrente',
        'frequencia',
        'proxima_data',
        'observacoes',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data' => 'date',
        'proxima_data' => 'date',
        'recorrente' => 'boolean',
    ];

    public function categoria()
    {
        return $this->belongsTo(CategoriaFinanceira::class, 'categoria_financeira_id');
    }

    public function conta()
    {
        return $this->belongsTo(ContaBancaria::class, 'conta_bancaria_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
