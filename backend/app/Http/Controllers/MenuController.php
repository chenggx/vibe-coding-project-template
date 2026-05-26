<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Http\Requests\Menu\StoreRequest;
use App\Http\Requests\Menu\UpdateRequest;
use App\Services\PermissionService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $menus = $user->isSuperAdmin()
            ? Menu::all()
            : $user->menus();

        $tree = $this->buildTree($menus);
        $filtered = $this->filterVisible($tree);

        return ApiResponse::success($filtered);
    }

    public function all(Request $request)
    {
        $menus = Menu::all();

        return ApiResponse::success(Menu::toTree($menus));
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $menu = Menu::create($validated);

        app(PermissionService::class)->clearAllPermissionCache();

        return ApiResponse::success($menu, '创建成功');
    }

    public function update(UpdateRequest $request, int $id)
    {
        $menu = Menu::find($id);

        if (! $menu) {
            return ApiResponse::error(10007, '菜单不存在');
        }

        $validated = $request->validated();

        if (isset($validated['parent_id']) && $validated['parent_id'] !== null) {
            if ($validated['parent_id'] === $menu->id || $this->isDescendant($validated['parent_id'], $menu->id)) {
                return ApiResponse::error(10007, '不能将节点设置为自己的子节点');
            }
        }

        $menu->update($validated);

        app(PermissionService::class)->clearAllPermissionCache();

        return ApiResponse::success($menu, '更新成功');
    }

    public function destroy(int $id)
    {
        $menu = Menu::find($id);

        if (! $menu) {
            return ApiResponse::error(10007, '菜单不存在');
        }

        if (Menu::where('parent_id', $id)->exists()) {
            return ApiResponse::error(10008, '请先删除子节点');
        }

        $menu->delete();

        app(PermissionService::class)->clearAllPermissionCache();

        return ApiResponse::success(null, '删除成功');
    }

    private function buildTree($menus, ?int $parentId = null): array
    {
        return $menus->where('parent_id', $parentId)
            ->sortBy('sort_order')
            ->values()
            ->map(
                fn ($item) => array_merge(
                    $item->toArray(),
                    ['children' => $this->buildTree($menus, $item->id)]
                )
            )
            ->all();
    }

    private function filterVisible(array $tree): array
    {
        $result = [];

        foreach ($tree as $node) {
            if ($node['type'] === 'permission') {
                continue;
            }

            $children = $this->filterVisible($node['children'] ?? []);

            if ($node['type'] === 'catalog' && empty($children)) {
                continue;
            }

            $node['children'] = $children;
            $result[] = $node;
        }

        return $result;
    }


    private function isDescendant(int $ancestorId, int $targetId): bool
    {
        $children = Menu::where('parent_id', $targetId)->pluck('id')->toArray();

        if (in_array($ancestorId, $children, true)) {
            return true;
        }

        foreach ($children as $childId) {
            if ($this->isDescendant($ancestorId, $childId)) {
                return true;
            }
        }

        return false;
    }
}
