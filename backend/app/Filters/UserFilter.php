<?php

declare(strict_types=1);

namespace App\Filters;

class UserFilter extends QueryFilter
{
    public function name(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('name', 'like', "%{$value}%"));
    }

    public function email(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('email', 'like', "%{$value}%"));
    }
}
