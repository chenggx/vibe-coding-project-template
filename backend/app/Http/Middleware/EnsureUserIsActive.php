<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        if (! $user->status) {
            return ApiResponse::error(10002, '账号已禁用或已过期', 403);
        }

        if ($user->expires_at !== null && $user->expires_at <= now()) {
            return ApiResponse::error(10002, '账号已禁用或已过期', 403);
        }

        return $next($request);
    }
}
