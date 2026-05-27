<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateRequest;
use App\Services\PermissionService;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(UpdateRequest $request)
    {
        $user = $request->user();

        if ($request->filled('password')) {
            if (! Hash::check($request->input('current_password'), $user->password)) {
                return ApiResponse::error(10009, '当前密码不正确');
            }
            $user->password = Hash::make($request->input('password'));
        }

        if ($request->has('name')) {
            $user->name = $request->input('name');
        }

        if ($request->has('avatar')) {
            $user->avatar = $request->input('avatar');
        }

        $user->save();

        app(PermissionService::class)->clearUserPermissionCache($user);

        return ApiResponse::success($user->load('roles'), '更新成功');
    }
}
