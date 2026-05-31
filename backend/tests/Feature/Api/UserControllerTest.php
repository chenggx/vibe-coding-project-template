<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::find(1);
    }

    public function test_index_returns_paginated_users(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_index_search_by_name(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/users?name=Admin');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);
    }

    public function test_index_unauthenticated(): void
    {
        $response = $this->getJson('/api/users');

        $response->assertStatus(401);
    }

    public function test_store_creates_user_with_roles(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/users', [
            'name' => 'New Test User',
            'email' => 'newtest@example.com',
            'password' => '123456',
            'role_ids' => [1],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', 'New Test User');

        $this->assertDatabaseHas('user_has_roles', [
            'user_id' => $response->json('data.id'),
            'role_id' => 1,
        ]);
    }

    public function test_store_validation_error(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/users', [
            'name' => '',
        ]);

        $response->assertStatus(422);
    }

    public function test_show_returns_user(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $user = User::factory()->create();

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_show_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/users/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10004);
    }

    public function test_update_modifies_user(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $user = User::factory()->create();

        $response = $this->putJson("/api/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role_ids' => [1],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_update_admin_returns_10005(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->putJson('/api/users/1', [
            'name' => 'Hacked',
            'email' => 'admin@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10005);
    }

    public function test_destroy_deletes_user(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_destroy_admin_returns_10005(): void
    {
        $user = User::factory()->create();
        $user->roles()->sync([1]);
        Sanctum::actingAs($user, ['*']);

        $response = $this->deleteJson('/api/users/'.$this->admin->id);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10005);
    }

    public function test_destroy_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->deleteJson('/api/users/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10004);
    }

    public function test_destroy_self_returns_10010(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->deleteJson('/api/users/'.$this->admin->id);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10010);
    }
}
