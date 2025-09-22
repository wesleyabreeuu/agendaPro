<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledMessage extends Model
{
    protected $fillable = [
        'related_type','related_id','user_id','recipient','message',
        'scheduled_at','timezone','status','sent_at','provider_message_id','last_error'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function related()
    {
        return $this->morphTo();
    }
}
