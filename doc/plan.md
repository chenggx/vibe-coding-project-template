# 基础后台管理框架 —— Vibe Coding 计划

## Context

用户希望以 vibe coding（自然语言驱动 AI 生成代码）的方式，从零构建一个基础后台管理系统。作为正式项目的基础框架，采用前后端分离架构。

**关键约束：**
- 无 Docker 环境，使用本地开发环境
- 前端使用 Ant Design 5，但需自定义设计风格（不使用 Ant Design Pro 预设模板，通过 ConfigProvider 自定义主题变量脱离默认蓝色系）
- 后端使用 Laravel 11 + Sanctum Token (Bearer) 认证 + Spatie Permission
- 目录结构：`D:\Project\backend\` + `D:\Project\frontend\`

## Recommended Approach

### 技术栈

**后端（`backend/`）**
- Laravel 12 (PHP 8.2+)
- Laravel Sanctum (Token/Bearer 认证)
- Spatie Laravel Permission (^6.0)
- MySQL 8

**前端（`frontend/`）**
- Vite + React 18 + TypeScript
- Ant Design 5（通过 ConfigProvider 自定义主题色、圆角、字体）
- React Router 6
- Axios（请求头携带 `Authorization: Bearer <token>`）
- Zustand（全局状态管理）

### 分阶段实施计划

#### Phase 1: 后端脚手架
1. 确认本地环境：PHP 8.2+, Composer, MySQL 已安装
2. `composer create-project laravel/laravel backend`（默认安装最新 Laravel 12）
3. 配置 `backend/.env` 数据库连接
4. 安装 Sanctum：`composer require laravel/sanctum` + publish 配置
5. 安装 Spatie Permission：`composer require spatie/laravel-permission` + publish 迁移
6. 执行 `php artisan migrate`
7. **验证**：`php artisan serve` 访问 `http://127.0.0.1:8000` 显示 Laravel 欢迎页

#### Phase 2: 前端脚手架
1. 确认 Node.js 18+ 已安装
2. `npm create vite@latest frontend -- --template react-ts`
3. 安装依赖：`antd`, `react-router-dom`, `axios`, `zustand`
4. 配置 `frontend/vite.config.ts`：代理 `/api` 到 `http://127.0.0.1:8000`（避免 CORS 问题）
5. 配置 Ant Design `ConfigProvider`（自定义 `colorPrimary`、`borderRadius` 等，脱离默认蓝）
6. 搭建最简页面结构验证主题色生效
7. **验证**：`npm run dev` 访问 `http://localhost:5173` 看到自定义主题色的页面

#### Phase 3: 后端认证与权限数据
1. 配置 `config/sanctum.php`：关闭 SPA 认证相关配置，启用 Token 认证模式
2. 在 `routes/api.php` 定义认证路由：
   - `POST /login`
   - `POST /logout`
   - `GET /user`（`auth:sanctum` 保护）
3. 创建 `PermissionsSeeder`：预设权限（`user.view`, `user.create`, `user.edit`, `user.delete`, `role.view`, `role.manage` 等）
4. 创建 `RolesSeeder`：预设 `super-admin`（拥有全部权限）、`admin`（部分权限）
5. 创建初始用户并分配角色
6. 执行 `php artisan db:seed`
7. **验证**：`curl -X POST http://127.0.0.1:8000/api/login -H "Accept: application/json" -d "email=xxx&password=xxx"` 返回 `{ user, token }`

#### Phase 4: 前端基础布局与登录
1. 使用 Ant Design `Layout`, `Menu`, `Header` 手动搭建后台基础布局（不使用 ProComponents）：
   - 左侧可折叠侧边栏
   - 顶部 Header（显示用户名、退出按钮）
   - 右侧内容区（`Outlet`）
2. 在根组件挂载 `ConfigProvider`，注入自定义主题 token
3. Axios 封装：`baseURL: '/api'`, 请求拦截器注入 `Authorization: Bearer <token>`，响应拦截器处理 401 跳转登录
4. Zustand auth store：`user`, `isAuthenticated`, `login()`, `logout()`, `fetchUser()`
5. 登录页面：Form + 调用 login API → 成功后写入 store → 跳转首页
6. **验证**：浏览器中输入账号密码 → 登录成功 → 看到带侧边栏的布局 → 顶部显示用户名

#### Phase 5: 用户管理模块
1. 后端 API（`routes/api.php` + Controller）：
   - `GET /api/users`（分页 `paginate`、支持按 name/email 搜索）
   - `POST /api/users`（创建，可分配角色）
   - `PUT /api/users/{id}`（更新）
   - `DELETE /api/users/{id}`（删除）
