<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lembrete extends Model
{
    use HasFactory;

    protected $fillable = [
        'compromisso_id',
        'minutos_antes',
    ];

    public function compromisso()
    {
        return $this->belongsTo(Compromisso::class);
    }
}
