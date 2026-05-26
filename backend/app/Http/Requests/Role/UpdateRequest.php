<?php

declare(strict_types=1);

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => 'required|string|max:255|unique:roles,name,'.$id,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'menu_ids' => 'nullable|array',
            'menu_ids.*' => 'integer|exists:menus,id',
        ];
    }
}
