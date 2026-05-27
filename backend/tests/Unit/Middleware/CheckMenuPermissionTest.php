<?php

declare(strict_types=1);

namespace Tests\Unit\Middleware;

use App\Http\Middleware\CheckMenuPermission;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class CheckMenuPermissionTest extends TestCase
{
    public function test_allows_admin(): void
    {
        $user = new User;
        $user->id = 1;
        $request = new Request;
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckMenuPermission;
        $response = $middleware->handle($request, fn () => new Response('ok'), 'user.view');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_allows_user_with_permission(): void
    {
        $user = $this->createMock(User::class);
        $user->id = 2;
        $user->method('hasMenuPermission')->with('user.view')->willReturn(true);

        $request = new Request;
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckMenuPermission;
        $response = $middleware->handle($request, fn () => new Response('ok'), 'user.view');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_blocks_user_without_permission(): void
    {
        $user = $this->createMock(User::class);
        $user->id = 2;
        $user->method('hasMenuPermission')->with('user.view')->willReturn(false);

        $request = new Request;
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckMenuPermission;
        $response = $middleware->handle($request, fn () => new Response('ok'), 'user.view');

        $this->assertEquals(403, $response->getStatusCode());
    }
}
