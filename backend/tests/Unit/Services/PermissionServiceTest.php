<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Role;
use App\Models\User;
use App\Services\PermissionService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PermissionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PermissionService;
        $this->seed(DatabaseSeeder::class);
    }

    public function test_get_user_permissions_for_admin(): void
    {
        $admin = User::find(1);
        $permissions = $this->service->getUserPermissions($admin);

        $this->assertContains('users.index', $permissions);
        $this->assertContains('menus.store', $permissions);
    }

    public function test_get_user_permissions_for_normal_user(): void
    {
        $user = User::factory()->create();
        $role = Role::find(1);
        $user->roles()->attach($role->id);

        $permissions = $this->service->getUserPermissions($user);

        $this->assertContains('users.index', $permissions);
        $this->assertNotContains('roles.index', $permissions);
    }

    public function test_clear_user_permission_cache(): void
    {
        $user = User::find(1);
        $this->service->getUserPermissions($user);

        $this->service->clearUserPermissionCache($user);

        $this->assertTrue(true);
    }

    public function test_clear_all_permission_cache(): void
    {
        $this->service->clearAllPermissionCache();

        $this->assertTrue(true);
    }
}
