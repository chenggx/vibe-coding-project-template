<?php

declare(strict_types=1);

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

abstract class QueryFilter
{
    protected Builder $builder;

    public function __construct(protected Request $request) {}

    public function apply(Builder $builder): Builder
    {
        $this->builder = $builder;

        foreach ($this->filters() as $name => $value) {
            $method = Str::camel($name);

            if ($method === 'apply' || ! method_exists($this, $method)) {
                continue;
            }

            $this->{$method}($value);
        }

        return $this->builder;
    }

    public function filters(): array
    {
        return $this->request->all();
    }
}
