<?php

namespace App\Policies;

use App\Models\Compromisso;
use App\Models\User;

class CompromissoPolicy
{
    public function view(User $user, Compromisso $compromisso): bool
    {
        if ($compromisso->isOwnedBy($user)) {
            return true;
        }

        return in_array($compromisso->sharedPermissionFor($user), ['visualizar', 'editar'], true);
    }

    public function update(User $user, Compromisso $compromisso): bool
    {
        if ($compromisso->isOwnedBy($user)) {
            return true;
        }

        return $compromisso->sharedPermissionFor($user) === 'editar';
    }

    public function delete(User $user, Compromisso $compromisso): bool
    {
        return $compromisso->isOwnedBy($user);
    }

    public function share(User $user, Compromisso $compromisso): bool
    {
        return $compromisso->isOwnedBy($user);
    }
}
