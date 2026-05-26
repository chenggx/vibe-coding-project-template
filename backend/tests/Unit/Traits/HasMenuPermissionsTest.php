<?php

declare(strict_types=1);

namespace Tests\Unit\Traits;

use App\Models\Menu;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HasMenuPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_admin_has_all_permissions(): void
    {
        $admin = User::find(1);

        $this->assertTrue($admin->hasMenuPermission('users.index'));
        $this->assertTrue($admin->hasMenuPermission('menus.store'));
    }

    public function test_admin_menus_returns_all(): void
    {
        $admin = User::find(1);
        $menus = $admin->menus();

        $this->assertEquals(Menu::count(), $menus->count());
    }

    public function test_normal_user_permission_names(): void
    {
        $user = User::factory()->create();
        $role = Role::find(1);
        $user->roles()->attach($role->id);

        $permissions = $user->permissionNames();

        $this->assertContains('users.index', $permissions);
        $this->assertContains('users.store', $permissions);
    }

    public function test_normal_user_has_permission(): void
    {
        $user = User::factory()->create();
        $role = Role::find(1);
        $user->roles()->attach($role->id);

        $this->assertTrue($user->hasMenuPermission('users.index'));
        $this->assertFalse($user->hasMenuPermission('roles.index'));
    }

    public function test_normal_user_menus(): void
    {
        $user = User::factory()->create();
        $role = Role::find(1);
        $user->roles()->attach($role->id);

        $menus = $user->menus();

        $this->assertGreaterThan(0, $menus->count());
        $this->assertLessThan(Menu::count(), $menus->count());
    }
}
