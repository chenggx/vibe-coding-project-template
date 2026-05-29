<?php

declare(strict_types=1);

namespace App\Http\Requests\OperationLog;

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
            'username' => 'nullable|string|max:255',
            'action' => 'nullable|string|max:255',
            'method' => 'nullable|string|in:POST,PUT,DELETE',
            'path' => 'nullable|string|max:255',
        ];
    }
}
