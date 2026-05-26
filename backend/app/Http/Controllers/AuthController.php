<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', strtolower($request->email))->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return ApiResponse::error(10001, '邮箱或密码错误');
        }

        if (! $user->status) {
            return ApiResponse::error(10002, '账号已禁用或已过期');
        }

        if ($user->expires_at !== null && $user->expires_at <= now()) {
            return ApiResponse::error(10002, '账号已禁用或已过期');
        }

        $token = $user->createToken('api', ['*'], now()->addHours(24))->plainTextToken;

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
            'is_super_admin' => $user->is_super_admin,
            'roles' => $user->roles,
            'menus' => $menus,
        ]);
    }
}
