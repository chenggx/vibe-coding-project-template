<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\User\IndexRequest;
use App\Http\Requests\User\StoreRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Models\User;
use App\Services\PermissionService;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(IndexRequest $request)
    {
        $query = User::query()->with('roles');

        if ($request->filled('name')) {
            $query->where('name', 'like', "%{$request->name}%");
        }

        if ($request->filled('email')) {
            $query->where('email', 'like', "%{$request->email}%");
        }

        $query->orderBy('created_at', 'desc');

        return ApiResponse::paginate($query->paginate($request->input('per_page', 15)));
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'avatar' => $validated['avatar'] ?? null,
            'status' => $request->boolean('status', true),
            'expires_at' => $validated['expires_at'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        if ($request->has('role_ids')) {
            $user->roles()->sync($validated['role_ids']);
        }

        return ApiResponse::success($user->load('roles'), '创建成功');
    }

    public function show(int $id)
    {
        $user = User::with('roles')->find($id);

        if (! $user) {
            return ApiResponse::error(10004, '用户不存在');
        }

        return ApiResponse::success($user);
    }

    public function update(UpdateRequest $request, int $id)
    {
        $user = User::find($id);

        if (! $user) {
            return ApiResponse::error(10004, '用户不存在');
        }

        if ($user->isSuperAdmin()) {
            return ApiResponse::error(10005, '不能修改超级管理员');
        }

        $validated = $request->validated();

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->avatar = $validated['avatar'] ?? null;
        $user->status = $request->boolean('status', $user->status);
        $user->expires_at = $validated['expires_at'] ?? null;
        $user->remarks = $validated['remarks'] ?? null;
        $user->save();

        if ($request->has('role_ids')) {
            $user->roles()->sync($validated['role_ids']);
        }

        app(PermissionService::class)->clearUserPermissionCache($user);

        return ApiResponse::success($user->load('roles'), '更新成功');
    }

    public function destroy(int $id)
    {
        $user = User::find($id);

        if (! $user) {
            return ApiResponse::error(10004, '用户不存在');
        }

        if ($user->id === auth()->id()) {
            return ApiResponse::error(10010, '不能删除自己的账号');
        }

        if ($user->isSuperAdmin()) {
            return ApiResponse::error(10005, '不能删除超级管理员');
        }

        $user->roles()->detach();
        $user->delete();

        app(PermissionService::class)->clearUserPermissionCache($user);

        return ApiResponse::success(null, '删除成功');
    }
}
