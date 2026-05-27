<?php

declare(strict_types=1);

namespace App\Http\Requests\Menu;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'parent_id' => 'nullable|integer|exists:menus,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:catalog,menu,permission',
            'path' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'permission' => 'nullable|string|max:255|unique:menus',
            'sort_order' => 'nullable|integer',
            'meta' => 'nullable|json',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                Menu::validateMenuType($validator->validated());
            },
        ];
    }
}
