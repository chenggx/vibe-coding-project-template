# 后台实现计划（Backend Plan）

## 1. 概述与约束

- **框架**：Laravel 12（PHP 8.2+）
- **数据库**：SQLite（开发期），`.env` 预留 MySQL 切换配置
- **认证**：Laravel Sanctum Token (Bearer)
- **权限与菜单**：采用**后端动态菜单树（菜单即权限）**模式——完全放弃 Spatie，只用一张 `menus` 表同时承载菜单展示和权限鉴权；**id = 1 的用户为超级管理员**，天然拥有所有权限，无需角色关联；其他用户通过角色关联菜单节点获得权限，前端不保留任何静态配置
- **存储**：头像上传支持多驱动（本地 / 阿里云 OSS / 七牛云），全局单一配置
- **API 响应**：统一封装，业务码 `0=成功`，分页 `data` 为数组、`meta` 放分页信息

---

## 2. 数据库设计

### 2.1 用户表（users）
在 Laravel 默认基础上扩展：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| name | string | 姓名 |
| email | string | 邮箱，唯一 |
| email_verified_at | timestamp | 邮箱验证时间 |
| password | string | 密码 |
| avatar | string | 头像 URL |
| status | boolean | 1=启用, 0=禁用 |
| expires_at | datetime | 账号有效期，到期后自动禁用 |
| remarks | text | 备注 |
| rememberToken | string | 记住我 |
| timestamps | timestamp | created_at / updated_at |

### 2.2 菜单/权限表（menus）—— 唯一权限数据源

自关联树形结构，菜单即权限：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| parent_id | bigint | 父级 ID，根节点为 null |
| name | string | 显示名称（如"用户管理"） |
| type | string | catalog / menu / permission |
| path | string | 前端路由路径，type=permission 可为 null |
| icon | string | 图标标识，type=permission 可为 null |
| permission | string | 权限标识（如 user.view），唯一，用于后端鉴权 |
| sort_order | int | 排序权重 |
| meta | json | 扩展配置（如 hidden, keepAlive, component 等） |
| timestamps | timestamp | |

**type 说明**：
- `catalog`：目录，仅分组，无权限标识
- `menu`：菜单项，对应页面，有权限标识
- `permission`：权限点（页面按钮 / 纯后端操作），有权限标识，无前端路由

### 2.3 角色表（roles）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| name | string | 角色标识（如 super-admin） |
| display_name | string | 显示名称（如 超级管理员） |
| description | text | 描述 |
| timestamps | timestamp | |

### 2.4 角色菜单关联表（role_has_menus）

| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | bigint | 角色 ID |
| menu_id | bigint | 菜单/权限节点 ID |

---

## 3. 目录结构

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php      # 登录/登出/获取当前用户
│   │   │   ├── UserController.php      # 用户 CRUD
│   │   │   ├── RoleController.php      # 角色 CRUD + 权限分配
│   │   │   ├── MenuController.php      # 菜单树 CRUD
│   │   │   └── UploadController.php    # 头像/文件上传
│   │   ├── Middleware/
│   │   │   ├── EnsureUserIsActive.php  # 检查用户状态与有效期
│   │   │   └── CheckMenuPermission.php # 自定义权限鉴权中间件
│   │   └── Requests/                   # FormRequest 验证
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   └── Menu.php
│   ├── Services/
│   │   ├── StorageService.php          # 存储驱动统一封装
│   │   └── PermissionService.php       # 权限查询与缓存
│   ├── Support/
│   │   └── ApiResponse.php             # 统一响应封装辅助类
│   └── Traits/
│       └── HasMenuPermissions.php      # 用户权限查询 Trait
├── config/
│   ├── sanctum.php                     # SPA 认证配置
│   ├── cors.php                        # 允许前端域名和 credentials
│   └── filesystems.php                 # 追加自定义磁盘配置
├── database/
│   ├── migrations/                     # 用户表扩展 + menus 表迁移
│   └── seeders/
│       ├── MenusSeeder.php             # 菜单/权限树数据（核心）
│       ├── RolesSeeder.php             # 角色数据
│       └── UserSeeder.php              # 初始超管账号
└── routes/
    └── api.php                         # 所有 API 路由
