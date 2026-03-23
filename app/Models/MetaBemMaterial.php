<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetaBemMaterial extends Model
{
    use HasFactory;

    protected $table = 'metas_bem_material';

    protected $fillable = [
        'user_id',
        'nome_bem',
        'descricao',
        'valor_bem',
        'valor_ja_guardado',
        'valor_guardar_mes',
    ];

    protected $casts = [
        'valor_bem' => 'decimal:2',
        'valor_ja_guardado' => 'decimal:2',
        'valor_guardar_mes' => 'decimal:2',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
