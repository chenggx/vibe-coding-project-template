# 后台详细代码生成计划（Backend Detailed Plan）

## 1. 概述

本文档将 `backend-plan.md` 中的需求拆分为**最小可执行任务**，按 API 端点粒度编排。每个任务附带可直接用于 AI 代码生成工具的 **Vibe Coding 指令块**，包含完整上下文、边界条件和验证标准。

### 1.1 核心约束

- **框架**：Laravel 12（PHP 8.2+）
- **数据库**：SQLite（开发期），`.env` 预留 MySQL 切换
- **认证**：Laravel Sanctum SPA Cookie
- **权限模型**：菜单即权限，一张 `menus` 表；id=1 为超级管理员，天然全权限，不可禁用/删除/改有效期
- **存储**：头像上传支持 local / 阿里云 OSS / 七牛云
- **响应格式**：`{ code, message, data, meta? }`，code=0 为成功

### 1.2 执行原则

1. **严格按 Phase 顺序执行**，前一 Phase 验证通过后再进入下一 Phase
2. **每个任务独立完成一个 API 端点或一个核心服务类**
3. **代码即文档**：不在代码外写冗余注释，用命名表达意图
4. **边界条件已在指令块中明确**，AI 生成时必须遵守

---

## 2. 模块划分与依赖关系

```
Phase 1: 项目脚手架
├── 1.1 初始化 Laravel 12 + 基础配置
├── 1.2 配置 Sanctum SPA Cookie
└── 1.3 配置 CORS + 文件系统

Phase 2: 数据库迁移
├── 2.1 用户表扩展迁移
├── 2.2 菜单/权限表迁移
├── 2.3 角色表迁移
└── 2.4 角色菜单关联表迁移

Phase 3: 认证与权限数据
├── 3.1 菜单/权限 Seeder（完整树）
├── 3.2 角色 Seeder
├── 3.3 用户 Seeder（超管）
├── 3.4 登录接口 POST /api/login
├── 3.5 登出接口 POST /api/logout
└── 3.6 获取当前用户接口 GET /api/user

Phase 4: 基础服务与中间件
├── 4.1 ApiResponse 统一响应封装
├── 4.2 EnsureUserIsActive 中间件
├── 4.3 HasMenuPermissions Trait
├── 4.4 PermissionService 权限查询缓存服务
├── 4.5 CheckMenuPermission 中间件
└── 4.6 api.php 路由配置

Phase 5: 用户管理
├── 5.1 用户列表 GET /api/users
├── 5.2 创建用户 POST /api/users
├── 5.3 用户详情 GET /api/users/{id}
├── 5.4 更新用户 PUT /api/users/{id}
└── 5.5 删除用户 DELETE /api/users/{id}

Phase 6: 角色与菜单管理
├── 6.1 角色列表 GET /api/roles
├── 6.2 创建角色 POST /api/roles
├── 6.3 角色详情 GET /api/roles/{id}
├── 6.4 更新角色 PUT /api/roles/{id}
├── 6.5 删除角色 DELETE /api/roles/{id}
├── 6.6 当前用户菜单树 GET /api/menus
├── 6.7 完整菜单树 GET /api/menus/all
├── 6.8 创建菜单节点 POST /api/menus
├── 6.9 更新菜单节点 PUT /api/menus/{id}
└── 6.10 删除菜单节点 DELETE /api/menus/{id}

Phase 7: 文件上传
├── 7.1 StorageService 多驱动封装
└── 7.2 通用上传接口 POST /api/upload

Phase 8: 收尾与验证
├── 8.1 README 启动文档
└── 8.2 端到端验证
```

### 2.1 模块依赖矩阵

| 模块 | 依赖前置模块 |
|------|-------------|
| Phase 1 | 无 |
| Phase 2 | Phase 1 |
| Phase 3 | Phase 2 |
| Phase 4 | Phase 3 |
| Phase 5 | Phase 4 |
| Phase 6 | Phase 4 |
| Phase 7 | Phase 4 |
| Phase 8 | Phase 1~7 |

**关键依赖规则**：
- Phase 4 的 `CheckMenuPermission` 依赖 `HasMenuPermissions` 和 `PermissionService`
- Phase 5 的 `UserController` 依赖 `EnsureUserIsActive` + `CheckMenuPermission`
- Phase 6 的 `MenuController` 依赖 `PermissionService` 做菜单树过滤
- Phase 7 的 `UploadController` 依赖 `StorageService`

---

## 3. Phase 1: 项目脚手架

### 任务 1.1: 初始化 Laravel 12 项目

**目标**：创建 Laravel 12 项目，安装 Sanctum，配置 SQLite 数据库。

**Vibe Coding 指令块**：

```
在 backend/ 目录下执行以下操作：

1. 使用 Composer 创建 Laravel 12 项目：
   composer create-project laravel/laravel backend

2. 安装 Laravel Sanctum：
   cd backend && composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

3. 配置 .env 数据库为 SQLite：
   DB_CONNECTION=sqlite
   # 注释掉 DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD

4. 创建 database/database.sqlite 空文件。

5. 验证：php artisan serve 能访问到 Laravel 欢迎页。
```

---

### 任务 1.2: 配置 Sanctum SPA Cookie

**目标**：配置 Sanctum 为 SPA Cookie 模式，支持前端 localhost:5173。

**Vibe Coding 指令块**：

```
文件：backend/config/sanctum.php

修改 stateful 数组，包含前端域名：
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),

确保 guard 为 ['web']。

文件：backend/bootstrap/app.php

在 withRouting 之后，使用 withMiddleware 给 api 路由组添加 EnsureFrontendRequestsAreStateful：
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
})

注意：Laravel 12 中 bootstrap/app.php 是中间件配置入口。
```

---

### 任务 1.3: 配置 CORS 与文件系统

