<?php

declare(strict_types=1);

namespace App\Http\Requests\LoginLog;

use Illuminate\Foundation\Http\FormRequest;

class IndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'per_page' => 'integer|min:1|max:100',
            'email' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:login,failed',
            'browser' => 'nullable|string|max:50',
            'os' => 'nullable|string|max:50',
            'ip' => 'nullable|string|max:45',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date',
        ];
    }
}
