<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Rotina;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'usuarios';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'telefone',
        'endereco',
        'foto_path',
        'is_admin',
        'regra_id',
        'password',
        'strava_athlete_id',
        'strava_access_token',
        'strava_refresh_token',
        'strava_token_expires_at',
        'strava_scope',
        'strava_connected_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'strava_token_expires_at' => 'datetime',
            'strava_connected_at' => 'datetime',
        ];
    }

    public function setStravaAccessTokenAttribute(?string $value): void
    {
        $this->attributes['strava_access_token'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getStravaAccessTokenAttribute(?string $value): ?string
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function setStravaRefreshTokenAttribute(?string $value): void
    {
        $this->attributes['strava_refresh_token'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getStravaRefreshTokenAttribute(?string $value): ?string
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function hasStravaConnected(): bool
    {
        return !empty($this->strava_athlete_id)
            && !empty($this->strava_access_token)
            && !empty($this->strava_refresh_token);
    }

    public function regra()
    {
        return $this->belongsTo(Regra::class, 'regra_id');
    }

    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(WebPushSubscription::class, 'user_id');
    }

    public function sharedCompromissos(): BelongsToMany
    {
        return $this->belongsToMany(Compromisso::class, 'compromisso_compartilhamentos', 'usuario_id', 'compromisso_id')
            ->withPivot('permissao')
            ->withTimestamps();
    }

    public function habitos(): HasMany
    {
        return $this->hasMany(Habito::class, 'user_id');
    }

    public function rotinas(): HasMany
    {
        return $this->hasMany(Rotina::class, 'user_id');
    }

    public function dailySessions(): HasMany
    {
        return $this->hasMany(DailySession::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function hasModuleAccess(string $module): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $regra = $this->regra;
        if (!$regra) {
            return false;
        }

        return match ($module) {
            'compromissos' => (bool) $regra->acesso_compromissos,
            'dia_a_dia' => (bool) $regra->acesso_dia_a_dia,
            'projetos' => (bool) $regra->acesso_projetos,
            'financeiro' => (bool) $regra->acesso_financeiro,
            'saude' => (bool) $regra->acesso_saude,
            default => false,
        };
    }

    public function profileImageUrl(): string
    {
        if (!empty($this->foto_path) && File::exists(public_path($this->foto_path))) {
            return asset($this->foto_path);
        }

        return asset('favicon.ico');
    }

    public function profileRoleLabel(): string
    {
        if ($this->isAdmin()) {
            return 'Administrador';
        }

        return $this->regra?->nome ? 'Plano ' . $this->regra->nome : 'Usuário';
    }
}