**目标**：允许前端跨域携带 Cookie，配置 public 磁盘。

**Vibe Coding 指令块**：

```
文件：backend/config/cors.php

修改配置：
'supports_credentials' => true,
'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],

文件：backend/config/filesystems.php

确认 disks 中已有 public：
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
    'throw' => false,
],

运行：php artisan storage:link
```

---

## 4. Phase 2: 数据库迁移

### 任务 2.1: 用户表扩展迁移

**目标**：在 Laravel 默认 users 表基础上扩展字段。

**Vibe Coding 指令块**：

```
文件：backend/database/migrations/xxxx_add_fields_to_users_table.php

创建迁移，扩展 users 表，增加以下字段（在已有 id/name/email/password/timestamps 基础上）：
- avatar: string, nullable, comment '头像 URL'
- status: boolean, default true, comment '1=启用, 0=禁用'
- expires_at: datetime, nullable, comment '账号有效期'
- remarks: text, nullable, comment '备注'

email 字段保持默认的 unique。
注意：不要删除 Laravel 默认的 email_verified_at 和 remember_token。
```

---

### 任务 2.2: 菜单/权限表迁移

**目标**：创建自关联树形结构的 menus 表。

**Vibe Coding 指令块**：

```
文件：backend/database/migrations/xxxx_create_menus_table.php

创建 menus 表，字段：
- id: bigIncrements
- parent_id: unsignedBigInteger, nullable, index, foreign key -> menus(id) on delete cascade
- name: string, comment '显示名称'
- type: enum('catalog', 'menu', 'permission'), comment '目录/菜单/权限点'
- path: string, nullable, comment '前端路由路径'
- icon: string, nullable, comment '图标标识'
- permission: string, nullable, unique, comment '权限标识，如 user.view'
- sort_order: integer, default 0, comment '排序权重'
- meta: json, nullable, comment '扩展配置'
- timestamps

约束：
- type=permission 时 path 和 icon 可为 null
- catalog 类型的 permission 必须为 null
- 添加索引 (parent_id) 和 (type)
```

---

### 任务 2.3: 角色表迁移

**Vibe Coding 指令块**：

```
文件：backend/database/migrations/xxxx_create_roles_table.php

创建 roles 表，字段：
- id: bigIncrements
- name: string, unique, comment '角色标识，如 editor'
- display_name: string, comment '显示名称，如 编辑者'
- description: text, nullable
- timestamps
```

---

### 任务 2.4: 角色菜单关联表迁移

**Vibe Coding 指令块**：

```
文件：backend/database/migrations/xxxx_create_role_has_menus_table.php

创建 role_has_menus 中间表，字段：
- role_id: unsignedBigInteger, foreign key -> roles(id) on delete cascade
- menu_id: unsignedBigInteger, foreign key -> menus(id) on delete cascade

联合主键：(role_id, menu_id)
不需要自增 id，不需要 timestamps。
```

---

## 5. Phase 3: 认证与权限数据

### 任务 3.1: 菜单/权限 Seeder

**目标**：写入完整的菜单/权限树，作为唯一权限数据源。

**Vibe Coding 指令块**：

```
文件：backend/database/seeders/MenusSeeder.php

实现 MenusSeeder，使用 Menu::insert() 写入以下树形结构（必须包含 id，确保后续关联正确）：

id=1: 系统管理, catalog, parent_id=null, path=null, icon='Setting', permission=null, sort_order=1
id=2: 用户管理, menu, parent_id=1, path=/users, icon='User', permission=user.view, sort_order=1
id=3: 新增用户, permission, parent_id=2, path=null, icon=null, permission=user.create, sort_order=1
id=4: 编辑用户, permission, parent_id=2, path=null, icon=null, permission=user.edit, sort_order=2
id=5: 删除用户, permission, parent_id=2, path=null, icon=null, permission=user.delete, sort_order=3
id=6: 角色管理, menu, parent_id=1, path=/roles, icon='Shield', permission=role.view, sort_order=2
id=7: 创建角色, permission, parent_id=6, path=null, icon=null, permission=role.create, sort_order=1
id=8: 编辑角色, permission, parent_id=6, path=null, icon=null, permission=role.edit, sort_order=2
id=9: 删除角色, permission, parent_id=6, path=null, icon=null, permission=role.delete, sort_order=3
id=10: 菜单管理, menu, parent_id=1, path=/menus, icon='Menu', permission=menu.view, sort_order=3
id=11: 创建菜单, permission, parent_id=10, path=null, icon=null, permission=menu.create, sort_order=1
id=12: 编辑菜单, permission, parent_id=10, path=null, icon=null, permission=menu.edit, sort_order=2
id=13: 删除菜单, permission, parent_id=10, path=null, icon=null, permission=menu.delete, sort_order=3
id=14: 文件上传, permission, parent_id=1, path=null, icon=null, permission=upload.image, sort_order=4

注意：
- catalog 类型 permission 为 null
- menu 类型有 path 和 permission
- permission 类型无 path 无 icon
```

---

### 任务 3.2: 角色 Seeder

**Vibe Coding 指令块**：

```
文件：backend/database/seeders/RolesSeeder.php

创建两个示例角色：
1. editor：显示名称"编辑者"，description"可管理用户和上传文件"
   关联 menu_ids: [2,3,4,14]（用户管理查看+新增+编辑，文件上传）
2. viewer：显示名称"查看者"，description"仅可查看"
   关联 menu_ids: [2,6,10]（仅查看用户、角色、菜单管理页面）

使用 DB::table('role_has_menus')->insert() 批量插入关联。
```

---

### 任务 3.3: 用户 Seeder

**Vibe Coding 指令块**：

