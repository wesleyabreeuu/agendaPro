<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KanbanBoard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nome',
        'descricao',
        'background_style',
        'listas',
        'ativo',
    ];

    protected $casts = [
        'listas' => 'array',
    ];

    public function tarefas()
    {
        return $this->hasMany(KanbanTask::class)->orderBy('ordem');
    }
}
