<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginLog;
use App\Models\Menu;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', strtolower($request->email))->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            $this->recordLoginLog($request, 'failed', '邮箱或密码错误');

            return ApiResponse::error(10001, '邮箱或密码错误');
        }

        if (! $user->status) {
            $this->recordLoginLog($request, 'failed', '账号已禁用', $user);

            return ApiResponse::error(10002, '账号已禁用或已过期');
        }

        if ($user->expires_at !== null && $user->expires_at <= now()) {
            $this->recordLoginLog($request, 'failed', '账号已过期', $user);

            return ApiResponse::error(10002, '账号已禁用或已过期');
        }

        $token = $user->createToken('api', ['*'], now()->addHours(24))->plainTextToken;

        $this->recordLoginLog($request, 'login', null, $user);

        return ApiResponse::success([
            'user' => $user->load('roles'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, '登出成功');
    }

    public function me(Request $request)
    {
        $user = Auth::user()->load(['roles']);

        $menus = $user->isSuperAdmin()
            ? Menu::toTree(Menu::all())
            : Menu::toTree($user->menus());

        return ApiResponse::success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'status' => $user->status,
            'expires_at' => $user->expires_at,
            'remarks' => $user->remarks,
            'roles' => $user->roles,
            'menus' => $menus,
        ]);
    }

    private function recordLoginLog(LoginRequest $request, string $type, ?string $message = null, ?User $user = null): void
    {
        $ua = $request->userAgent();

        LoginLog::create([
            'user_id' => $user?->id,
            'email' => $user?->email ?? strtolower($request->input('email')),
            'name' => $user?->name,
            'type' => $type,
            'ip' => $request->ip(),
            'user_agent' => $ua,
            'browser' => $this->parseBrowser($ua),
            'os' => $this->parseOS($ua),
            'message' => $message,
            'created_at' => now(),
        ]);
    }

    private function parseBrowser(?string $ua): ?string
    {
        if (! $ua) {
            return null;
        }

        if (str_contains($ua, 'Edg')) {
            return 'Edge';
        }

        if (str_contains($ua, 'Chrome')) {
            return 'Chrome';
        }

        if (str_contains($ua, 'Safari')) {
            return 'Safari';
        }

        if (str_contains($ua, 'Firefox')) {
            return 'Firefox';
        }

        return 'Other';
    }

    private function parseOS(?string $ua): ?string
    {
        if (! $ua) {
            return null;
        }

        if (str_contains($ua, 'Windows')) {
            return 'Windows';
        }

        if (str_contains($ua, 'Mac OS')) {
            return 'macOS';
        }

        if (str_contains($ua, 'Android')) {
            return 'Android';
        }

        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) {
            return 'iOS';
        }

        if (str_contains($ua, 'Linux')) {
            return 'Linux';
        }

        return 'Other';
    }
}
