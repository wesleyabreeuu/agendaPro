<?php

namespace App\Policies;

use App\Models\Habito;
use App\Models\User;

class HabitoPolicy
{
    public function view(User $user, Habito $habito): bool
    {
        return $habito->user_id === $user->id;
    }

    public function update(User $user, Habito $habito): bool
    {
        return $habito->user_id === $user->id;
    }

    public function delete(User $user, Habito $habito): bool
    {
        return $habito->user_id === $user->id;
    }

    public function markComplete(User $user, Habito $habito): bool
    {
        return $habito->user_id === $user->id;
    }
}
