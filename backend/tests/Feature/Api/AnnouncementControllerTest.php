<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Announcement;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnnouncementControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::find(1);
    }

    public function test_index_returns_paginated_announcements(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        Announcement::factory()->count(5)->create();

        $response = $this->getJson('/api/announcements');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_index_search_by_title(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        Announcement::factory()->create(['title' => 'Unique Announcement Title']);
        Announcement::factory()->create(['title' => 'Another Title']);

        $response = $this->getJson('/api/announcements?title=Unique');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', fn ($data) => count($data) === 1)
            ->assertJsonPath('data.0.title', 'Unique Announcement Title');
    }

    public function test_index_filter_by_status(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $draft = Announcement::factory()->draft()->create();

        $response = $this->getJson('/api/announcements?status=0');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', fn ($data) => collect($data)->contains('id', $draft->id));
    }

    public function test_index_sorts_by_pinned_first(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $pinned = Announcement::factory()->pinned()->create(['created_at' => now()->subDay()]);
        $normal = Announcement::factory()->create(['created_at' => now()]);

        $response = $this->getJson('/api/announcements');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.0.pinned', true)
            ->assertJsonPath('data', fn ($data) => collect($data)->search(fn ($item) => $item['id'] === $pinned->id) < collect($data)->search(fn ($item) => $item['id'] === $normal->id));
    }

    public function test_index_available_to_any_authenticated_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        Announcement::factory()->create();

        $response = $this->getJson('/api/announcements');

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);
    }

    public function test_index_requires_authentication(): void
    {
        $response = $this->getJson('/api/announcements');

        $response->assertStatus(401);
    }

    public function test_store_creates_announcement(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/announcements', [
            'title' => 'New Announcement',
            'content' => '<p>Content</p>',
            'status' => true,
            'pinned' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.title', 'New Announcement')
            ->assertJsonPath('data.status', true)
            ->assertJsonPath('data.pinned', true);

        $this->assertDatabaseHas('announcements', [
            'title' => 'New Announcement',
            'content' => '<p>Content</p>',
        ]);
    }

    public function test_store_requires_permission(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/announcements', [
            'title' => 'New Announcement',
            'content' => 'Content',
        ]);

        $response->assertStatus(403);
    }

    public function test_store_validation_error(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/announcements', [
            'title' => '',
            'content' => '',
        ]);

        $response->assertStatus(422);
    }

    public function test_show_returns_announcement(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $announcement = Announcement::factory()->create();

        $response = $this->getJson("/api/announcements/{$announcement->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.id', $announcement->id);
    }

    public function test_show_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/announcements/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10004);
    }

    public function test_update_modifies_announcement(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $announcement = Announcement::factory()->create();

        $response = $this->putJson("/api/announcements/{$announcement->id}", [
            'title' => 'Updated Title',
            'content' => 'Updated Content',
            'status' => false,
            'pinned' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.status', false)
            ->assertJsonPath('data.pinned', true);
    }

    public function test_update_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->putJson('/api/announcements/9999', [
            'title' => 'Title',
            'content' => 'Content',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('code', 10004);
    }

    public function test_update_requires_permission(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $announcement = Announcement::factory()->create();

        $response = $this->putJson("/api/announcements/{$announcement->id}", [
            'title' => 'Updated',
            'content' => 'Updated',
        ]);

        $response->assertStatus(403);
    }

    public function test_destroy_deletes_announcement(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
        $announcement = Announcement::factory()->create();

        $response = $this->deleteJson("/api/announcements/{$announcement->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 0);

        $this->assertDatabaseMissing('announcements', ['id' => $announcement->id]);
    }

    public function test_destroy_not_found(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->deleteJson('/api/announcements/9999');

        $response->assertStatus(200)
            ->assertJsonPath('code', 10004);
    }

    public function test_destroy_requires_permission(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $announcement = Announcement::factory()->create();

        $response = $this->deleteJson("/api/announcements/{$announcement->id}");

        $response->assertStatus(403);
    }
}