```

---

## 4. API 设计

### 4.1 统一响应格式

```json
// 成功（单条/列表）
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "meta": { ... }  // 分页时出现
}

// 错误
{
  "code": 10001,
  "message": "用户不存在",
  "data": null
}
```

**分页 meta 示例**：
```json
{
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 73
}
```

### 4.2 路由规划

**认证（公开）**：
- `POST /api/login` — 登录
- `POST /api/logout` — 登出（需认证）

**用户管理（需认证 + 权限）**：
- `GET /api/users` — 列表（分页、支持 name/email 搜索）
- `POST /api/users` — 创建（可分配角色）
- `GET /api/users/{id}` — 详情
- `PUT /api/users/{id}` — 更新
- `DELETE /api/users/{id}` — 删除

**角色管理（需认证 + 权限）**：
- `GET /api/roles` — 列表
- `POST /api/roles` — 创建（含权限分配）
- `GET /api/roles/{id}` — 详情
- `PUT /api/roles/{id}` — 更新（含权限分配）
- `DELETE /api/roles/{id}` — 删除

**权限与菜单（需认证）**：
- `GET /api/menus` — 当前用户的菜单树（已按角色关联的菜单节点过滤）
- `GET /api/menus/all` — 完整菜单/权限树（管理用）
- `POST /api/menus` — 创建菜单/权限节点
- `PUT /api/menus/{id}` — 更新菜单/权限节点
- `DELETE /api/menus/{id}` — 删除菜单/权限节点

**上传（需认证）**：
- `POST /api/upload` — 通用上传接口，返回可访问 URL

**当前用户（需认证）**：
- `GET /api/user` — 获取当前登录用户信息（含用户基本信息、角色列表、**已过滤的菜单树**）

---

## 5. 认证方案：Sanctum Token (Bearer)

### 5.1 核心配置

- `config/sanctum.php`：
  - 关闭 SPA 认证相关配置（不配置 `stateful` 域名）
  - `guard` 使用 `web`

- `bootstrap/app.php`（Laravel 12 中间件配置入口）：
  - API 路由组应用 `auth:sanctum` 守卫

### 5.2 登录流程

1. 前端请求 `POST /api/login`
2. 后端验证邮箱密码，检查 `status=1` 且 `expires_at` 未过期
3. 登录成功，生成 Personal Access Token，返回 `{ user, token }`
4. 前端存储 token（如 `localStorage`）
5. 后续请求在 Header 中携带 `Authorization: Bearer <token>`，`auth:sanctum` 保护路由通过

### 5.3 用户状态中间件

创建 `EnsureUserIsActive` 中间件，挂载到认证后：
- 检查 `status === 1`
- 检查 `expires_at === null || expires_at > now()`
- 任一不满足则返回 `code: 10002, message: 账号已禁用或已过期`

---

## 6. 权限与菜单设计（菜单即权限，一张表）

### 6.1 核心原则

- **只有一张表**：`menus` 同时是菜单表和权限表，放弃 Spatie 等第三方包
- **id = 1 的用户为超级管理员**：天然拥有所有权限，不通过角色关联菜单节点，直接绕过所有权限校验
- **其他用户通过角色获得权限**：通过 `role_has_menus` 中间表，角色拥有哪些菜单节点 = 拥有哪些权限
- **前端无任何静态配置**：侧边栏、按钮、路由守卫全部基于后端返回的菜单树

### 6.2 菜单/权限节点类型

| type | 说明 | 是否参与后端鉴权 | 是否显示在前端 |
|------|------|------------------|----------------|
| `catalog` | 目录分组 | 否 | 是（侧边栏折叠组） |
| `menu` | 页面菜单 | 是（path 访问鉴权） | 是（侧边栏菜单项） |
| `permission` | 权限点（页面按钮 / 纯后端操作） | 是（操作/API 鉴权） | 否（仅用于前端按钮权限判断和后端接口鉴权） |

**数据示例**：
```
系统管理（catalog, path: null, permission: null）
├── 用户管理（menu, path: /users, permission: user.view）
│   ├── 新增用户（permission, permission: user.create）
│   ├── 编辑用户（permission, permission: user.edit）
│   └── 删除用户（permission, permission: user.delete）
├── 角色管理（menu, path: /roles, permission: role.view）
│   └── ...
├── 菜单管理（menu, path: /menus, permission: menu.view）
└── 文件上传（permission, permission: upload.image） ← 无页面，纯操作
```

### 6.3 后端鉴权实现

**用户权限查询（HasMenuPermissions Trait）**：
```php
// 获取当前用户所有权限标识（缓存）
$user->permissionNames(); // ['user.view', 'user.create', ...]

