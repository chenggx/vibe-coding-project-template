<?php

declare(strict_types=1);

namespace App\Filters;

class AnnouncementFilter extends QueryFilter
{
    public function title(mixed $value): void
    {
        $this->builder->when(filled($value), function ($query) use ($value) {
            $escaped = addcslashes((string) $value, '%_');

            return $query->where('title', 'like', "%{$escaped}%");
        });
    }

    public function status(mixed $value): void
    {
        if (is_string($value)) {
            $value = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        if (is_bool($value) || is_int($value)) {
            $this->builder->where('status', (bool) $value);
        }
    }
}
