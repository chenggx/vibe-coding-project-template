<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\LoginLog;
use App\Models\OperationLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $this->createTestRoles(20);
        $this->createTestUsers(20);
        $this->createTestOperationLogs(50);
        $this->createTestLoginLogs(50);
        $this->createTestAnnouncements(50);
    }

    /**
     * 创建测试角色（已有 2 个，补充到指定数量）
     */
    private function createTestRoles(int $count): void
    {
        $existingCount = Role::count();
        $toCreate = $count - $existingCount;

        if ($toCreate <= 0) {
            return;
        }

        $names = [
            'content_manager' => '内容管理员',
            'data_analyst' => '数据分析师',
            'developer' => '开发工程师',
            'designer' => '设计师',
            'marketing' => '市场专员',
            'sales_manager' => '销售经理',
            'hr_manager' => '人事经理',
            'finance' => '财务人员',
            'support' => '客服人员',
            'qa_engineer' => '测试工程师',
            'devops' => '运维工程师',
            'product_manager' => '产品经理',
            'project_manager' => '项目经理',
            'intern' => '实习生',
            'consultant' => '顾问',
            'operations' => '运营专员',
            'technical_lead' => '技术负责人',
            'team_lead' => '团队负责人',
        ];

        $index = 0;
        foreach ($names as $name => $displayName) {
            if ($index >= $toCreate) {
                break;
            }

            Role::updateOrCreate(
                ['name' => $name],
                [
                    'display_name' => $displayName,
                    'description' => "这是 {$displayName} 的描述信息",
                ]
            );

            $index++;
        }
    }

    /**
     * 创建测试用户
     */
    private function createTestUsers(int $count): void
    {
        $usernames = [
            'zhangsan', 'lisi', 'wangwu', 'zhaoliu', 'sunqi',
            'zhouba', 'wujiu', 'zhengshi', 'qianyi', 'fengtwo',
            'chenmei', 'linxiao', 'huangda', 'liuyang', 'xiedong',
            'mayun', 'zhulin', 'songming', 'tangli', 'hanxue',
        ];

        $roles = Role::pluck('id')->toArray();

        for ($i = 0; $i < $count; $i++) {
            $name = $usernames[$i] ?? "user{$i}";
            $email = "{$name}@example.com";

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => ucfirst($name),
                    'password' => Hash::make('password'),
                    'status' => $i % 5 !== 0, // 20% 的用户被禁用
                    'remarks' => "测试用户 {$name}",
                    'expires_at' => $i % 3 === 0
                        ? now()->addDays(rand(30, 365))
                        : null,
                ]
            );

            // 随机分配一个角色
            if (!empty($roles)) {
                $roleId = $roles[array_rand($roles)];
                if (!$user->roles()->where('role_id', $roleId)->exists()) {
                    $user->roles()->attach($roleId);
                }
            }
        }
    }

    /**
     * 创建测试操作日志
     */
    private function createTestOperationLogs(int $count): void
    {
        $users = User::select('id', 'name')->get()->toArray();
        $actions = [
            ['method' => 'GET', 'path' => '/api/users', 'action' => '查看用户列表'],
            ['method' => 'GET', 'path' => '/api/users/1', 'action' => '查看用户详情'],
            ['method' => 'POST', 'path' => '/api/users', 'action' => '创建用户'],
            ['method' => 'PUT', 'path' => '/api/users/1', 'action' => '更新用户'],
            ['method' => 'DELETE', 'path' => '/api/users/1', 'action' => '删除用户'],
            ['method' => 'GET', 'path' => '/api/roles', 'action' => '查看角色列表'],
            ['method' => 'POST', 'path' => '/api/roles', 'action' => '创建角色'],
            ['method' => 'PUT', 'path' => '/api/roles/1', 'action' => '更新角色'],
            ['method' => 'GET', 'path' => '/api/menus', 'action' => '查看菜单列表'],
            ['method' => 'POST', 'path' => '/api/auth/logout', 'action' => '用户登出'],
        ];

        $ips = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '127.0.0.1', '192.168.2.50'];

        for ($i = 0; $i < $count; $i++) {
            $action = $actions[array_rand($actions)];
            $user = $users[array_rand($users)];

            OperationLog::create([
                'user_id' => $user['id'],
                'username' => $user['name'],
                'method' => $action['method'],
                'path' => $action['path'],
                'action' => $action['action'],
                'ip' => $ips[array_rand($ips)],
                'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }
    }

    /**
     * 创建测试登录日志
     */
    private function createTestLoginLogs(int $count): void
    {
        $users = User::select('id', 'name')->get()->toArray();
        $userEmails = User::select('id', 'email')->get()->pluck('email', 'id')->toArray();

        $browsers = ['Chrome/120.0', 'Firefox/121.0', 'Safari/17.2', 'Edge/120.0'];
        $oses = ['Windows 10', 'macOS 14.2', 'Ubuntu 22.04', 'iOS 17.2'];
        $ips = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '127.0.0.1'];

        for ($i = 0; $i < $count; $i++) {
            $user = $users[array_rand($users)];
            $email = $userEmails[$user['id']] ?? "unknown@example.com";
            $type = rand(0, 10) < 8 ? 'login' : 'failed'; // 80% 成功

            LoginLog::create([
                'user_id' => $user['id'],
                'email' => $email,
                'name' => $user['name'],
                'type' => $type,
                'ip' => $ips[array_rand($ips)],
                'user_agent' => 'Mozilla/5.0',
                'browser' => $browsers[array_rand($browsers)],
                'os' => $oses[array_rand($oses)],
                'message' => $type === 'failed' ? '密码错误' : '登录成功',
                'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }
    }

    /**
     * 创建测试公告
     */
    private function createTestAnnouncements(int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $daysAgo = rand(0, 90);

            Announcement::create([
                'title' => "公告标题 {$i}：系统更新通知",
                'content' => "这是第 {$i} 条公告内容。系统将于近期进行维护升级，请各位用户提前做好准备。",
                'status' => $i % 3 === 0, // 33% 已发布
                'pinned' => $i % 10 === 0, // 10% 置顶
                'created_at' => now()->subDays($daysAgo),
                'updated_at' => now()->subDays($daysAgo),
            ]);
        }
    }
}
