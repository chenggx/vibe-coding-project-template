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
                $type = $data['type'];
                $id = $this->route('id');
                $current = Menu::find($id);

                if ($type === 'catalog') {
                    if (($data['permission'] ?? null) !== null) {
                        abort(response()->json(['code' => 10007, 'message' => '目录类型不能有权限标识', 'data' => null]));
                    }
                    if (($data['path'] ?? null) !== null) {
                        abort(response()->json(['code' => 10007, 'message' => '目录类型不能有路由路径', 'data' => null]));
                    }
                }

                if ($type === 'menu') {
                    if (empty($data['permission'])) {
                        abort(response()->json(['code' => 10007, 'message' => '菜单类型必须有权限标识', 'data' => null]));
                    }
                    if (empty($data['path'])) {
                        abort(response()->json(['code' => 10007, 'message' => '菜单类型必须有路由路径', 'data' => null]));
                    }
                }

                if ($type === 'permission') {
                    if (($data['path'] ?? null) !== null) {
                        abort(response()->json(['code' => 10007, 'message' => '权限点类型不能有路由路径', 'data' => null]));
                    }
                    if (($data['icon'] ?? null) !== null) {
                        abort(response()->json(['code' => 10007, 'message' => '权限点类型不能有图标', 'data' => null]));
                    }
                }

                if (! empty($data['parent_id'])) {
                    $parent = Menu::find($data['parent_id']);
                    if ($parent && $parent->type === 'permission') {
                        abort(response()->json(['code' => 10007, 'message' => '不能将节点挂在权限点下', 'data' => null]));
                    }
                }

                if ($current !== null) {
                    if ($current->children()->exists() && $type === 'permission') {
                        abort(response()->json(['code' => 10007, 'message' => '有子节点的菜单不能改为权限点', 'data' => null]));
                    }

                    if ($current->type === 'catalog' && $current->children()->exists() && $type !== 'catalog') {
                        abort(response()->json(['code' => 10007, 'message' => '有子节点的目录不能更改类型', 'data' => null]));
                    }
                }
            },
        ];
    }
}