```
文件：backend/database/seeders/UserSeeder.php

创建初始用户（id 必须为 1，即超级管理员）：
- name: 'Administrator'
- email: 'admin@example.com'
- password: Hash::make('password')
- avatar: null
- status: true
- expires_at: null
- remarks: null

不分配任何角色。id=1 即为超管，天然拥有所有权限。

在 DatabaseSeeder 中按顺序调用：
1. MenusSeeder
2. RolesSeeder
3. UserSeeder

运行 php artisan migrate --seed 验证数据正确写入。
```

---

### 任务 3.4: 登录接口 POST /api/login

**目标**：实现基于 Sanctum SPA Cookie 的登录。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/AuthController.php

方法：login(Request $request)

逻辑：
1. 验证输入：email (required|string|email), password (required|string)
2. 使用 Auth::attempt(['email' => $email, 'password' => $password, 'status' => true]) 尝试登录
   - 注意：attempt 会自动检查密码，但 status 条件需要手动加：先查用户，再验证密码和状态
3. 更优逻辑：
   $user = User::where('email', $email)->first();
   if (!$user || !Hash::check($password, $user->password)) {
       return ApiResponse::error(10001, '邮箱或密码错误');
   }
   if (!$user->status) {
       return ApiResponse::error(10002, '账号已禁用或已过期');
   }
   if ($user->expires_at && $user->expires_at <= now()) {
       return ApiResponse::error(10002, '账号已禁用或已过期');
   }
   Auth::login($user);
   return ApiResponse::success($user->load('roles'));

4. 返回数据包含用户基本信息 + roles 关联
5. 此时 HTTP 响应会自动携带 Set-Cookie（Sanctum + Session）

注意：ApiResponse 在 Phase 4 实现，Phase 3 验证时先用 array 返回。
```

---

### 任务 3.5: 登出接口 POST /api/logout

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/AuthController.php

方法：logout(Request $request)

逻辑：
1. 需要 auth:sanctum 中间件保护
2. Auth::guard('web')->logout();
3. $request->session()->invalidate();
4. $request->session()->regenerateToken();
5. return ApiResponse::success(null, '登出成功');
```

---

### 任务 3.6: 获取当前用户接口 GET /api/user

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/AuthController.php

方法：me(Request $request)

逻辑：
1. 需要 auth:sanctum 中间件
2. 返回当前登录用户完整信息：
   $user = Auth::user()->load(['roles', 'roles.menus']);
3. 如果是超管（id=1），menus 返回全部菜单树；否则返回按角色过滤的菜单树
4. 此接口在 Phase 6 菜单树过滤完成后补全菜单数据，Phase 3 先返回基础用户信息 + roles

返回格式：
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@example.com",
    "avatar": null,
    "status": true,
    "expires_at": null,
    "roles": [...],
    "menus": [...] // Phase 6 后补全
  }
}
```

---

## 6. Phase 4: 基础服务与中间件

### 任务 4.1: ApiResponse 统一响应封装

**目标**：创建全局响应辅助类。

**Vibe Coding 指令块**：

```
文件：backend/app/Support/ApiResponse.php

实现静态方法：

1. success($data = null, $message = 'success', $code = 0)
   返回 json ['code' => $code, 'message' => $message, 'data' => $data]

2. paginate($resource, $message = 'success')
   接受 Laravel 分页器（如 User::paginate() 的结果）
   返回 json [
     'code' => 0,
     'message' => $message,
     'data' => $resource->items(),
     'meta' => [
       'current_page' => $resource->currentPage(),
       'last_page' => $resource->lastPage(),
       'per_page' => $resource->perPage(),
       'total' => $resource->total(),
     ]
   ]

3. error($code, $message = 'error', $httpStatus = 200)
   返回 json ['code' => $code, 'message' => $message, 'data' => null]
   HTTP 状态码默认 200（前端统一按 code 判断），特殊情况可传 401/403

注意：所有 Controller 统一使用此类的静态方法返回，不允许直接 return response()->json()。
```

---

### 任务 4.2: EnsureUserIsActive 中间件

**目标**：检查用户状态与有效期。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Middleware/EnsureUserIsActive.php

实现 handle 方法：

1. 获取当前用户 $user = $request->user();
2. 如果 !$user，直接 $next($request)（让 auth 中间件处理未认证）
3. 如果 $user->status !== true：
   return ApiResponse::error(10002, '账号已禁用或已过期', 403);
4. 如果 $user->expires_at !== null && $user->expires_at <= now()：
   return ApiResponse::error(10002, '账号已禁用或已过期', 403);
5. 否则 $next($request)

注意：
- 此中间件挂载在 auth:sanctum 之后
- 只对已认证用户生效
- 超管（id=1）也要检查，但超管 status 永远为 true，expires_at 永远为 null
```

---

### 任务 4.3: HasMenuPermissions Trait

**目标**：为用户模型提供权限查询能力。

**Vibe Coding 指令块**：

