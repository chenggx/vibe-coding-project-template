# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

前后端分离的后台管理系统。

- **前端** (`frontend/`): React 19 + TypeScript + Vite + Redux Toolkit + Ant Design 6 + React Router 7
- **后端** (`backend/`): Laravel 13 + Sanctum Token 认证 + SQLite（开发期）
- 前端 dev server 代理 `/api` 到 `http://localhost:8000`
- 后端已有独立的 `CLAUDE.md`，包含 Laravel 架构细节

## 常用命令

### 前端 (`frontend/`)

```bash
# 强制使用 pnpm
pnpm install
pnpm dev          # 启动 dev server (http://localhost:5173)
pnpm build        # 生产构建
pnpm test         # 运行 Vitest 测试（单次的）
pnpm test:watch   # Vitest watch 模式
pnpm lint         # ESLint 检查
pnpm lint:fix     # ESLint 自动修复
```

### 后端 (`backend/`)

```bash
# 一键安装（依赖、密钥、迁移、前端构建）
composer run setup

# 开发模式（同时启动 serve / queue / pail / vite）
composer run dev

# 仅启动 API 服务
php artisan serve

# 运行测试
php artisan test --compact

# 代码风格检查与修复
./vendor/bin/pint

# 重置超级管理员密码
php artisan admin:reset-password
```

## 前端架构

前端使用 RTK Query 集中式 API（`src/services/adminApi.ts`）+ Redux Toolkit 纯 reducer slice。详细架构、目录约定、API 层、状态管理、测试配置等见 `frontend/CLAUDE.md`。

### 路由与权限

- `src/app/routes.tsx` 定义路由表，页面使用 `React.lazy` 懒加载
- `AuthGuard` 处理：
  1. 无 Token → 跳转 `/login`
  2. 有 Token 但无用户信息 → 自动调用 `useGetCurrentUserQuery()` 获取
  3. 路由权限校验（`routePermissionMap`）→ 非超管且无权限时显示"无权访问"
- 权限映射：`/users` → `users.index`，`/roles` → `roles.index`，`/menus` → `menus.all`

## 前后端对接

- 认证方式：Sanctum Token。登录后后端返回 `token`，前端存储在 `localStorage`，通过 `Authorization: Bearer {token}` 发送
- 开发时前端代理 `/api` 到 `http://localhost:8000`
- 生产环境通过 `VITE_API_BASE_URL` 环境变量配置
- 后端 CORS 已配置允许 `http://localhost:5173`

## 业务规则

- **用户只能拥有一个角色。** 虽然数据库层面 `user_has_roles` 是多对多关联表，但产品层面限制每个用户只能分配一个角色。创建/编辑用户时前端表单使用单选 Select，提交时 `role_ids` 最多只包含一个元素。

## 前端注意事项

- Ant Design 6 中，`Drawer` 的 `width` 已废弃，使用 `size` 替代。
- Ant Design 6 中，`Table` 分页的 `position` 已废弃，使用 `placement` 替代。
- **RTK Query 列表页缓存处理**：
  - **搜索按钮**：`useGetXxxQuery` 在查询参数不变时会命中缓存、跳过网络请求。如果列表页需要"点击搜索即刷新"的交互（即使筛选条件没变），必须在 `handleSearch` 中调用 `refetch()`，否则用户会感觉"搜索按钮没反应"。
  - **分页切换**：Query Hook 必须添加 `{ refetchOnMountOrArgChange: true }` 选项，否则分页切换时可能命中缓存而不发起网络请求。
