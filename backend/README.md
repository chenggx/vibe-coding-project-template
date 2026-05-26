# 后台管理系统 API

基于 Laravel 13 + Sanctum SPA Cookie 认证的后台管理 API。

## 环境要求

- PHP 8.2+
- Composer
- SQLite（开发期）

## 安装步骤

```bash
# 1. 安装依赖
composer install

# 2. 复制环境配置
cp .env.example .env

# 3. 生成应用密钥
php artisan key:generate

# 4. 创建 SQLite 数据库文件
touch database/database.sqlite

# 5. 执行迁移并填充初始数据
php artisan migrate --seed

# 6. 创建存储链接
php artisan storage:link

# 7. 启动开发服务器
php artisan serve
```

## 默认账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@example.com | password | 超级管理员（天然拥有所有权限） |

## 前端对接说明

1. 先请求 `GET /sanctum/csrf-cookie` 获取 CSRF Token
2. 携带 Cookie 请求其他接口
3. 前端地址默认 `http://localhost:5173`

## API 响应格式

```json
// 成功（单条）
{ "code": 0, "message": "success", "data": { ... } }

// 成功（分页）
{
  "code": 0,
  "message": "success",
  "data": [ ... ],
  "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 73 }
}

// 错误
{ "code": 10001, "message": "错误描述", "data": null }
```

## 错误码速查

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 10001 | 邮箱或密码错误 |
| 10002 | 账号已禁用或已过期 |
| 10003 | 无权访问 |
| 10004 | 用户不存在 |
| 10005 | 不能修改/删除超级管理员 |
| 10006 | 角色不存在 |
| 10007 | 菜单不存在 |
| 10008 | 请先删除子节点 |

## 存储驱动切换

修改 `.env` 中的 `STORAGE_DRIVER`：

```env
STORAGE_DRIVER=local  # 本地（默认）
# STORAGE_DRIVER=oss   # 阿里云 OSS
# STORAGE_DRIVER=qiniu # 七牛云
```

## 修改超管密码

```bash
php artisan admin:reset-password
```

## 测试

```bash
# 运行测试
php artisan test

# 代码风格检查
./vendor/bin/pint
```