```
文件：backend/app/Traits/HasMenuPermissions.php

实现以下方法（用于 User Model）：

1. permissionNames(): array
   逻辑：
   - 如果 $this->id === 1，返回 Menu::pluck('permission')->filter()->all()
   - 否则，查询用户所有角色的菜单节点的 permission 字段，去重，过滤 null
   - 使用缓存：cache()->tags(['user_permissions', "user:{$this->id}"])->remember(..., 3600, ...)
   - 缓存键："user_permissions:{$this->id}"

2. hasMenuPermission(string $permission): bool
   逻辑：
   - 如果 $this->id === 1，return true
   - 否则 return in_array($permission, $this->permissionNames())

3. menus(): Collection（返回该用户可访问的菜单树）
   逻辑：
   - 如果 $this->id === 1，return Menu::all()（后续由 MenuController 递归构树）
   - 否则，查询用户角色关联的所有 menu_id，返回 Menu::whereIn('id', $menuIds)->get()

4. roles(): belongsToMany(Role::class, 'role_has_menus', ...)? 不对
   注意：用户与角色的关系不是直接关联。根据需求，用户通过角色关联菜单。
   但需求文档中 User 与 Role 的关系没有明确定义中间表。
   
   重新设计：添加 user_has_roles 中间表？不对，需求文档没有这张表。
   需求文档说"其他用户通过角色关联菜单节点获得权限"，但没有说用户如何关联角色。
   
   检查需求：users 表没有 role_id 字段，也没有 user_has_roles 表。
   但 RolesSeeder 要分配给非超管用户。Phase 5 创建用户时"可分配角色"。
   
   **必须补充迁移**：创建 user_has_roles 中间表。

等一下，这是一个重要发现。需求文档中没有 user_has_roles 表，但用户管理需要"可分配角色"。
我需要在计划中补充这个迁移任务。

让我重新检查：需求文档 2.1~2.4 只有 users, menus, roles, role_has_menus 四张表。
但 API 设计中有"创建用户（可分配角色）"和"更新用户（可分配角色）"。
这意味着必须有一张 user_has_roles 表，或者 users 表有 role_id 字段。

由于是多对多关系（一个用户可以有多个角色，一个角色可以有多个用户），应该创建 user_has_roles 表。

我需要在 Phase 2 中补充这个迁移，并在各任务中体现。
```

---

**补充说明**：在审核过程中发现需求文档缺少 **用户-角色关联表**。由于用户管理需要"可分配角色"，必须在 Phase 2 中补充此迁移。以下是补充任务：

### 任务 2.5: 用户角色关联表迁移（补充）

**Vibe Coding 指令块**：

```
文件：backend/database/migrations/xxxx_create_user_has_roles_table.php

创建 user_has_roles 中间表，字段：
- user_id: unsignedBigInteger, foreign key -> users(id) on delete cascade
- role_id: unsignedBigInteger, foreign key -> roles(id) on delete cascade

联合主键：(user_id, role_id)
无自增 id，无 timestamps。

此表用于用户与角色的多对多关联。
```

---

### 任务 4.4: PermissionService 权限查询与缓存服务

**目标**：集中处理权限查询逻辑，管理缓存失效。

**Vibe Coding 指令块**：

```
文件：backend/app/Services/PermissionService.php

实现以下方法：

1. getUserPermissions(User $user): array
   返回用户拥有的所有 permission 字符串数组。
   超管返回所有非空 permission。
   普通用户返回其角色的菜单节点的 permission 去重数组。
   使用缓存 1 小时，缓存标签 ['permissions', "user:{$user->id}"]。

2. clearUserPermissionCache(User $user): void
   清除指定用户的权限缓存。
   cache()->tags(["user:{$user->id}"])->flush();

3. clearAllPermissionCache(): void
   清除所有权限缓存。
   cache()->tags(['permissions'])->flush();

注意：
- 任何修改 role_has_menus 的操作后必须调用 clearUserPermissionCache 或 clearAllPermissionCache
- 修改 menus 表的 permission 字段后必须调用 clearAllPermissionCache
- 使用 cache()->tags() 需要配置支持标签的缓存驱动（如 file 或 redis），开发期用 file 即可
```

---

### 任务 4.5: CheckMenuPermission 中间件

**目标**：自定义权限鉴权中间件。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Middleware/CheckMenuPermission.php

实现 handle($request, Closure $next, string $permission) 方法：

1. 获取当前用户 $user = $request->user();
2. 如果 $user->id === 1，直接 return $next($request);
3. 调用 $user->hasMenuPermission($permission)
4. 如果无权限：return ApiResponse::error(10003, '无权访问', 403);
5. 如果有权限：return $next($request);

路由用法（在 api.php 中）：
Route::post('/users', [UserController::class, 'store'])
    ->middleware(['auth:sanctum', 'active', 'menu.permission:user.create']);

注意：
- 中间件别名在 bootstrap/app.php 或 app/Providers/AppServiceProvider.php 中注册为 'menu.permission'
- 必须排在 auth:sanctum 和 active（EnsureUserIsActive）之后
```

---

### 任务 4.6: api.php 路由配置

**目标**：定义所有 API 路由，挂载正确的中间件组合。

**Vibe Coding 指令块**：

```
文件：backend/routes/api.php

路由定义：

// 公开路由
Route::post('/login', [AuthController::class, 'login']);

// 需认证路由组
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    // 认证
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // 上传
    Route::post('/upload', [UploadController::class, 'store'])
        ->middleware('menu.permission:upload.image');
    
    // 用户管理
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('menu.permission:user.view');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('menu.permission:user.create');
    Route::get('/users/{id}', [UserController::class, 'show'])
        ->middleware('menu.permission:user.view');
    Route::put('/users/{id}', [UserController::class, 'update'])
        ->middleware('menu.permission:user.edit');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('menu.permission:user.delete');
    
    // 角色管理
    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('menu.permission:role.view');
    Route::post('/roles', [RoleController::class, 'store'])
        ->middleware('menu.permission:role.create');
    Route::get('/roles/{id}', [RoleController::class, 'show'])
        ->middleware('menu.permission:role.view');
    Route::put('/roles/{id}', [RoleController::class, 'update'])
        ->middleware('menu.permission:role.edit');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])
        ->middleware('menu.permission:role.delete');
    
    // 菜单管理
    Route::get('/menus', [MenuController::class, 'index']); // 当前用户菜单树，不需要额外鉴权
    Route::get('/menus/all', [MenuController::class, 'all'])
        ->middleware('menu.permission:menu.view');
    Route::post('/menus', [MenuController::class, 'store'])
        ->middleware('menu.permission:menu.create');
    Route::put('/menus/{id}', [MenuController::class, 'update'])
        ->middleware('menu.permission:menu.edit');
    Route::delete('/menus/{id}', [MenuController::class, 'destroy'])
        ->middleware('menu.permission:menu.delete');
});

