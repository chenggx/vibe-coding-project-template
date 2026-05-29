<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;

class OperationLog extends Model
{
    use Filterable;

    protected $fillable = ['user_id', 'username', 'method', 'path', 'action', 'ip', 'created_at'];

    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