2. 前端页面：
   - 用户列表：`Table` + `Pagination` + 顶部搜索表单
   - 新增/编辑：`Modal` + `Form`（字段包含角色多选 `Select`）
   - 删除：`Popconfirm` 确认
3. **验证**：页面能完成用户的增删改查，并正确分配角色

#### Phase 6: 角色权限模块
1. 后端 API：
   - `GET /api/roles`（列表）
   - `POST /api/roles`（创建角色 + 分配权限）
   - `PUT /api/roles/{id}`（更新）
   - `DELETE /api/roles/{id}`
   - `GET /api/permissions`（返回所有可用权限，供前端渲染 Checkbox）
2. 前端页面：
   - 角色列表页（Table）
   - 角色编辑 Modal（Form + Checkbox.Group 或自定义权限树）
3. **验证**：能新建角色，勾选权限，保存后数据库关联正确

#### Phase 7: 前端权限控制
1. 菜单过滤：根据后端返回的 `user.permissions` 数组，动态计算 `Menu` 的 `items`，无权限的菜单项不渲染
2. 路由守卫：封装 `<RequireAuth />` 和 `<RequirePermission permission="xxx" />` 高阶组件
3. 按钮级权限：封装 `usePermission("user.delete")` hook，无权限时隐藏/禁用操作按钮
4. **验证**：使用不同角色账号登录，侧边栏菜单和页面内的操作按钮按需显示/隐藏

#### Phase 8: 收尾与文档
1. 根目录 `README.md`：环境要求、安装步骤、目录结构说明
2. 前端添加 `.prettierrc` + `.eslintrc.cjs`（基础配置）
3. 后端确保 `.env.example` 包含所有必要键
4. **验证**：按 README 步骤，全新环境下能完成 `composer install`, `npm install`, `php artisan migrate --seed`, `npm run dev` 并正常访问系统

## Critical Files to be Created/Modified

### 后端关键文件
- `backend/.env` —— 数据库和 Sanctum 配置
- `backend/config/sanctum.php` —— SPA 认证配置
- `backend/config/cors.php` —— 允许前端域名和 credentials
- `backend/routes/api.php` —— 所有 API 路由
- `backend/app/Http/Controllers/AuthController.php` —— 登录/登出/用户信息
- `backend/app/Http/Controllers/UserController.php` —— 用户 CRUD
- `backend/app/Http/Controllers/RoleController.php` —— 角色 CRUD + 权限分配
- `backend/database/seeders/PermissionsSeeder.php` —— 权限数据
- `backend/database/seeders/RolesSeeder.php` —— 角色数据
- `backend/database/seeders/UserSeeder.php` —— 初始用户

### 前端关键文件
- `frontend/vite.config.ts` —— API 代理配置
- `frontend/src/main.tsx` —— ConfigProvider 挂载点
- `frontend/src/theme.ts` —— 自定义 Ant Design token
- `frontend/src/store/authStore.ts` —— Zustand 用户状态
- `frontend/src/utils/request.ts` —— Axios 封装
- `frontend/src/components/Layout/index.tsx` —— 基础布局（侧边栏 + 头部）
- `frontend/src/router/index.tsx` —— React Router 配置 + 路由守卫
- `frontend/src/pages/Login/index.tsx` —— 登录页
- `frontend/src/pages/Users/index.tsx` —— 用户管理页
- `frontend/src/pages/Roles/index.tsx` —— 角色管理页
- `frontend/src/hooks/usePermission.ts` —— 按钮级权限 hook

## Verification Strategy

- **每阶段提供手动验证清单**：后端提供 `curl` 命令或浏览器 Network 面板预期结果；前端提供浏览器操作步骤和预期 UI 状态
- **端到端验证**：从登录 → 用户管理 CRUD → 角色权限分配 → 切换账号验证权限变化，形成完整闭环

## Risks & Assumptions

1. **本地环境依赖**：用户已安装 PHP 8.2+, Composer, Node 18+, MySQL。若任一缺失，Phase 1/2 会阻塞，需先安装环境。
2. **Windows 兼容性**：Laravel 和 Vite 在 Windows 11 下运行良好，但需确保 `php` 和 `npm` 命令已在系统 PATH 中。
3. **Token 存储安全**：前端需将 token 存储在 `localStorage`（或 `sessionStorage`）中，存在 XSS 风险。需确保前端严格防范 XSS，或考虑使用 httpOnly cookie 存储 token（需额外封装）。
4. **最脆弱假设**：D:\Project 目录下无同名 `backend` 或 `frontend` 文件夹。若已存在，创建项目时会冲突。