// 检查是否拥有某权限
$user->hasMenuPermission('user.create'); // bool
```

**中间件鉴权（CheckMenuPermission）**：
```php
// 路由用法
Route::post('/users', [UserController::class, 'store'])
    ->middleware('menu.permission:user.create');
```

中间件内部逻辑：
1. 获取当前登录用户
2. 若 `user->id === 1`（超级管理员），直接放行
3. 查询用户角色的所有菜单节点的 `permission` 字段（缓存）
4. 检查目标 permission 是否在列表中
5. 无权限返回 `code: 10003, message: 无权访问`

### 6.4 菜单树过滤逻辑

1. 若当前用户 `id === 1`（超级管理员），直接返回完整菜单树
2. 查询当前用户角色的所有菜单节点 ID
3. 查询完整菜单树，递归构建层级
4. 过滤：节点 ID 存在于用户角色菜单列表中，或节点为公共目录（permission=null），则保留
5. 递归清理空父节点
6. 返回过滤后的树形 JSON

### 6.5 前端使用方式

**侧边栏菜单**：
- 调用 `GET /api/menus` 获取树形结构
- 递归渲染：type=catalog/menu 渲染为菜单项，type=permission 不渲染

**按钮级权限**：
- 前端将菜单树扁平化为 Set（key 为 permission 标识）
- 按钮通过 `hasPermission('user.create')` 判断是否显示

**路由守卫**：
- 前端保留页面组件静态映射（用于渲染）
- 路由守卫检查目标 path 是否存在于返回的 menu 节点中
- 或直接依赖后端鉴权：访问无权限页面时后端 403，前端跳转无权限页

---

## 7. 存储驱动设计（头像上传）

### 7.1 配置

`.env` 新增：
```env
STORAGE_DRIVER=local
# STORAGE_DRIVER=oss
# STORAGE_DRIVER=qiniu

# OSS 配置（选填）
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
OSS_ENDPOINT=

