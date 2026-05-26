<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_login_success(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.user.id', 1)
            ->assertJsonPath('data.token', fn ($token) => is_string($token) && $token !== '');
    }

    public function test_login_token_can_access_protected_routes(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        $response = $this->withToken($token)->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.id', 1);
    }

    public function test_login_with_wrong_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10001);
    }

    public function test_login_with_disabled_user(): void
    {
        $user = User::factory()->create([
            'email' => 'disabled@example.com',
            'password' => Hash::make('password'),
            'status' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10002);
    }

    public function test_login_with_expired_user(): void
    {
        $user = User::factory()->create([
            'email' => 'expired@example.com',
            'password' => Hash::make('password'),
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10002);
    }

    public function test_login_validation_error(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422);
    }

    public function test_me_success(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.id', 1)
            ->assertJsonPath('data.menus', fn ($menus) => count($menus) > 0);
    }

    public function test_me_unauthenticated(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_me_with_revoked_token(): void
    {
        $user = User::find(1);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/user')->assertStatus(200);

        $user->tokens()->delete();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertStatus(401);
    }

    public function test_logout_success(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);
    }

    public function test_logout_unauthenticated(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    public function test_logout_makes_token_invalid(): void
    {
        $user = User::find(1);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/user')->assertStatus(200);

        $this->withToken($token)->postJson('/api/logout')->assertStatus(200);

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertStatus(401);
    }
}
