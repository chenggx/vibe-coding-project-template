<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use Filterable;
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'name',
        'type',
        'ip',
        'user_agent',
        'browser',
        'os',
        'message',
        'created_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
