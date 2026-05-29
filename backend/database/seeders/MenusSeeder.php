<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenusSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            ['id' => 17, 'parent_id' => null, 'name' => '仪表盘', 'type' => 'menu', 'path' => '/dashboard', 'icon' => 'Dashboard', 'permission' => 'dashboard.index', 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 1, 'parent_id' => null, 'name' => '系统管理', 'type' => 'catalog', 'path' => null, 'icon' => 'Setting', 'permission' => null, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'parent_id' => 1, 'name' => '用户管理', 'type' => 'menu', 'path' => '/users', 'icon' => 'User', 'permission' => 'users.index', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'parent_id' => 2, 'name' => '查看用户', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'users.show', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'parent_id' => 2, 'name' => '新增用户', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'users.store', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'parent_id' => 2, 'name' => '编辑用户', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'users.update', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'parent_id' => 2, 'name' => '删除用户', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'users.destroy', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'parent_id' => 1, 'name' => '角色管理', 'type' => 'menu', 'path' => '/roles', 'icon' => 'Shield', 'permission' => 'roles.index', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'parent_id' => 7, 'name' => '查看角色', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'roles.show', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'parent_id' => 7, 'name' => '创建角色', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'roles.store', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'parent_id' => 7, 'name' => '编辑角色', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'roles.update', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'parent_id' => 7, 'name' => '删除角色', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'roles.destroy', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'parent_id' => 1, 'name' => '菜单管理', 'type' => 'menu', 'path' => '/menus', 'icon' => 'Menu', 'permission' => 'menus.all', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'parent_id' => 12, 'name' => '创建菜单', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'menus.store', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'parent_id' => 12, 'name' => '编辑菜单', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'menus.update', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'parent_id' => 12, 'name' => '删除菜单', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'menus.destroy', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'parent_id' => 1, 'name' => '文件上传', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'upload.store', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 18, 'parent_id' => 1, 'name' => '操作日志', 'type' => 'menu', 'path' => '/operation-logs', 'icon' => 'FileText', 'permission' => 'operation_logs.index', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 19, 'parent_id' => 1, 'name' => '登录日志', 'type' => 'menu', 'path' => '/login-logs', 'icon' => 'FileText', 'permission' => 'login_logs.index', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20, 'parent_id' => 1, 'name' => '公告管理', 'type' => 'menu', 'path' => '/announcements', 'icon' => 'Notification', 'permission' => 'announcements.index', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 21, 'parent_id' => 20, 'name' => '查看公告', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'announcements.show', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 22, 'parent_id' => 20, 'name' => '新增公告', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'announcements.store', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 23, 'parent_id' => 20, 'name' => '编辑公告', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'announcements.update', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 24, 'parent_id' => 20, 'name' => '删除公告', 'type' => 'permission', 'path' => null, 'icon' => null, 'permission' => 'announcements.destroy', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($menus as $menu) {
            DB::table('menus')->updateOrInsert(['id' => $menu['id']], $menu);
        }
    }
}
