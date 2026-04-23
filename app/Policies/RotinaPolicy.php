<?php

namespace App\Policies;

use App\Models\Rotina;
use App\Models\User;

class RotinaPolicy
{
    public function view(User $user, Rotina $rotina): bool
    {
        return $rotina->user_id === $user->id;
    }

    public function update(User $user, Rotina $rotina): bool
    {
        return $rotina->user_id === $user->id;
    }

    public function delete(User $user, Rotina $rotina): bool
    {
        return $rotina->user_id === $user->id;
    }

    public function execute(User $user, Rotina $rotina): bool
    {
        return $rotina->user_id === $user->id;
    }
}
