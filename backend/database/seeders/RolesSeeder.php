<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'editor', 'display_name' => '编辑者', 'description' => '可管理用户和上传文件', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'viewer', 'display_name' => '查看者', 'description' => '仅可查看', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('role_has_menus')->insert([
            ['role_id' => 1, 'menu_id' => 17],
            ['role_id' => 1, 'menu_id' => 2],
            ['role_id' => 1, 'menu_id' => 3],
            ['role_id' => 1, 'menu_id' => 4],
            ['role_id' => 1, 'menu_id' => 14],
            ['role_id' => 2, 'menu_id' => 17],
            ['role_id' => 2, 'menu_id' => 2],
            ['role_id' => 2, 'menu_id' => 6],
            ['role_id' => 2, 'menu_id' => 10],
        ]);
    }
}
