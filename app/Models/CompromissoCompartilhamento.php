<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompromissoCompartilhamento extends Model
{
    protected $table = 'compromisso_compartilhamentos';

    protected $fillable = [
        'compromisso_id',
        'usuario_id',
        'permissao',
    ];

    public function compromisso(): BelongsTo
    {
        return $this->belongsTo(Compromisso::class, 'compromisso_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
