<?php

declare(strict_types=1);

namespace App\Http\Requests\Menu;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'parent_id' => 'nullable|integer|exists:menus,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:catalog,menu,permission',
            'path' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'permission' => 'nullable|string|max:255|unique:menus,permission,'.$id,
            'sort_order' => 'nullable|integer',
            'meta' => 'nullable|json',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $data = $validator->validated();
                $id = $this->route('id');
                $current = Menu::find($id);

                Menu::validateMenuType($data);

                if ($current !== null) {
                    if ($current->children()->exists() && $data['type'] === 'permission') {
                        abort(response()->json(['code' => 10007, 'message' => '有子节点的菜单不能改为权限点', 'data' => null]));
                    }

                    if ($current->type === 'catalog' && $current->children()->exists() && $data['type'] !== 'catalog') {
                        abort(response()->json(['code' => 10007, 'message' => '有子节点的目录不能更改类型', 'data' => null]));
                    }
                }
            },
        ];
    }
}
