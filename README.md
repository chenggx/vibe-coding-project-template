# 后台管理系统

一个基于前后端分离架构的通用后台管理系统，提供用户、角色、菜单、日志等核心管理功能。

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | React 19 · TypeScript · Vite · Redux Toolkit (RTK Query) · Ant Design 6 · React Router 7 |
| 后端 | Laravel 13 · PHP 8.4 · Sanctum Token 认证 · SQLite（开发期） |

## 功能特性

- **用户管理** — 创建/编辑/禁用用户，分配角色，设置账号有效期
- **角色管理** — 角色增删改查，绑定菜单权限
- **菜单管理** — 树形结构菜单，支持目录/菜单/按钮三种类型，动态控制前端路由与权限
- **日志审计** — 登录日志、操作日志自动记录与查询
- **公告管理** — 富文本公告发布，支持置顶与展示时间控制
- **个人中心** — 修改个人信息、头像上传、密码修改
- **权限控制** — 基于菜单的细粒度权限，超级管理员天然拥有所有权限

> **业务规则**：每个用户只能分配一个角色。

## 快速开始

### 环境要求

- Node.js 20+ · pnpm 10+
- PHP 8.4+ · Composer
- SQLite

### 1. 克隆项目

```bash
git clone <repository-url>
cd vibe-coding-project-template
```

### 2. 启动后端

```bash
cd backend

# 一键安装（依赖、密钥、迁移、前端构建）
composer run setup

# 或分步执行
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed   # 含初始测试数据
php artisan serve            # http://localhost:8000
```

> 初始管理员账号：`admin@example.com` / `password`

### 3. 启动前端

```bash
cd frontend
pnpm install
pnpm dev   # http://localhost:5173
```

前端 dev server 已配置代理，`/api` 请求会自动转发到 `http://localhost:8000`。

### 4. 开发模式（推荐）

在后端目录运行以下命令可同时启动 API 服务、队列、日志监听和 Vite：

```bash
cd backend
composer run dev
```

## 项目结构

```
.
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── modules/      # 按领域分模块（auth、user、role、menu…）
│   │   ├── services/     # RTK Query 集中式 API
│   │   ├── components/   # 布局 & 通用组件
│   │   ├── app/          # 路由、Store、根组件
│   │   └── hooks/        # 自定义 Hooks
│   └── tests/            # Vitest + Testing Library + MSW
│
└── backend/           # 后端 API
    ├── app/
    │   ├── Http/Controllers/   # 控制器
    │   ├── Http/Requests/      # 表单验证（按领域分组）
    │   ├── Models/             # Eloquent 模型
    │   ├── Services/           # 业务服务层
    │   └── Support/            # 工具类（ApiResponse…）
    ├── database/
    │   ├── migrations/         # 数据库迁移
    │   └── seeders/            # 数据填充
    └── tests/                  # PHPUnit 测试
```

## 常用命令

### 前端

```bash
cd frontend
pnpm dev           # 启动开发服务器
pnpm build         # 生产构建
pnpm test          # 运行测试（单次）
pnpm test:watch    # 测试（watch 模式）
pnpm lint          # ESLint 检查
pnpm lint:fix      # ESLint 自动修复
```

### 后端

```bash
cd backend
composer run setup           # 一键安装
composer run dev             # 全量开发模式
php artisan serve            # 仅启动 API
php artisan migrate --seed   # 迁移 + 填充
php artisan test --compact   # 运行测试
./vendor/bin/pint            # 代码风格修复
php artisan admin:reset-password   # 重置超管密码
```

## 认证与权限

- 使用 **Laravel Sanctum** Token 认证
- 登录后后端返回 `token`，前端存储于 `localStorage`
- 所有受保护请求携带 `Authorization: Bearer {token}`
- 权限基于菜单树动态计算，支持按钮级细粒度控制
- 超级管理员（`is_super_admin = true`）自动跳过所有权限校验

## 统一响应格式

后端所有 API 返回统一格式：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

| code | 含义 |
|---|---|
| 0 | 成功 |
| 10001 | 邮箱或密码错误 |
| 10002 | 账号已禁用或已过期 |
| 10003 | 无权访问 |
| 10004 | 用户不存在 |
| 10005 | 不能修改/删除超级管理员 |
| 10006 | 角色不存在 |
| 10007 | 菜单不存在 |
| 10008 | 请先删除子节点 |
| 10009 | 当前密码不正确 |
| 10010 | 不能删除自己的账号 |

## 测试

- **前端**：Vitest + jsdom + Testing Library + MSW
- **后端**：PHPUnit，测试环境使用内存 SQLite

运行全部测试：

```bash
# 前端
cd frontend && pnpm test

# 后端
cd backend && php artisan test --compact
```

## 部署

生产环境部署时，修改以下配置：

1. **后端** `.env`：
   - 数据库切换为 MySQL/PostgreSQL
   - 配置 `APP_KEY`、`APP_URL`
   - 前端地址 `FRONTEND_URL`

2. **前端** `.env.production`：
   - `VITE_API_BASE_URL` 指向生产 API 地址

3. 前端构建产物已集成到后端 `public/` 目录，可直接由 Laravel 提供静态文件服务。

## License

MIT
