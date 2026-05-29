<?php

declare(strict_types=1);

namespace App\Filters;

class LoginLogFilter extends QueryFilter
{
    public function email(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('email', 'like', "%{$value}%"));
    }

    public function name(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('name', 'like', "%{$value}%"));
    }

    public function type(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('type', $value));
    }

    public function browser(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('browser', 'like', "%{$value}%"));
    }

    public function os(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('os', 'like', "%{$value}%"));
    }

    public function ip(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('ip', 'like', "%{$value}%"));
    }

    public function createdFrom(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->whereDate('created_at', '>=', $value));
    }

    public function createdTo(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->whereDate('created_at', '<=', $value));
    }
}
