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

        $parentIds = $menus->pluck('parent_id')->filter()->unique()->toArray();
        while (! empty($parentIds)) {
            $parentMenus = Menu::whereIn('id', $parentIds)->get();
            $menus = $menus->merge($parentMenus);
            $parentIds = $parentMenus->pluck('parent_id')->filter()->unique()->toArray();
        }

        return $menus->unique('id')->values();
    }
}