# 七牛云配置（选填）
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
QINIU_BUCKET=
QINIU_DOMAIN=
```

### 7.2 StorageService

封装统一上传接口：
- `upload($file, $path = 'images') : string`
- 根据 `STORAGE_DRIVER` 分发到对应驱动
- 返回可公网访问的完整 URL

### 7.3 驱动实现

- **local**：使用 Laravel `Storage::disk('public')`，上传后返回 `asset('storage/...')` URL
- **oss**：使用 `aliyuncs/oss-sdk-php`，上传后返回拼接的公网 URL
- **qiniu**：使用 `qiniu/php-sdk`，上传后返回拼接的公网 URL

---

## 8. Seeder 设计

### 8.1 执行顺序

1. `MenusSeeder` — 写入完整菜单/权限树（含 catalog/menu/permission 三层结构）
2. `RolesSeeder` — 创建普通角色（如 `editor`、`viewer`），并关联部分菜单节点（可选，第一期可只留空）
3. `UserSeeder` — 创建 `admin@example.com / password`，作为第一个用户（id = 1，即为超级管理员）

> **注意**：`MenusSeeder` 是唯一核心数据源，菜单树的每个节点同时是权限点。超级管理员（id = 1）不通过角色关联菜单，天然拥有所有权限。其他用户通过 `role_has_menus` 关联菜单节点来拥有权限。

### 8.2 预设数据

- **初始用户（id = 1，超级管理员）**：
  - name: `Administrator`
  - email: `admin@example.com`
  - password: `password`
  - status: `1`
  - expires_at: `null`
  - 无需分配角色，id = 1 即为超管

---

## 9. 关键文件清单

| 文件 | 说明 |
|------|------|
| `backend/.env` | 数据库、Sanctum、CORS、存储驱动配置 |
| `backend/config/sanctum.php` | SPA 认证域名配置 |
| `backend/config/cors.php` | 跨域与 credentials 配置 |
| `backend/config/filesystems.php` | 追加 public 磁盘及自定义驱动配置 |
| `backend/routes/api.php` | 全部 API 路由定义 |
| `backend/app/Support/ApiResponse.php` | `success()` / `error()` / `paginate()` 辅助方法 |
| `backend/app/Http/Middleware/EnsureUserIsActive.php` | 检查用户状态与有效期 |
| `backend/app/Http/Controllers/AuthController.php` | 登录、登出、获取当前用户 |
| `backend/app/Http/Controllers/UserController.php` | 用户 CRUD |
| `backend/app/Http/Controllers/RoleController.php` | 角色 CRUD + 权限分配 |
| `backend/app/Http/Controllers/MenuController.php` | 菜单树 CRUD + 权限过滤 |
| `backend/app/Http/Controllers/UploadController.php` | 通用文件上传 |
| `backend/app/Services/StorageService.php` | 多驱动存储封装 |
| `backend/app/Models/Menu.php` | 自关联树形模型 |
| `backend/app/Models/User.php` | 扩展字段 + HasMenuPermissions Trait |
| `backend/app/Models/Role.php` | 角色模型 |
| `backend/app/Traits/HasMenuPermissions.php` | 用户权限查询 Trait |
| `backend/app/Http/Middleware/CheckMenuPermission.php` | 自定义菜单权限鉴权中间件 |
| `backend/app/Services/PermissionService.php` | 权限查询与缓存服务 |
| `backend/database/migrations/xxxx_add_fields_to_users.php` | 用户表扩展迁移 |
| `backend/database/migrations/xxxx_create_roles_table.php` | 角色表迁移 |
| `backend/database/migrations/xxxx_create_menus_table.php` | 菜单/权限表迁移 |
| `backend/database/migrations/xxxx_create_role_has_menus_table.php` | 角色菜单关联迁移 |
| `backend/database/seeders/MenusSeeder.php` | 菜单/权限树预设数据 |
| `backend/database/seeders/RolesSeeder.php` | 角色预设数据 |
| `backend/database/seeders/UserSeeder.php` | 初始超管账号 |

---

## 10. 验证策略

### 10.1 每阶段验证清单

**Phase 1（脚手架）**：
- `php artisan serve` 访问 `http://127.0.0.1:8000` 显示 Laravel 欢迎页

**Phase 3（认证与权限数据）**：
- `php artisan migrate --seed` 成功，数据库有用户/角色/权限/菜单数据
- `POST /api/login` 返回 `{ user, token }`
- `GET /api/user`（Header 携带 `Authorization: Bearer <token>`）返回当前用户信息及权限列表

**Phase 5（用户管理）**：
- `GET /api/users?name=admin` 返回分页列表
- `POST /api/users` 创建用户并分配角色
- `PUT /api/users/{id}` 更新用户状态/有效期
- `DELETE /api/users/{id}` 删除用户

**Phase 6（角色权限模块）**：
- `GET /api/roles` 返回角色列表
- `POST /api/roles` 创建角色并勾选权限（分配给非超管用户）
- `GET /api/menus` 以超管（id=1）登录返回完整菜单树；以普通角色登录返回过滤后的菜单树（侧边栏和按钮同步变化）

**Phase 8（收尾）**：
- 全新环境按 README 执行 `composer install`, `php artisan migrate --seed`, `php artisan serve` 能正常启动
- 前端 `npm run dev` 登录后能正常访问用户管理、角色管理、菜单管理

### 10.2 端到端验证路径

登录（获取 Token）→ 查看当前用户及菜单树 → 用户列表 → 创建用户 → 分配角色 → 切换账号 → 验证菜单和按钮权限变化 → 登出

---

## 附录：已知风险

1. **自定义权限维护成本**：放弃 Spatie 后，所有鉴权逻辑（中间件、缓存、查询）需自行实现，后续升级和维护工作量高于使用成熟包。
2. **Token 存储安全**：前端存储 token 存在 XSS 风险，需确保前端严格防范 XSS；或后续考虑使用 httpOnly cookie 存储 token（需额外封装）。
3. **Windows 路径**：Laravel Storage 本地路径在 Windows 下正常，但生产部署到 Linux 时需注意路径分隔符。
@