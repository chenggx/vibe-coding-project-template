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

        return Menu::whereIn('id', $menuIds)->get();
    }
}