注意：
- 'active' 是 EnsureUserIsActive 中间件的别名
- 'menu.permission' 是 CheckMenuPermission 中间件的别名
- 别名在 bootstrap/app.php 或 AppServiceProvider 中注册
```

---

## 7. Phase 5: 用户管理

### 任务 5.1: 用户列表 GET /api/users

**目标**：分页查询用户，支持 name/email 搜索。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/UserController.php

方法：index(Request $request)

逻辑：
1. 验证查询参数：
   - name: string, nullable, max:255
   - email: string, nullable, max:255
   - per_page: integer, nullable, min:1, max:100, default:15
2. 构建查询：
   $query = User::query()->with('roles');
   if ($request->filled('name')) {
       $query->where('name', 'like', "%{$request->name}%");
   }
   if ($request->filled('email')) {
       $query->where('email', 'like', "%{$request->email}%");
   }
3. 排序：按 created_at desc
4. 返回：ApiResponse::paginate($query->paginate($request->input('per_page', 15)))

注意：
- 超管（id=1）也会出现在列表中
- 返回 data 中包含 roles 数组
```

---

### 任务 5.2: 创建用户 POST /api/users

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/UserController.php

方法：store(Request $request)

逻辑：
1. 验证输入：
   - name: required|string|max:255
   - email: required|email|unique:users
   - password: required|string|min:6
   - avatar: nullable|string|url
   - status: nullable|boolean
   - expires_at: nullable|date
   - remarks: nullable|string
   - role_ids: nullable|array
   - role_ids.*: integer|exists:roles,id
2. 创建用户：
   $user = User::create([
     'name' => $request->name,
     'email' => $request->email,
     'password' => Hash::make($request->password),
     'avatar' => $request->avatar,
     'status' => $request->boolean('status', true),
     'expires_at' => $request->expires_at,
     'remarks' => $request->remarks,
   ]);
3. 如果提供了 role_ids，同步关联：$user->roles()->sync($request->role_ids);
4. 返回：ApiResponse::success($user->load('roles'), '创建成功')

注意：
- password 由管理员明文指定，直接 Hash::make
- 新建用户默认 status=true，expires_at=null
- 需要同步实现 User 模型中的 roles() belongsToMany 关联
```

---

### 任务 5.3: 用户详情 GET /api/users/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/UserController.php

方法：show(int $id)

逻辑：
1. $user = User::with('roles')->find($id);
2. 如果 !$user：return ApiResponse::error(10004, '用户不存在');
3. 返回：ApiResponse::success($user)
```

---

### 任务 5.4: 更新用户 PUT /api/users/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/UserController.php

方法：update(Request $request, int $id)

逻辑：
1. $user = User::find($id);
2. 如果 !$user：return ApiResponse::error(10004, '用户不存在');
3. 如果 $user->id === 1：
   - 不允许修改 status（报错：10005, 不能修改超级管理员状态）
   - 不允许修改 expires_at（报错：10005, 不能修改超级管理员有效期）
   - 不允许删除（在 destroy 中处理）
4. 验证输入：
   - name: required|string|max:255
   - email: required|email|unique:users,email,{$id}
   - password: nullable|string|min:6
   - avatar: nullable|string|url
   - status: nullable|boolean
   - expires_at: nullable|date
   - remarks: nullable|string
   - role_ids: nullable|array
   - role_ids.*: integer|exists:roles,id
5. 更新字段：
   $user->name = $request->name;
   $user->email = $request->email;
   if ($request->filled('password')) {
       $user->password = Hash::make($request->password);
   }
   $user->avatar = $request->avatar;
   if ($user->id !== 1) {
       $user->status = $request->boolean('status', $user->status);
       $user->expires_at = $request->expires_at;
   }
   $user->remarks = $request->remarks;
   $user->save();
6. 同步角色：如果提供了 role_ids，$user->roles()->sync($request->role_ids);
7. 清除该用户权限缓存：app(PermissionService::class)->clearUserPermissionCache($user);
8. 返回：ApiResponse::success($user->load('roles'), '更新成功')
```

---

### 任务 5.5: 删除用户 DELETE /api/users/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/UserController.php

方法：destroy(int $id)

逻辑：
1. $user = User::find($id);
2. 如果 !$user：return ApiResponse::error(10004, '用户不存在');
3. 如果 $user->id === 1：return ApiResponse::error(10005, '不能删除超级管理员');
4. $user->roles()->detach(); // 清理角色关联
5. $user->delete();
6. 返回：ApiResponse::success(null, '删除成功')

注意：
- 删除用户后，其关联的 role_has_menus 通过外级联删除，但 user_has_roles 需要手动 detach 或设置外键级联
```

---

## 8. Phase 6: 角色与菜单管理

### 任务 6.1: 角色列表 GET /api/roles

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/RoleController.php

方法：index(Request $request)

逻辑：
1. 验证：per_page: integer, nullable, min:1, max:100, default:15
2. $query = Role::query()->withCount('users');
3. 排序：按 created_at desc
4. 返回：ApiResponse::paginate($query->paginate($request->input('per_page', 15)))

注意：
- withCount('users') 返回 users_count 字段
- 返回 data 中不包含 menus 全量数据，列表保持轻量
```

---

### 任务 6.2: 创建角色 POST /api/roles

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/RoleController.php

方法：store(Request $request)

逻辑：
1. 验证：
   - name: required|string|max:255|unique:roles
   - display_name: required|string|max:255
   - description: nullable|string
   - menu_ids: nullable|array
   - menu_ids.*: integer|exists:menus,id
2. $role = Role::create($request->only(['name', 'display_name', 'description']));
3. 如果提供了 menu_ids，$role->menus()->sync($request->menu_ids);
4. app(PermissionService::class)->clearAllPermissionCache();
5. 返回：ApiResponse::success($role->load('menus'), '创建成功')

注意：
- Role 模型需要定义 menus() belongsToMany(Menu::class, 'role_has_menus') 关联
- 创建角色后清除所有权限缓存，因为可能影响所有用户
```

