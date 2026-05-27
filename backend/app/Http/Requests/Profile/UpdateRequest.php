<?php

declare(strict_types=1);

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|url',
            'password' => 'nullable|string|min:6',
            'current_password' => 'required_with:password|string',
        ];
    }
}
