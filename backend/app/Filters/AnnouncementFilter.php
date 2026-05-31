<?php

declare(strict_types=1);

namespace App\Filters;

class AnnouncementFilter extends QueryFilter
{
    public function title(mixed $value): void
    {
        $this->builder->when(filled($value), function ($query) use ($value) {
            $escaped = addcslashes((string) $value, '%_\\');

            return $query->whereRaw("title LIKE ? ESCAPE '\\'", ["%{$escaped}%"]);
        });
    }

    public function status(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('status', $value));
    }
}
