<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Goal extends Model
{
    use HasFactory;

    public const STATUSES = ['planejamento', 'em_andamento', 'concluido', 'cancelado', 'pausado'];
    public const GOAL_TYPES = ['peso', 'distancia', 'financeiro', 'estudo', 'personalizado'];

    protected $fillable = [
        'user_id',
        'titulo',
        'descricao',
        'categoria',
        'data_inicio',
        'data_meta',
        'status',
        'cor',
        'icone',
        'peso_inicial',
        'peso_meta',
        'distancia_meta',
        'valor_meta',
        'tipo_meta',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_meta' => 'date',
        'peso_inicial' => 'decimal:2',
        'peso_meta' => 'decimal:2',
        'distancia_meta' => 'decimal:2',
        'valor_meta' => 'decimal:2',
    ];

    public function scopeOwnedBy(Builder $query, ?int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(GoalMilestone::class, 'goal_id')->orderBy('ordem');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(GoalProgress::class, 'goal_id')->orderByDesc('data')->orderByDesc('id');
    }

    public function rotinas(): BelongsToMany
    {
        return $this->belongsToMany(Rotina::class, 'goal_rotina', 'goal_id', 'rotina_id')->withTimestamps();
    }
}
