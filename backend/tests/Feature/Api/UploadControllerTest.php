<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::find(1);
    }

    public function test_upload_image_success(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->postJson('/api/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.url', fn ($url) => str_starts_with($url, 'http'));
    }

    public function test_upload_validation_error_for_large_file(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $file = UploadedFile::fake()->image('large.jpg')->size(3000);

        $response = $this->postJson('/api/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(422);
    }

    public function test_upload_unauthenticated(): void
    {
        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->postJson('/api/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(401);
    }
}
