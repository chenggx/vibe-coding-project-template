# 项目功能清单与待办

## 一、已实现的功能模块

### 1. 认证与账户
- 登录（`/login`）— 邮箱+密码，Sanctum Token，限流保护
- 登出（`/logout`）
- 获取当前用户（`/user`）— 含角色、权限菜单树
- 个人资料（`/profile`）— 修改名字、头像、密码
- 文件上传（`/upload`）— 头像上传

### 2. 用户管理（`/users`）
- 列表（分页、搜索姓名/邮箱）
- 新增、编辑、删除
- 状态启用/禁用、有效期、备注、头像、角色分配（单角色）
- 后端权限：`users.index` / `users.store` / `users.show` / `users.update` / `users.destroy`

### 3. 角色管理（`/roles`）
- 列表（分页）
- 新增、编辑、删除
- 关联菜单权限
- 后端权限：`roles.index` / `roles.store` / `roles.show` / `roles.update` / `roles.destroy`

### 4. 菜单管理（`/menus`）
- 树形展示
- 新增（目录/菜单/权限）、编辑、删除
- 后端权限：`menus.index`（公开给认证用户） / `menus.all` / `menus.store` / `menus.update` / `menus.destroy`

### 5. 仪表盘（`/dashboard`）
- 统计卡片（用户数、角色数、菜单数）
- 快捷入口
- 最近活动

---

## 二、已有数据库表

| 表名 | 说明 |
|------|------|
| `users` | 用户表（含 status、expires_at、avatar、remarks） |
| `roles` | 角色表 |
| `menus` | 菜单表（树形，catalog/menu/permission） |
| `user_has_roles` | 用户-角色关联 |
| `role_has_menus` | 角色-菜单关联 |
| `personal_access_tokens` | Sanctum Token |
| `cache` / `jobs` | Laravel 系统表 |

---

## 三、前后端已对接页面

| 页面路径 | 对应接口 | 权限要求 |
|----------|----------|----------|
| `/login` | `POST /login` | 公开 |
| `/dashboard` | `GET /users`, `GET /roles`, `GET /menus/all` | 需登录 |
| `/users` | `GET/POST/PUT/DELETE /users` | `users.index` |
| `/roles` | `GET/POST/PUT/DELETE /roles` | `roles.index` |
| `/menus` | `GET/POST/PUT/DELETE /menus/*` | `menus.all` |
| `/profile` | `PUT /profile`, `POST /upload` | 需登录 |

---

## 四、待实现基础功能

### 高优先级（建议优先补齐）

- [ ] **操作日志 / 审计日志**
  - 新增 `operation_logs` 表
  - 记录用户关键操作（增删改）
  - 后端中间件自动记录
  - 前端管理页面（列表、筛选、详情）

- [ ] **登录日志**
  - 新增 `login_logs` 表
  - 记录登录时间、IP、设备、结果（成功/失败）
  - 前端管理页面

- [ ] **系统设置 / 参数配置**
  - 新增 `settings` 表（key-value）
  - 支持站点名称、Logo、登录页配置、密码策略等
  - 前端配置管理页面

- [ ] **通知/消息中心**
  - 新增 `notifications` 表
  - 站内消息、系统公告
  - Header 右上角消息提醒入口
  - 消息列表页面

- [ ] **导入导出**
  - 用户、角色列表支持 Excel 批量导入/导出
  - 后端集成 `maatwebsite/excel` 或 `openspout`

### 中优先级（增强体验）

- [*] **面包屑导航**
  - AppLayout 中增加面包屑组件
  - 根据当前路由自动生成

- [ ] **404 页面**
  - 独立 404 页面，替代当前直接跳转到 dashboard

- [ ] **数据字典**
  - 新增 `dictionaries` 表
  - 集中维护枚举值（用户状态、性别等）
  - 前端字典管理页面

- [ ] **批量操作**
  - 用户/角色/菜单列表增加批量删除、批量启用/禁用

- [ ] **全屏 / 页面搜索**
  - Header 补充全屏切换、页面快速搜索等快捷操作

### 低优先级（锦上添花）

- [ ] **部门/组织架构**
  - 新增 `departments` 表
  - 树形部门管理
  - 用户绑定部门

- [ ] **在线用户管理**
  - 查看当前在线用户
  - 强制下线功能

- [ ] **定时任务管理**
  - 可视化定时任务配置
  - 任务执行日志

- [ ] **系统监控 / 服务器信息**
  - Dashboard 扩展：磁盘、内存、CPU、接口 QPS

- [ ] **锁屏功能**
  - 快捷键或手动锁屏，需密码解锁
