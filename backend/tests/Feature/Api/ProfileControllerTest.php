<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_update_profile_name_and_avatar(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => '新名字',
            'avatar' => 'https://example.com/avatar.jpg',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', '新名字')
            ->assertJsonPath('data.avatar', 'https://example.com/avatar.jpg');

        $this->assertDatabaseHas('users', [
            'id' => 1,
            'name' => '新名字',
            'avatar' => 'https://example.com/avatar.jpg',
        ]);
    }

    public function test_update_password_with_correct_current_password(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => 'admin',
            'current_password' => 'password',
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_update_password_with_wrong_current_password(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => 'admin',
            'current_password' => 'wrongpassword',
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10009);
    }

    public function test_update_password_without_current_password(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'name' => 'admin',
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(422);
    }

    public function test_update_profile_validation_error(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/profile', [
            'password' => '123',
        ]);

        $response->assertStatus(422);
    }

    public function test_update_profile_unauthenticated(): void
    {
        $response = $this->putJson('/api/profile', [
            'name' => 'test',
        ]);

        $response->assertStatus(401);
    }
}