---

### 任务 6.3: 角色详情 GET /api/roles/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/RoleController.php

方法：show(int $id)

逻辑：
1. $role = Role::with('menus')->find($id);
2. 如果 !$role：return ApiResponse::error(10006, '角色不存在');
3. 返回：ApiResponse::success($role)

注意：
- 返回的 menus 是扁平数组，不是树形结构
```

---

### 任务 6.4: 更新角色 PUT /api/roles/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/RoleController.php

方法：update(Request $request, int $id)

逻辑：
1. $role = Role::find($id);
2. 如果 !$role：return ApiResponse::error(10006, '角色不存在');
3. 验证：
   - name: required|string|max:255|unique:roles,name,{$id}
   - display_name: required|string|max:255
   - description: nullable|string
   - menu_ids: nullable|array
   - menu_ids.*: integer|exists:menus,id
4. $role->update($request->only(['name', 'display_name', 'description']));
5. 如果提供了 menu_ids，$role->menus()->sync($request->menu_ids);
6. app(PermissionService::class)->clearAllPermissionCache();
7. 返回：ApiResponse::success($role->load('menus'), '更新成功')

注意：
- sync 会自动处理新增和删除的关联
- 修改角色的 menus 会影响所有拥有该角色的用户，所以清除全部缓存
```

---

### 任务 6.5: 删除角色 DELETE /api/roles/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/RoleController.php

方法：destroy(int $id)

逻辑：
1. $role = Role::find($id);
2. 如果 !$role：return ApiResponse::error(10006, '角色不存在');
3. $role->menus()->detach();
4. $role->delete();
5. app(PermissionService::class)->clearAllPermissionCache();
6. 返回：ApiResponse::success(null, '删除成功')

注意：
- user_has_roles 中的关联会通过外键级联删除（如果迁移中设置了 onDelete cascade）
```

---

### 任务 6.6: 当前用户菜单树 GET /api/menus

**目标**：返回当前登录用户可见的菜单树（用于前端侧边栏）。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/MenuController.php

方法：index(Request $request)

逻辑：
1. 获取当前用户 $user = $request->user();
2. 如果 $user->id === 1：
   $menus = Menu::all();
3. 否则：
   $menuIds = $user->roles()->with('menus')->get()
     ->pluck('menus.*.id')->flatten()->unique()->toArray();
   $menus = Menu::whereIn('id', $menuIds)->get();
4. 构建树形结构：
   $tree = $this->buildTree($menus);
5. 过滤：只保留 type=catalog 和 type=menu 的节点，type=permission 不显示在侧边栏
6. 递归清理空父节点（如果一个 catalog 下没有可见的 menu 子节点，则移除该 catalog）
7. 按 sort_order 排序（每一层单独排序）
8. 返回：ApiResponse::success($tree)

buildTree(Collection $menus, ?int $parentId = null): array
   - 筛选 parent_id === $parentId 的节点
   - 对每个节点递归构建 children
   - 按 sort_order asc 排序
   - 返回数组

注意：
- 此接口不需要 menu.permission 中间件，任何已认证用户都可访问自己的菜单
- permission 类型节点不返回给前端渲染侧边栏，但用户仍然拥有这些权限（用于按钮控制和后端鉴权）
```

---

### 任务 6.7: 完整菜单树 GET /api/menus/all

**目标**：返回完整菜单/权限树，用于管理界面。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/MenuController.php

方法：all(Request $request)

逻辑：
1. $menus = Menu::all();
2. 构建完整树形结构（包含 catalog/menu/permission 所有类型）
3. 按 sort_order 排序
4. 返回：ApiResponse::success($tree)

注意：
- 此接口需要 menu.view 权限
- 返回的 tree 中包含所有 type，前端用此数据做权限分配（勾选框）
```

---

### 任务 6.8: 创建菜单节点 POST /api/menus

**目标**：创建新的菜单/权限/目录节点。

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/MenuController.php

方法：store(Request $request)

逻辑：
1. 验证：
   - parent_id: nullable|integer|exists:menus,id
   - name: required|string|max:255
   - type: required|in:catalog,menu,permission
   - path: nullable|string|max:255
   - icon: nullable|string|max:255
   - permission: nullable|string|max:255|unique:menus
   - sort_order: nullable|integer|default:0
   - meta: nullable|json
2. 业务规则校验：
   - 如果 type=catalog：permission 必须为 null，path 必须为 null
   - 如果 type=permission：path 必须为 null，icon 必须为 null
   - 如果 type=menu：permission 必须不为 null，path 必须不为 null
   - 如果 parent_id 对应的父节点 type=permission，报错：不能将节点挂在权限点下
3. $menu = Menu::create($validated);
4. app(PermissionService::class)->clearAllPermissionCache();
5. 返回：ApiResponse::success($menu, '创建成功')

注意：
- catalog 不允许有 permission 标识
- 所有 type=permission 的节点都不应该有 children
```

---

### 任务 6.9: 更新菜单节点 PUT /api/menus/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/MenuController.php

方法：update(Request $request, int $id)

逻辑：
1. $menu = Menu::find($id);
2. 如果 !$menu：return ApiResponse::error(10007, '菜单不存在');
3. 验证规则同 store，但 permission 的 unique 排除当前 id
4. 业务规则校验同 store
5. 额外校验：
   - 不能将当前节点修改为自己的子节点（避免循环引用）
   - 如果当前节点有 children，则不允许将其 type 改为 permission
   - 如果当前节点 type=catalog 且有 children，不允许将 type 改为 menu 或 permission
