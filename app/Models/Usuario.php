<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

class Usuario extends Model
{
    protected $table = 'usuarios';

    protected $fillable = [
        'name',
        'email',
        'telefone',
        'endereco',
        'foto_path',
        'is_admin',
        'regra_id',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
    ];

    public function regra()
    {
        return $this->belongsTo(Regra::class, 'regra_id');
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
        if ((bool) $this->is_admin) {
            return 'Administrador';
        }

        return $this->regra?->nome ? 'Plano ' . $this->regra->nome : 'Usuário';
    }
}
