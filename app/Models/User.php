<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;

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
}
