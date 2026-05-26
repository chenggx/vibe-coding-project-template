<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Menu;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MenuControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::find(1);
    }

    public function test_index_returns_menu_tree_for_admin(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/menus');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonStructure(['code', 'message', 'data']);
    }

    public function test_index_returns_filtered_tree_for_normal_user(): void
    {
        $user = User::factory()->create();
        $role = Role::find(1);
        $user->roles()->attach($role->id);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/menus');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);
    }

    public function test_all_returns_full_tree(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/menus/all');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);
    }

    public function test_store_creates_menu(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/menus', [
            'parent_id' => 1,
            'name' => '测试菜单',
            'type' => 'menu',
            'path' => '/test',
            'icon' => 'Test',
            'permission' => 'test.view',
            'sort_order' => 1,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', '测试菜单');
    }

    public function test_store_catalog_must_not_have_permission(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/menus', [
            'name' => '错误目录',
            'type' => 'catalog',
            'permission' => 'test.view',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10007);
    }

    public function test_update_modifies_menu(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $menu = Menu::find(2);

        $response = $this->putJson("/api/menus/{$menu->id}", [
            'parent_id' => $menu->parent_id,
            'name' => 'Updated',
            'type' => 'menu',
            'path' => '/users',
            'icon' => 'User',
            'permission' => 'user.view',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', 'Updated');
    }

    public function test_destroy_deletes_leaf_menu(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $menu = Menu::find(3);

        $response = $this->deleteJson("/api/menus/{$menu->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);
    }

    public function test_destroy_menu_with_children_returns_10008(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $menu = Menu::find(1);

        $response = $this->deleteJson("/api/menus/{$menu->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 10008);
    }

    public function test_destroy_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->deleteJson('/api/menus/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10007);
    }
}
