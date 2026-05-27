<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Menu;
use App\Models\Role;
use App\Services\PermissionService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasMenuPermissions
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_has_roles');
    }

    public function permissionNames(): array
    {
        if ($this->isSuperAdmin()) {
            return Menu::pluck('permission')->filter()->all();
        }

        return app(PermissionService::class)->getUserPermissions($this);
    }

    public function hasMenuPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return in_array($permission, $this->permissionNames(), true);
    }

    public function menus(): Collection
    {
        if ($this->isSuperAdmin()) {
            return Menu::all();
        }

        $menuIds = $this->roles()->with('menus')->get()
            ->pluck('menus.*.id')
            ->flatten()
            ->unique()
            ->toArray();

        $menus = Menu::whereIn('id', $menuIds)->get();

        // 一次性加载全量菜单，在内存中上溯父级，避免 N+1 查询
        $allMenus = Menu::all()->keyBy('id');
        $parentIds = $menus->pluck('parent_id')->filter()->unique()->toArray();
        $visited = [];

        while (! empty($parentIds)) {
            // 循环引用保护：跳过已访问过的节点
            $parentIds = array_values(array_diff($parentIds, $visited));
            if (empty($parentIds)) {
                break;
            }

            $visited = array_merge($visited, $parentIds);
            $parentMenus = collect($parentIds)
                ->map(fn ($id) => $allMenus->get($id))
                ->filter()
                ->values();

            $menus = $menus->merge($parentMenus);
            $parentIds = $parentMenus->pluck('parent_id')->filter()->unique()->toArray();
        }

        return $menus->unique('id')->values();
    }
}
