<?php

declare(strict_types=1);

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $id = $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
            'avatar' => 'nullable|string|url',
            'status' => 'nullable|boolean',
            'expires_at' => 'nullable|date',
            'remarks' => 'nullable|string',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'integer|exists:roles,id',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge(['email' => strtolower($this->email)]);
        }
    }
}
