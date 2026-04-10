<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Compromisso extends Model
{
    protected $table = 'compromissos';

    protected $fillable = [
        'usuarios_id',
        'categoria_id',
        'titulo',
        'descricao',
        'data_inicio',
        'data_fim',
        'dia_inteiro',
        'recorrencia',
        'recorrencia_intervalo',
        'data_fim_recorrencia',
        'telefone',
    ];

    protected $casts = [
        'data_inicio' => 'datetime',
        'data_fim' => 'datetime',
        'dia_inteiro' => 'boolean',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuarios_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuarios_id');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function lembretes(): HasMany
    {
        return $this->hasMany(Lembrete::class);
    }

    public function compartilhamentos(): HasMany
    {
        return $this->hasMany(CompromissoCompartilhamento::class, 'compromisso_id');
    }

    public function usuariosCompartilhados(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'compromisso_compartilhamentos', 'compromisso_id', 'usuario_id')
            ->withPivot('permissao')
            ->withTimestamps();
    }

    public function isOwnedBy(?User $user): bool
    {
        return $user && (int) $this->usuarios_id === (int) $user->id;
    }

    public function sharedPermissionFor(?User $user): ?string
    {
        if (!$user) {
            return null;
        }

        return $this->compartilhamentos
            ->firstWhere('usuario_id', $user->id)
            ?->permissao;
    }
}
