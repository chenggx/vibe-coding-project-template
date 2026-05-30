<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Filters\RoleFilter;
use App\Http\Requests\Role\IndexRequest;
use App\Http\Requests\Role\StoreRequest;
use App\Http\Requests\Role\UpdateRequest;
use App\Models\Role;
use App\Services\PermissionService;
use App\Support\ApiResponse;

class RoleController extends Controller
{
    public function index(IndexRequest $request, RoleFilter $filter)
    {
        $query = Role::query()->withCount('users')->filter($filter);
        $query->orderBy('created_at', 'desc');

        return ApiResponse::paginate($query->paginate($request->input('per_page', 15)));
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $role = Role::create($validated);

        if ($request->has('menu_ids')) {
            $role->menus()->sync($validated['menu_ids']);
        }

        app(PermissionService::class)->clearAllPermissionCache();

        return ApiResponse::success($role->load('menus'), '创建成功');
    }

    public function show(int $id)
    {
        $role = Role::with('menus')->find($id);

        if (! $role) {
            return ApiResponse::error(10006, '角色不存在');
        }

        return ApiResponse::success($role);
    }

    public function update(UpdateRequest $request, int $id)
    {
        $role = Role::find($id);

        if (! $role) {
            return ApiResponse::error(10006, '角色不存在');
        }

        $validated = $request->validated();

        $role->update($validated);

        if ($request->has('menu_ids')) {
            $role->menus()->sync($validated['menu_ids']);
        }

        app(PermissionService::class)->clearAllPermissionCache();

        return ApiResponse::success($role->load('menus'), '更新成功');
    }

    public function destroy(int $id)
    {
        $role = Role::withCount('users')->find($id);

        if (! $role) {
            return ApiResponse::error(10006, '角色不存在');
        }

        if ($role->users_count > 0) {
            return ApiResponse::error(10011, '该角色下还存在用户，无法删除');
        }

        $role->menus()->detach();
        $role->delete();

        app(PermissionService::class)->clearAllPermissionCache();

        return ApiResponse::success(null, '删除成功');
    }
}
