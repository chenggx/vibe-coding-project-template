<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class AdminResetPassword extends Command
{
    protected $signature = 'admin:reset-password';

    protected $description = '重置超级管理员密码（id=1）';

    public function handle(): int
    {
        $password = $this->secret('请输入新密码');
        $confirm = $this->secret('请确认新密码');

        if ($password !== $confirm) {
            $this->error('两次输入的密码不一致');

            return self::FAILURE;
        }

        if (strlen($password) < 6) {
            $this->error('密码长度不能少于 6 位');

            return self::FAILURE;
        }

        $user = User::find(1);

        if ($user === null) {
            $this->error('超级管理员用户不存在');

            return self::FAILURE;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info('超级管理员密码已重置');

        return self::SUCCESS;
    }
}
