<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rotina extends Model
{
    use HasFactory;

    protected $table = 'rotinas';

    protected $fillable = [
        'user_id',
        'nome',
        'descricao',
        'categoria',
        'frequencia_tipo',
        'dias_semana',
        'intervalo_dias',
        'data_inicio',
        'horario',
        'dificuldade',
        'energia_recomendada',
        'modo_minimo_ativo',
        'modo_minimo_descricao',
        'cor',
        'icone',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'dias_semana' => 'array',
        'data_inicio' => 'date',
        'modo_minimo_ativo' => 'boolean',
        'ativo' => 'boolean',
        'intervalo_dias' => 'integer',
        'ordem' => 'integer',
    ];

    public function scopeOwnedBy(Builder $query, ?int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function execucoes(): HasMany
    {
        return $this->hasMany(RotinaExecucao::class, 'rotina_id');
    }
}
