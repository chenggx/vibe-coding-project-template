# 后端开发进度跟踪

## 说明

- 主 Agent 读取此文件，找到第一个 `[ ]` 任务执行。
- 每完成一个任务，子 Agent 将 `[ ]` 改为 `[x]`，并追加简要备注。
- 严格按 Phase 顺序推进，前一 Phase 全部 `[x]` 后才能进入下一 Phase。
- 每个任务完成后必须满足：**`php artisan test` 通过** + **`./vendor/bin/pint` 通过**。
- 实现细节参考 `doc/backend-detailed-plan.md` 中对应任务的 "Vibe Coding 指令块"。

---

## Phase 1: 项目脚手架

- [x] 1.1 初始化 Laravel 12 + 安装 Sanctum + 配置 SQLite（.env 数据库配置、创建 database.sqlite 文件）
- [x] 1.2 配置 Sanctum Token 认证（config/sanctum.php 关闭 SPA 配置、bootstrap/app.php 中间件注册）
- [x] 1.3 配置 CORS + 文件系统（config/cors.php 允许前端域名、config/filesystems.php public 磁盘、storage:link）

**Phase 1 验证**：`php artisan serve` 访问 `http://127.0.0.1:8000` 显示 Laravel 欢迎页。

---

## Phase 2: 数据库迁移

- [x] 2.1 用户表扩展迁移（avatar, status, expires_at, remarks）
- [x] 2.2 菜单/权限表迁移（menus，自关联树形结构）
- [x] 2.3 角色表迁移（roles）
- [x] 2.4 角色菜单关联表迁移（role_has_menus，联合主键）
- [x] 2.5 用户角色关联表迁移（user_has_roles，联合主键，补充）

**Phase 2 验证**：`php artisan migrate:fresh` 成功，无报错。

---

## Phase 3: 认证与权限数据

- [x] 3.1 菜单/权限 Seeder（MenusSeeder，写入 14 个节点的完整树）
- [x] 3.2 角色 Seeder（RolesSeeder，editor 和 viewer 两个角色并关联菜单）
- [x] 3.3 用户 Seeder（UserSeeder，id=1 超管 admin@example.com / password，不分配角色）

**Phase 3 验证**：`php artisan migrate --seed` 成功，数据库数据正确。users 表 id=1，menus 表 14 条记录，roles 表 2 条记录，role_has_menus 关联正确。

---

## Phase 4: 基础服务、中间件、模型与认证

> **执行顺序说明**：原详细设计中 Phase 3 的 Controller（3.4~3.6）依赖 ApiResponse 和模型关联（Phase 4 才实现），因此移至 Phase 4 末尾执行。

- [x] 4.1 ApiResponse 统一响应封装（app/Support/ApiResponse.php：success / error / paginate）
- [x] 4.2 EnsureUserIsActive 中间件（检查 status + expires_at，返回 10002）
- [x] 4.3 HasMenuPermissions Trait（permissionNames / hasMenuPermission / menus，含缓存逻辑）
- [x] 4.4 PermissionService 权限查询缓存服务（getUserPermissions / clearUserPermissionCache / clearAllPermissionCache）
- [x] 4.5 CheckMenuPermission 中间件（自定义权限鉴权，超管放行，返回 10003）
- [x] 4.6 api.php 路由配置（所有路由定义 + 中间件别名 active / menu.permission 注册）
- [x] 4.7 模型关联实现（User/Role/Menu 模型及关联，Menu 模型添加 toTree 静态方法）
- [x] 4.8 修改超管密码 Artisan 命令（admin:reset-password，交互式输入，只改 id=1）
- [x] 3.4 登录接口 POST /api/login（AuthController@login，验证邮箱密码+状态+有效期）
- [x] 3.5 登出接口 POST /api/logout（AuthController@logout，清理 Session）
- [x] 3.6 获取当前用户接口 GET /api/user（AuthController@me，返回用户信息+roles+menus树）

**Phase 4 验证**：
- `php artisan test` 全部通过。
- `./vendor/bin/pint` 无错误。
- curl 登录流程成功并获取 Token，GET /api/user（携带 Authorization: Bearer <token>）返回正确数据。

---

## Phase 5: 用户管理

- [x] 5.1 用户列表 GET /api/users（分页、name/email 搜索、with roles）
- [x] 5.2 创建用户 POST /api/users（可分配角色 role_ids）
- [x] 5.3 用户详情 GET /api/users/{id}（with roles）
- [x] 5.4 更新用户 PUT /api/users/{id}（id=1 返回 10005，可更新角色）
- [x] 5.5 删除用户 DELETE /api/users/{id}（id=1 返回 10005，清理角色关联）

**Phase 5 验证**：
- Feature Test 覆盖 UserController 所有方法。
- `PUT /api/users/1` 返回 `code=10005`。
- `DELETE /api/users/1` 返回 `code=10005`。
- 创建用户时分配角色，数据库关联正确。

---

## Phase 6: 角色与菜单管理

- [x] 6.1 角色列表 GET /api/roles（分页、withCount users）
- [x] 6.2 创建角色 POST /api/roles（含 menu_ids 权限分配）
- [x] 6.3 角色详情 GET /api/roles/{id}（with menus）
- [x] 6.4 更新角色 PUT /api/roles/{id}（含 menu_ids 权限分配，清除缓存）
- [x] 6.5 删除角色 DELETE /api/roles/{id}（清理关联，清除缓存）
- [x] 6.6 当前用户菜单树 GET /api/menus（过滤后的树，只含 catalog/menu 类型）
- [x] 6.7 完整菜单树 GET /api/menus/all（含所有类型，需 menu.view 权限）
- [x] 6.8 创建菜单节点 POST /api/menus（类型规则校验、防非法父子关系）
- [x] 6.9 更新菜单节点 PUT /api/menus/{id}（防循环引用、防非法类型变更）
- [x] 6.10 删除菜单节点 DELETE /api/menus/{id}（有子节点返回 10008）

**Phase 6 验证**：
- Feature Test 覆盖 RoleController 和 MenuController 所有方法。
- 超管 `GET /api/menus` 返回完整菜单树（catalog + menu）。
- 普通用户 `GET /api/menus` 返回按角色过滤的菜单树。
- `DELETE /api/menus/1`（有子节点）返回 `code=10008`。
- 修改角色权限后，关联用户重新登录菜单树同步变化。

---

## Phase 7: 文件上传

- [x] 7.1 StorageService 多驱动封装（local / OSS / 七牛云，upload 统一入口）
- [x] 7.2 通用上传接口 POST /api/upload（avatars 目录、图片限制 2MB、返回 URL）

**Phase 7 验证**：
- `POST /api/upload` 上传 jpg/png 返回可访问 URL。
- 访问返回的 URL 能正常显示图片。

---

## Phase 8: 收尾与验证

- [x] 8.1 README 启动文档（环境要求、安装步骤、默认账号、API 格式、前端对接说明）
- [x] 8.2 端到端验证（按 backend-detailed-plan.md 8.2 的 12 步 curl 清单逐条执行）

**Phase 8 验证**：
- 全新环境按 README 能完整启动。
- 端到端 curl 验证全部通过。
- `php artisan test` 全部通过。
- `./vendor/bin/pint` 无错误。

---

## 备注区

- 认证方案已从 Sanctum SPA Cookie 切换为 Sanctum Token (Bearer)。前端需在请求头中携带 `Authorization: Bearer <token>`，后端不再依赖 Cookie / CSRF / stateful 域名配置。
