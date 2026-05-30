<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'avatar' => null,
                'status' => true,
                'expires_at' => null,
                'remarks' => null,
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'avatar' => null,
                'status' => true,
                'expires_at' => null,
                'remarks' => null,
            ]
        );

        DB::table('user_has_roles')->insert([
            ['user_id' => 2, 'role_id' => 1]
        ]);
    }
}
