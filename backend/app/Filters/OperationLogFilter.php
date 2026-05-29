<?php

declare(strict_types=1);

namespace App\Filters;

class OperationLogFilter extends QueryFilter
{
    public function username(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('username', 'like', "%{$value}%"));
    }

    public function action(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('action', 'like', "%{$value}%"));
    }

    public function method(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('method', $value));
    }

    public function path(mixed $value): void
    {
        $this->builder->when(filled($value), fn ($query) => $query->where('path', 'like', "%{$value}%"));
    }
}
