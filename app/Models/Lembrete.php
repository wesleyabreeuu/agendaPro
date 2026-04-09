<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lembrete extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'compromisso_id',
        'tipo',
        'titulo',
        'descricao',
        'categoria',
        'inicio_em',
        'proxima_execucao_em',
        'recorrencia',
        'intervalo_recorrencia',
        'dias_semana',
        'fim_recorrencia_em',
        'ativo',
        'minutos_antes',
        'notificado_em',
        'ultima_execucao_em',
    ];

    protected $casts = [
        'inicio_em' => 'datetime',
        'proxima_execucao_em' => 'datetime',
        'fim_recorrencia_em' => 'date',
        'dias_semana' => 'array',
        'ativo' => 'boolean',
        'notificado_em' => 'datetime',
        'ultima_execucao_em' => 'datetime',
    ];

    public function scopeOwnedBy(Builder $query, ?int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function compromisso()
    {
        return $this->belongsTo(Compromisso::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTituloExibicaoAttribute(): string
    {
        return $this->titulo ?: ($this->compromisso->titulo ?? 'Lembrete');
    }

    public function getDescricaoExibicaoAttribute(): ?string
    {
        return $this->descricao ?: $this->compromisso->descricao;
    }

    public function getMomentoDisparoAttribute(): ?Carbon
    {
        if ($this->compromisso && $this->compromisso->data_inicio) {
            return Carbon::parse($this->compromisso->data_inicio)->subMinutes($this->minutos_antes);
        }

        return $this->proxima_execucao_em ? Carbon::parse($this->proxima_execucao_em) : null;
    }

    public function isStandalone(): bool
    {
        return empty($this->compromisso_id);
    }
}