6. $menu->update($validated);
7. app(PermissionService::class)->clearAllPermissionCache();
8. 返回：ApiResponse::success($menu, '更新成功')

注意：
- 修改 permission 字段会直接影响所有引用该权限的地方
- 清除全部权限缓存是必要的
```

---

### 任务 6.10: 删除菜单节点 DELETE /api/menus/{id}

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/MenuController.php

方法：destroy(int $id)

逻辑：
1. $menu = Menu::find($id);
2. 如果 !$menu：return ApiResponse::error(10007, '菜单不存在');
3. 检查是否有子节点：
   $childrenCount = Menu::where('parent_id', $id)->count();
   if ($childrenCount > 0) {
       return ApiResponse::error(10008, '该菜单下有子节点，请先删除子节点');
   }
4. $menu->delete();
5. app(PermissionService::class)->clearAllPermissionCache();
6. 返回：ApiResponse::success(null, '删除成功')

注意：
- 严格禁止级联删除：有子节点时必须先手动删除所有子节点
- 删除后，role_has_menus 中的关联会自动级联删除（如果迁移设置了外键 onDelete cascade）
- 如果删除的节点被某个角色引用，该角色的权限会自然减少
```

---

## 9. Phase 7: 文件上传

### 任务 7.1: StorageService 多驱动封装

**目标**：统一封装本地、阿里云 OSS、七牛云上传。

**Vibe Coding 指令块**：

```
文件：backend/app/Services/StorageService.php

实现以下方法：

1. upload(UploadedFile $file, string $path = 'images'): string
   - 根据 config('filesystems.default') 或 env('STORAGE_DRIVER', 'local') 分发
   - 生成文件名：{uuid}.{extension}
   - 返回可公网访问的完整 URL

2. uploadLocal(UploadedFile $file, string $path): string
   - 使用 Storage::disk('public')
   - $file->store($path, 'public')
   - 返回 asset('storage/' . $storedPath)

3. uploadOss(UploadedFile $file, string $path): string
   - 使用 aliyuncs/oss-sdk-php（需 composer require aliyuncs/oss-sdk-php）
   - 从 .env 读取 OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET, OSS_ENDPOINT
   - 上传到 OSS
   - 返回拼接的公网 URL：https://{bucket}.{endpoint}/{objectPath}

4. uploadQiniu(UploadedFile $file, string $path): string
   - 使用 qiniu/php-sdk（需 composer require qiniu/php-sdk）
   - 从 .env 读取 QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET, QINIU_DOMAIN
   - 上传到七牛云
   - 返回拼接的 URL：https://{domain}/{objectPath}

注意：
- 开发期先用 local 驱动验证，后续再接入 OSS/七牛云
- .env 中需有 STORAGE_DRIVER=local
- 不强制要求一期实现 OSS 和 七牛云的上传逻辑，但接口要预留
```

---

### 任务 7.2: 通用上传接口 POST /api/upload

**Vibe Coding 指令块**：

```
文件：backend/app/Http/Controllers/UploadController.php

方法：store(Request $request)

逻辑：
1. 验证：
   - file: required|file|mimes:jpg,jpeg,png,gif|max:2048
2. $url = app(StorageService::class)->upload($request->file('file'), 'avatars');
3. 返回：ApiResponse::success(['url' => $url], '上传成功')

注意：
- 默认上传到 avatars 目录
- 返回的 url 可直接用于 img src 或存入数据库 avatar 字段
- 此接口需要 upload.image 权限
```

---

## 10. Phase 8: 收尾与验证

### 任务 8.1: README 启动文档

**目标**：编写项目启动说明。

**Vibe Coding 指令块**：

```
文件：backend/README.md

内容需包含：
1. 环境要求：PHP 8.2+, Composer, SQLite
2. 安装步骤：
   - git clone
   - composer install
   - cp .env.example .env
   - 修改 .env 中 APP_URL, FRONTEND_URL, DB_CONNECTION=sqlite
   - touch database/database.sqlite
   - php artisan migrate --seed
   - php artisan storage:link
   - php artisan serve
3. 默认账号：admin@example.com / password
4. 前端对接说明：
   - 前端需先请求 GET /sanctum/csrf-cookie
   - 再携带 Cookie 请求其他接口
   - 前端地址默认 http://localhost:5173
5. 存储驱动切换：修改 .env STORAGE_DRIVER
6. API 响应格式说明
```

---

### 任务 8.2: 端到端验证

**目标**：按验证路径执行完整测试。

**Vibe Coding 指令块**：

```
执行以下端到端验证路径：

1. 全新环境安装：
   composer install && php artisan migrate --seed && php artisan serve

2. 获取 CSRF Cookie：
   curl -c cookies.txt http://127.0.0.1:8000/sanctum/csrf-cookie

3. 超管登录：
   curl -b cookies.txt -X POST http://127.0.0.1:8000/api/login \
     -H "Content-Type: application/json" \
     -H "X-XSRF-TOKEN: $(cat cookies.txt | grep XSRF | awk '{print $7}')" \
     -d '{"email":"admin@example.com","password":"password"}'
   验证：返回 code=0，data 包含 id=1，Set-Cookie 存在

4. 获取当前用户：
   curl -b cookies.txt http://127.0.0.1:8000/api/user
   验证：返回完整用户信息，menus 包含全部菜单树

5. 获取完整菜单树：
   curl -b cookies.txt http://127.0.0.1:8000/api/menus/all
   验证：返回包含 catalog/menu/permission 的树

6. 创建普通用户：
   curl -b cookies.txt -X POST http://127.0.0.1:8000/api/users \
     -H "Content-Type: application/json" \
     -H "X-XSRF-TOKEN: ..." \
     -d '{"name":"Test","email":"test@example.com","password":"123456","role_ids":[1]}'
   验证：返回 code=0

7. 以普通用户登录，验证菜单树过滤：
   - 登录 test@example.com
   - GET /api/menus 应只返回该角色授权的菜单
   - GET /api/menus/all 应返回 403（若无 menu.view 权限）

8. 测试超管保护：
   - PUT /api/users/1 修改 status 或 expires_at → 应被拒绝
   - DELETE /api/users/1 → 应被拒绝

9. 测试菜单删除约束：
   - DELETE /api/menus/1（系统管理，有子节点）→ 应返回"请先删除子节点"
   - 先删除所有子节点，再删除 catalog → 应成功

10. 测试用户状态中间件：
    - 禁用某个普通用户
    - 该用户再次请求 → 应返回 10002 账号已禁用

11. 文件上传：
    - POST /api/upload 上传图片 → 返回可访问 URL
    - 访问返回的 URL 应能正常显示图片

12. 登出：
    - POST /api/logout → 成功
    - 再次 GET /api/user → 应返回 401 未认证
```

