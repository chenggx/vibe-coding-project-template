<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\OperationLog;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OperationLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->isMethod('GET')) {
            return $response;
        }

        if ($response instanceof JsonResponse) {
            $content = json_decode($response->getContent(), true);

            if (! is_array($content) || ($content['code'] ?? null) !== 0) {
                return $response;
            }
        }

        $routeName = $request->route()?->getName();

        if ($routeName !== null) {
            OperationLog::create([
                'user_id' => $request->user()?->id,
                'username' => $request->user()?->name,
                'method' => $request->method(),
                'path' => $request->path(),
                'action' => $this->resolveActionName($request, $routeName),
                'ip' => $request->ip(),
                'created_at' => now(),
            ]);
        }

        return $response;
    }

    private function resolveActionName(Request $request, string $routeName): string
    {
        return match ($routeName) {
            'login' => '用户登录',
            'logout' => '用户登出',
            'users.store' => '创建用户',
            'users.update' => '更新用户',
            'users.destroy' => '删除用户',
            'roles.store' => '创建角色',
            'roles.update' => '更新角色',
            'roles.destroy' => '删除角色',
            'menus.store' => '创建菜单',
            'menus.update' => '更新菜单',
            'menus.destroy' => '删除菜单',
            'announcements.store' => '创建公告',
            'announcements.update' => '更新公告',
            'announcements.destroy' => '删除公告',
            'profile.update' => '更新个人资料',
            'upload.store' => '上传文件',
            default => $routeName,
        };
    }
}
