<?php

namespace Database\Factories;

use App\Models\LoginLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoginLog>
 */
class LoginLogFactory extends Factory
{
    protected $model = LoginLog::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->name(),
            'type' => fake()->randomElement(['login', 'failed']),
            'ip' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'browser' => fake()->randomElement(['Chrome', 'Edge', 'Safari', 'Firefox']),
            'os' => fake()->randomElement(['Windows', 'macOS', 'Linux', 'Android', 'iOS']),
            'message' => null,
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function login(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'login',
            'message' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'failed',
            'message' => fake()->randomElement(['密码错误', '账号已禁用']),
        ]);
    }
}
