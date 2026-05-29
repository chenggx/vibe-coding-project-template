<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MenusSeeder::class,
            RolesSeeder::class,
            UserSeeder::class,
            TestSeeder::class, // 测试数据
        ]);
    }
}
