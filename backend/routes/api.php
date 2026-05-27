<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->name('login')->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'me'])->name('user.me');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::post('/upload', [UploadController::class, 'store'])
        ->name('upload.store');

    Route::get('/users', [UserController::class, 'index'])
        ->name('users.index')
        ->middleware('menu.permission');
    Route::post('/users', [UserController::class, 'store'])
        ->name('users.store')
        ->middleware('menu.permission');
    Route::get('/users/{id}', [UserController::class, 'show'])
        ->name('users.show')
        ->middleware('menu.permission');
    Route::put('/users/{id}', [UserController::class, 'update'])
        ->name('users.update')
        ->middleware('menu.permission');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->name('users.destroy')
        ->middleware('menu.permission');

    Route::get('/roles', [RoleController::class, 'index'])
        ->name('roles.index')
        ->middleware('menu.permission');
    Route::post('/roles', [RoleController::class, 'store'])
        ->name('roles.store')
        ->middleware('menu.permission');
    Route::get('/roles/{id}', [RoleController::class, 'show'])
        ->name('roles.show')
        ->middleware('menu.permission');
    Route::put('/roles/{id}', [RoleController::class, 'update'])
        ->name('roles.update')
        ->middleware('menu.permission');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])
        ->name('roles.destroy')
        ->middleware('menu.permission');

    Route::get('/menus', [MenuController::class, 'index'])->name('menus.index');
    Route::get('/menus/all', [MenuController::class, 'all'])
        ->name('menus.all')
        ->middleware('menu.permission');
    Route::post('/menus', [MenuController::class, 'store'])
        ->name('menus.store')
        ->middleware('menu.permission');
    Route::put('/menus/{id}', [MenuController::class, 'update'])
        ->name('menus.update')
        ->middleware('menu.permission');
    Route::delete('/menus/{id}', [MenuController::class, 'destroy'])
        ->name('menus.destroy')
        ->middleware('menu.permission');
});
