<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
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

        $testUser = User::where('email', 'test@example.com')->first();
        $agentRole = Role::where('name', 'agent')->first();

        if ($testUser && $agentRole) {
            $testUser->roles()->sync([$agentRole->id]);
        }
    }
}
