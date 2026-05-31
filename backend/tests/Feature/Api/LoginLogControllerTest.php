<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\LoginLog;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LoginLogControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_index_returns_paginated_login_logs(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        LoginLog::factory()->count(5)->create();

        $response = $this->getJson('/api/login-logs');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', fn ($data) => count($data) >= 5)
            ->assertJsonPath('meta.per_page', 15)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'email',
                        'type',
                        'created_at',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_index_filters_by_type(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        $failedLog = LoginLog::factory()->create(['type' => 'failed']);

        $response = $this->getJson('/api/login-logs?type=failed');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', fn ($data) => collect($data)->contains('id', $failedLog->id) && collect($data)->every(fn ($item) => $item['type'] === 'failed'));
    }

    public function test_index_filters_by_email(): void
    {
        $user = User::find(1);
        Sanctum::actingAs($user, ['*']);

        LoginLog::factory()->create(['email' => 'alice@example.com']);
        LoginLog::factory()->create(['email' => 'bob@example.com']);

        $response = $this->getJson('/api/login-logs?email=alice');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', fn ($data) => count($data) === 1)
            ->assertJsonPath('data.0.email', 'alice@example.com');
    }

    public function test_index_requires_authentication(): void
    {
        $response = $this->getJson('/api/login-logs');

        $response->assertStatus(401);
    }

    public function test_index_requires_permission(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/login-logs');

        $response->assertStatus(403);
    }
}
