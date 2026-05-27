<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Menu;
use App\Models\User;

class PermissionService
{
    private function getCacheVersion(): int
    {
        return cache()->rememberForever('permission_cache_version', fn () => 1);
    }

    private function getCacheKey(User $user): string
    {
        $version = $this->getCacheVersion();

        return "user_permissions:{$user->id}:v{$version}";
    }

    public function getUserPermissions(User $user): array
    {
        if ($user->isSuperAdmin()) {
            return Menu::pluck('permission')->filter()->all();
        }

        return cache()->remember(
            $this->getCacheKey($user),
            3600,
            fn () => $user->roles()->with('menus')->get()
                ->pluck('menus.*.permission')
                ->flatten()
                ->unique()
                ->filter()
                ->values()
                ->all()
        );
    }

    public function clearUserPermissionCache(User $user): void
    {
        cache()->forget($this->getCacheKey($user));
    }

    public function clearAllPermissionCache(): void
    {
        cache()->forever('permission_cache_version', $this->getCacheVersion() + 1);
    }
}
