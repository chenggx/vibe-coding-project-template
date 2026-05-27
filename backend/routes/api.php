<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// 公开接口
Route::post('/login', [AuthController::class, 'login'])->name('login')->middleware('throttle:5,1');

// 需要认证的接口
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    // 无需菜单权限
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'me'])->name('user.me');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');

    // 菜单查询（所有认证用户可用）
    Route::get('/menus', [MenuController::class, 'index'])->name('menus.index');

    // 需要菜单权限的管理接口
    Route::middleware('menu.permission')->group(function () {
        // 用户管理
        Route::apiResource('users', UserController::class);

        // 角色管理
        Route::apiResource('roles', RoleController::class);

        // 菜单管理
        Route::get('/menus/all', [MenuController::class, 'all'])->name('menus.all');
        Route::post('/menus', [MenuController::class, 'store'])->name('menus.store');
        Route::put('/menus/{id}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('/menus/{id}', [MenuController::class, 'destroy'])->name('menus.destroy');
    });
});
