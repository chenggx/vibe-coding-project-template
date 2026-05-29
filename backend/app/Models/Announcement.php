<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use Filterable, HasFactory;

    protected $fillable = [
        'title',
        'content',
        'status',
        'pinned',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'pinned' => 'boolean',
        ];
    }

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }
}