---

## 11. 模型关联关系汇总

为确保所有 Controller 和 Service 的关联调用一致，以下是模型必须实现的关联：

### User 模型

```php
// app/Models/User.php

use HasMenuPermissions; // Trait

public function roles(): BelongsToMany {
    return $this->belongsToMany(Role::class, 'user_has_roles');
}
```

### Role 模型

```php
// app/Models/Role.php

public function users(): BelongsToMany {
    return $this->belongsToMany(User::class, 'user_has_roles');
}

public function menus(): BelongsToMany {
    return $this->belongsToMany(Menu::class, 'role_has_menus');
}
```

### Menu 模型

```php
// app/Models/Menu.php

public function parent(): BelongsTo {
    return $this->belongsTo(self::class, 'parent_id');
}

public function children(): HasMany {
    return $this->hasMany(self::class, 'parent_id');
}

public function roles(): BelongsToMany {
    return $this->belongsToMany(Role::class, 'role_has_menus');
}
```

---

## 12. 错误码定义

| 错误码 | 含义 | 触发场景 |
|--------|------|----------|
| 0 | 成功 | 所有成功响应 |
| 10001 | 邮箱或密码错误 | 登录失败 |
| 10002 | 账号已禁用或已过期 | EnsureUserIsActive 拦截 |
| 10003 | 无权访问 | CheckMenuPermission 拦截 |
| 10004 | 用户不存在 | 操作用户时 ID 不存在 |
| 10005 | 不能修改/删除超级管理员 | 对 id=1 执行禁用/删有效期/删除 |
| 10006 | 角色不存在 | 操作角色时 ID 不存在 |
| 10007 | 菜单不存在 | 操作菜单时 ID 不存在 |
| 10008 | 请先删除子节点 | 删除有子节点的菜单 |

---

## 13. 文件清单（按执行顺序）

| 顺序 | 文件路径 | 所属 Phase | 所属任务 |
|------|----------|-----------|----------|
| 1 | `.env` | 1 | 1.1 |
| 2 | `config/sanctum.php` | 1 | 1.2 |
| 3 | `bootstrap/app.php` | 1 | 1.2 |
| 4 | `config/cors.php` | 1 | 1.3 |
| 5 | `config/filesystems.php` | 1 | 1.3 |
| 6 | `database/migrations/xxxx_add_fields_to_users_table.php` | 2 | 2.1 |
| 7 | `database/migrations/xxxx_create_menus_table.php` | 2 | 2.2 |
| 8 | `database/migrations/xxxx_create_roles_table.php` | 2 | 2.3 |
| 9 | `database/migrations/xxxx_create_role_has_menus_table.php` | 2 | 2.4 |
| 10 | `database/migrations/xxxx_create_user_has_roles_table.php` | 2 | 2.5 |
| 11 | `database/seeders/MenusSeeder.php` | 3 | 3.1 |
| 12 | `database/seeders/RolesSeeder.php` | 3 | 3.2 |
| 13 | `database/seeders/UserSeeder.php` | 3 | 3.3 |
| 14 | `database/seeders/DatabaseSeeder.php` | 3 | 3.3 |
| 15 | `app/Http/Controllers/AuthController.php` | 3 | 3.4~3.6 |
| 16 | `app/Support/ApiResponse.php` | 4 | 4.1 |
| 17 | `app/Http/Middleware/EnsureUserIsActive.php` | 4 | 4.2 |
| 18 | `app/Traits/HasMenuPermissions.php` | 4 | 4.3 |
| 19 | `app/Services/PermissionService.php` | 4 | 4.4 |
| 20 | `app/Http/Middleware/CheckMenuPermission.php` | 4 | 4.5 |
| 21 | `routes/api.php` | 4 | 4.6 |
| 22 | `app/Models/User.php` | 4~5 | 关联 |
| 23 | `app/Models/Role.php` | 4~6 | 关联 |
| 24 | `app/Models/Menu.php` | 4~6 | 关联 |
| 25 | `app/Http/Controllers/UserController.php` | 5 | 5.1~5.5 |
| 26 | `app/Http/Controllers/RoleController.php` | 6 | 6.1~6.5 |
| 27 | `app/Http/Controllers/MenuController.php` | 6 | 6.6~6.10 |
| 28 | `app/Services/StorageService.php` | 7 | 7.1 |
| 29 | `app/Http/Controllers/UploadController.php` | 7 | 7.2 |
| 30 | `README.md` | 8 | 8.1 |

---

*本文档由 backend-plan.md 自动生成，所有边界条件和行为约束已根据用户确认更新。执行时请严格按 Phase 顺序推进，每 Phase 完成后对照对应验证清单检查。*
