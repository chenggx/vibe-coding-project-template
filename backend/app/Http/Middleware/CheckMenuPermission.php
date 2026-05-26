<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuPermission
{
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $permission ??= $request->route()?->getName();

        if ($permission === null) {
            return ApiResponse::error(10003, '无权访问', 403);
        }

        $user = $request->user();

        if ($user !== null && $user->isSuperAdmin()) {
            return $next($request);
        }

        if ($user !== null && $user->hasMenuPermission($permission)) {
            return $next($request);
        }

        return ApiResponse::error(10003, '无权访问', 403);
    }
}
