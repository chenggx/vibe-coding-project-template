<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::find(1);
    }

    public function test_index_returns_paginated_roles(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/roles');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_store_creates_role_with_menus(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/roles', [
            'name' => 'manager',
            'display_name' => '经理',
            'menu_ids' => [2, 6],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', 'manager');

        $this->assertDatabaseHas('role_has_menus', [
            'role_id' => $response->json('data.id'),
            'menu_id' => 2,
        ]);
    }

    public function test_show_returns_role(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $role = Role::find(1);

        $response = $this->getJson("/api/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.id', $role->id);
    }

    public function test_show_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/roles/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10006);
    }

    public function test_update_modifies_role(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $role = Role::find(1);

        $response = $this->putJson("/api/roles/{$role->id}", [
            'name' => $role->name,
            'display_name' => 'Updated Editor',
            'menu_ids' => [2],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.display_name', 'Updated Editor');
    }

    public function test_destroy_deletes_role(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $role = Role::create([
            'name' => 'temp',
            'display_name' => 'Temp',
        ]);

        $response = $this->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_destroy_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->deleteJson('/api/roles/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10006);
    }
}
