<?php

declare(strict_types=1);

namespace Tests\Unit\Middleware;

use App\Http\Middleware\EnsureUserIsActive;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class EnsureUserIsActiveTest extends TestCase
{
    public function test_allows_active_user(): void
    {
        $user = new User([
            'status' => true,
            'expires_at' => null,
        ]);

        $request = new Request;
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureUserIsActive;
        $response = $middleware->handle($request, fn () => new Response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_blocks_disabled_user(): void
    {
        $user = new User([
            'status' => false,
            'expires_at' => null,
        ]);

        $request = new Request;
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureUserIsActive;
        $response = $middleware->handle($request, fn () => new Response('ok'));

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function test_blocks_expired_user(): void
    {
        $user = new User([
            'status' => true,
            'expires_at' => now()->subDay(),
        ]);

        $request = new Request;
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureUserIsActive;
        $response = $middleware->handle($request, fn () => new Response('ok'));

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function test_allows_guest(): void
    {
        $request = new Request;
        $request->setUserResolver(fn () => null);

        $middleware = new EnsureUserIsActive;
        $response = $middleware->handle($request, fn () => new Response('ok'));

        $this->assertEquals(200, $response->getStatusCode());
    }
}
