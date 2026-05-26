# 后台 API 文档

> 本文档面向 AI Agent，用于指导前端代码编写。包含所有接口的 URL、Method、认证方式、请求参数、响应格式、错误码和示例。

---

## 全局约定

### Base URL

```
http://localhost:8000/api
```

### 认证方式

所有受保护接口使用 **Bearer Token** 认证。Token 通过 `POST /login` 获取，后续请求在 Header 中携带：

```http
Authorization: Bearer {token}
```

### 统一响应格式

#### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

#### 分页成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { ... },
    { ... }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

#### 错误响应

```json
{
  "code": 10001,
  "message": "邮箱或密码错误",
  "data": null
}
```

### 错误码对照表

| 错误码 | 含义 | 触发场景 |
|--------|------|----------|
| 0 | 成功 | 所有成功响应 |
| 10001 | 邮箱或密码错误 | 登录时凭据不正确 |
| 10002 | 账号已禁用或已过期 | 登录时 `status=false` 或 `expires_at` 已过期 |
| 10003 | 无权访问 | 当前用户没有该路由的菜单权限 |
| 10004 | 用户不存在 | 查询/修改/删除不存在的用户 ID |
| 10005 | 不能修改/删除超级管理员 | 对 `is_super_admin=true` 的用户执行 update/delete |
| 10006 | 角色不存在 | 查询/修改/删除不存在的角色 ID |
| 10007 | 菜单不存在 | 查询/修改/删除不存在的菜单 ID；菜单类型字段违规（详细见各接口） |
| 10008 | 请先删除子节点 | 删除有子节点的菜单 |

### 公共请求头

| Header | 值 | 说明 |
|--------|-----|------|
| `Accept` | `application/json` | 必须 |
| `Content-Type` | `application/json` | POST/PUT 请求必须（上传接口除外） |
| `Authorization` | `Bearer {token}` | 受保护接口必须 |

### 中间件说明

| 接口 | 中间件 |
|------|--------|
| `POST /login` | `throttle:5,1`（每分钟限流 5 次） |
| `GET /menus` | `auth:sanctum` + `active` |
| 其他所有受保护接口 | `auth:sanctum` + `active` + `menu.permission` |

- `auth:sanctum`：校验 Bearer Token 有效性。
- `active`：校验用户状态（`status=true` 且未过期）。
- `menu.permission`：校验当前用户是否拥有该路由名称对应的菜单权限。超级管理员（`is_super_admin=true`）自动 bypass。

---

## 1. 认证相关

### 1.1 登录

获取 Bearer Token。

```http
POST /login
```

**请求参数（Body / JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | string | 是 | 邮箱地址，后端会自动转小写 |
| `password` | string | 是 | 密码，明文传输，后端比对哈希 |

**请求示例**

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "avatar": null,
      "status": true,
      "expires_at": null,
      "remarks": null,
      "is_super_admin": true,
      "created_at": "2026-05-20 10:00:00",
      "updated_at": "2026-05-20 10:00:00",
      "roles": [
        {
          "id": 1,
          "name": "super-admin",
          "display_name": "超级管理员",
          "description": null,
          "created_at": "2026-05-20 10:00:00",
          "updated_at": "2026-05-20 10:00:00"
        }
      ]
    },
    "token": "1|laravel_sanctum_token_string_here"
  }
}
```

**错误响应**

- `10001`：邮箱或密码错误
- `10002`：账号已禁用或已过期

**前端注意**：
- 登录成功后，将 `token` 存入 `localStorage`（或其他持久化存储），并在后续所有请求的 `Authorization` Header 中携带。
- Token 有效期为 24 小时。

---

### 1.2 登出

销毁当前 Token。

```http
POST /logout
Authorization: Bearer {token}
```

**请求参数**：无

**成功响应（200）**

```json
{
  "code": 0,
  "message": "登出成功",
  "data": null
}
```

**前端注意**：调用成功后，清除本地存储的 token，并跳转登录页。

---

### 1.3 获取当前用户信息

返回当前登录用户的详细信息和权限菜单树。

```http
GET /user
Authorization: Bearer {token}
```

**请求参数**：无

**成功响应（200）**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "avatar": null,
    "status": true,
    "expires_at": null,
    "remarks": null,
    "roles": [
      {
        "id": 1,
        "name": "super-admin",
        "display_name": "超级管理员",
        "description": null,
        "created_at": "2026-05-20 10:00:00",
        "updated_at": "2026-05-20 10:00:00"
      }
    ],
    "menus": [
      {
        "id": 1,
        "parent_id": null,
        "name": "系统管理",
        "type": "catalog",
        "path": null,
        "icon": "Setting",
        "permission": null,
        "sort_order": 1,
        "meta": null,
        "created_at": "2026-05-20 10:00:00",
        "updated_at": "2026-05-20 10:00:00",
        "children": [
          {
            "id": 2,
            "parent_id": 1,
            "name": "用户管理",
            "type": "menu",
            "path": "/users",
            "icon": "User",
            "permission": "users.index",
            "sort_order": 1,
            "meta": null,
            "created_at": "2026-05-20 10:00:00",
            "updated_at": "2026-05-20 10:00:00",
            "children": [
              {
                "id": 3,
                "parent_id": 2,
                "name": "查看用户",
                "type": "permission",
                "path": null,
                "icon": null,
                "permission": "users.index",
                "sort_order": 1,
                "meta": null,
                "created_at": "2026-05-20 10:00:00",
                "updated_at": "2026-05-20 10:00:00",
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**菜单字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 菜单 ID |
| `parent_id` | integer \| null | 父节点 ID，null 为顶级 |
| `name` | string | 菜单名称 |
| `type` | string | 枚举：`catalog`（目录）、`menu`（菜单）、`permission`（权限点） |
| `path` | string \| null | 路由路径，`catalog` 和 `permission` 为 null |
| `icon` | string \| null | 图标标识，`permission` 为 null |
| `permission` | string \| null | 权限标识，`catalog` 为 null |
| `sort_order` | integer | 排序权重 |
| `meta` | object \| null | 额外配置，JSON 对象 |
| `children` | array | 子节点数组，树形结构 |

**前端注意**：
- `/user` 返回的 `menus` 是已经根据用户权限过滤后的**树形结构**（已过滤掉 `permission` 类型，且空目录会被剔除）。
- 超级管理员返回完整菜单树。
- 这个菜单数据用于渲染侧边栏导航。

---

## 2. 用户管理

### 2.1 用户列表

```http
GET /users?name=&email=&per_page=15
Authorization: Bearer {token}
```

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 否 | 按姓名模糊搜索 |
| `email` | string | 否 | 按邮箱模糊搜索 |
| `per_page` | integer | 否 | 每页条数，默认 15，范围 1-100 |

**成功响应（200）**

分页格式。`data` 数组中每个元素为完整 User 对象（含 `roles` 关联）。

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 2,
      "name": "Test User",
      "email": "user@example.com",
      "avatar": null,
      "status": true,
      "expires_at": null,
      "remarks": null,
      "is_super_admin": false,
      "created_at": "2026-05-20 10:00:00",
      "updated_at": "2026-05-20 10:00:00",
      "roles": [
        {
          "id": 2,
          "name": "editor",
          "display_name": "编辑",
          "description": null,
          "created_at": "2026-05-20 10:00:00",
          "updated_at": "2026-05-20 10:00:00"
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

### 2.2 创建用户

```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数（Body / JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 用户名，最大 255 字符 |
| `email` | string | 是 | 邮箱，必须唯一，后端自动转小写 |
| `password` | string | 是 | 密码，最少 6 字符 |
| `avatar` | string | 否 | 头像 URL |
| `status` | boolean | 否 | 是否启用，默认 `true` |
| `expires_at` | string (date) | 否 | 账号过期日期，格式 `YYYY-MM-DD` |
| `remarks` | string | 否 | 备注 |
| `role_ids` | integer[] | 否 | 关联的角色 ID 数组 |

**请求示例**

```json
{
  "name": "New User",
  "email": "new@example.com",
  "password": "123456",
  "status": true,
  "role_ids": [2, 3]
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 3,
    "name": "New User",
    "email": "new@example.com",
    "avatar": null,
    "status": true,
    "expires_at": null,
    "remarks": null,
    "is_super_admin": false,
    "created_at": "2026-05-20 10:00:00",
    "updated_at": "2026-05-20 10:00:00",
    "roles": [
      {
        "id": 2,
        "name": "editor",
        "display_name": "编辑",
        "description": null,
        "created_at": "2026-05-20 10:00:00",
        "updated_at": "2026-05-20 10:00:00"
      }
    ]
  }
}
```

---

### 2.3 用户详情

```http
GET /users/{id}
Authorization: Bearer {token}
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 用户 ID |

**成功响应（200）**

返回完整 User 对象（含 `roles` 关联）。

**错误响应**

- `10004`：用户不存在

---

### 2.4 更新用户

```http
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 用户 ID |

**请求参数（Body / JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 用户名 |
| `email` | string | 是 | 邮箱，必须唯一（排除当前用户） |
| `password` | string | 否 | 密码，不填则保持不变，填了最少 6 字符 |
| `avatar` | string | 否 | 头像 URL |
| `status` | boolean | 否 | 是否启用 |
| `expires_at` | string (date) | 否 | 账号过期日期 |
| `remarks` | string | 否 | 备注 |
| `role_ids` | integer[] | 否 | 关联的角色 ID 数组 |

**请求示例**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "status": false,
  "role_ids": [2]
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 2,
    "name": "Updated Name",
    "email": "updated@example.com",
    "avatar": null,
    "status": false,
    "expires_at": null,
    "remarks": null,
    "is_super_admin": false,
    "created_at": "2026-05-20 10:00:00",
    "updated_at": "2026-05-20 12:00:00",
    "roles": [...]
  }
}
```

**错误响应**

- `10004`：用户不存在
- `10005`：不能修改超级管理员

---

### 2.5 删除用户

```http
DELETE /users/{id}
Authorization: Bearer {token}
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 用户 ID |

**成功响应（200）**

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**错误响应**

- `10004`：用户不存在
- `10005`：不能删除超级管理员

---

## 3. 角色管理

### 3.1 角色列表

```http
GET /roles?per_page=15
Authorization: Bearer {token}
```

**请求参数（Query）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `per_page` | integer | 否 | 每页条数，默认 15，范围 1-100 |

**成功响应（200）**

分页格式。`data` 数组中每个元素含 `users_count`（关联用户数）。

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "super-admin",
      "display_name": "超级管理员",
      "description": null,
      "created_at": "2026-05-20 10:00:00",
      "updated_at": "2026-05-20 10:00:00",
      "users_count": 1
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

### 3.2 创建角色

```http
POST /roles
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数（Body / JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 角色标识（英文），必须唯一，最大 255 字符 |
| `display_name` | string | 是 | 显示名称，最大 255 字符 |
| `description` | string | 否 | 描述 |
| `menu_ids` | integer[] | 否 | 关联的菜单/权限 ID 数组 |

**请求示例**

```json
{
  "name": "editor",
  "display_name": "编辑",
  "description": "内容编辑人员",
  "menu_ids": [2, 3, 4]
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 2,
    "name": "editor",
    "display_name": "编辑",
    "description": "内容编辑人员",
    "created_at": "2026-05-20 10:00:00",
    "updated_at": "2026-05-20 10:00:00",
    "menus": [
      {
        "id": 2,
        "parent_id": 1,
        "name": "用户管理",
        "type": "menu",
        "path": "/users",
        "icon": "User",
        "permission": "users.index",
        "sort_order": 1,
        "meta": null,
        "created_at": "2026-05-20 10:00:00",
        "updated_at": "2026-05-20 10:00:00"
      }
    ]
  }
}
```

---

### 3.3 角色详情

```http
GET /roles/{id}
Authorization: Bearer {token}
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 角色 ID |

**成功响应（200）**

返回完整 Role 对象（含 `menus` 关联）。

**错误响应**

- `10006`：角色不存在

---

### 3.4 更新角色

```http
PUT /roles/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 角色 ID |

**请求参数（Body / JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 角色标识，必须唯一（排除当前角色） |
| `display_name` | string | 是 | 显示名称 |
| `description` | string | 否 | 描述 |
| `menu_ids` | integer[] | 否 | 关联的菜单/权限 ID 数组 |

**请求示例**

```json
{
  "name": "editor",
  "display_name": "高级编辑",
  "description": "更新后的描述",
  "menu_ids": [2, 3]
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 2,
    "name": "editor",
    "display_name": "高级编辑",
    "description": "更新后的描述",
    "created_at": "2026-05-20 10:00:00",
    "updated_at": "2026-05-20 12:00:00",
    "menus": [...]
  }
}
```

**错误响应**

- `10006`：角色不存在

---

### 3.5 删除角色

```http
DELETE /roles/{id}
Authorization: Bearer {token}
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 角色 ID |

**成功响应（200）**

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**错误响应**

- `10006`：角色不存在

---

## 4. 菜单管理

### 4.1 获取当前用户菜单树

用于渲染侧边栏。返回根据当前用户权限过滤后的树形菜单（已隐藏 `permission` 类型，空目录已剔除）。

```http
GET /menus
Authorization: Bearer {token}
```

**请求参数**：无

**成功响应（200）**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "parent_id": null,
      "name": "系统管理",
      "type": "catalog",
      "path": null,
      "icon": "Setting",
      "permission": null,
      "sort_order": 1,
      "meta": null,
      "created_at": "2026-05-20 10:00:00",
      "updated_at": "2026-05-20 10:00:00",
      "children": [
        {
          "id": 2,
          "parent_id": 1,
          "name": "用户管理",
          "type": "menu",
          "path": "/users",
          "icon": "User",
          "permission": "users.index",
          "sort_order": 1,
          "meta": null,
          "created_at": "2026-05-20 10:00:00",
          "updated_at": "2026-05-20 10:00:00",
          "children": []
        }
      ]
    }
  ]
}
```

**前端注意**：
- `type=catalog`：目录节点，有 children，用于分组，无 path。
- `type=menu`：菜单节点，有 path，可点击跳转。
- `type=permission`：不会出现在此接口返回中（用于权限校验，不展示）。

---

### 4.2 获取所有菜单树

用于角色管理中的权限分配（`el-tree` 勾选）。返回完整菜单树，包含所有 `catalog`、`menu`、`permission` 节点。

```http
GET /menus/all
Authorization: Bearer {token}
```

**请求参数**：无

**成功响应（200）**

树形结构，与 `/menus` 格式相同，但包含 `permission` 类型节点。

---

### 4.3 创建菜单

```http
POST /menus
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数（Body / JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `parent_id` | integer \| null | 否 | 父节点 ID，null 为顶级 |
| `name` | string | 是 | 菜单名称，最大 255 字符 |
| `type` | string | 是 | 枚举：`catalog`、`menu`、`permission` |
| `path` | string \| null | 否 | 路由路径。`menu` 类型必填，`catalog`/`permission` 必须为 null |
| `icon` | string \| null | 否 | 图标。`permission` 类型必须为 null |
| `permission` | string \| null | 否 | 权限标识。`menu` 类型必填，`catalog` 必须为 null，`permission` 类型必填。必须全局唯一 |
| `sort_order` | integer \| null | 否 | 排序权重 |
| `meta` | object \| null | 否 | 额外配置，JSON 对象 |

**类型约束规则**（后端 `after` 验证器校验，违反返回 `10007`）

- `catalog`：不能有 `permission`，不能有 `path`。
- `menu`：必须有 `permission`，必须有 `path`。
- `permission`：不能有 `path`，不能有 `icon`。
- `parent_id` 指向的父节点不能是 `permission` 类型。

**请求示例**

```json
{
  "parent_id": 1,
  "name": "新增菜单",
  "type": "menu",
  "path": "/new-page",
  "icon": "Document",
  "permission": "new-page.index",
  "sort_order": 10
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 10,
    "parent_id": 1,
    "name": "新增菜单",
    "type": "menu",
    "path": "/new-page",
    "icon": "Document",
    "permission": "new-page.index",
    "sort_order": 10,
    "meta": null,
    "created_at": "2026-05-20 10:00:00",
    "updated_at": "2026-05-20 10:00:00"
  }
}
```

---

### 4.4 更新菜单

```http
PUT /menus/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 菜单 ID |

**请求参数（Body / JSON）**

与创建菜单相同，加上以下额外约束：

- `parent_id` 不能是自身或其任何后代节点（避免循环引用）。
- 有子节点的节点不能改为 `permission` 类型。
- 有子节点的 `catalog` 节点不能更改类型。

违反上述约束返回 `10007`。

**请求示例**

```json
{
  "parent_id": null,
  "name": "更新后的菜单",
  "type": "menu",
  "path": "/updated",
  "icon": "Edit",
  "permission": "updated.index",
  "sort_order": 5
}
```

**成功响应（200）**

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 10,
    "parent_id": null,
    "name": "更新后的菜单",
    "type": "menu",
    "path": "/updated",
    "icon": "Edit",
    "permission": "updated.index",
    "sort_order": 5,
    "meta": null,
    "created_at": "2026-05-20 10:00:00",
    "updated_at": "2026-05-20 12:00:00"
  }
}
```

**错误响应**

- `10007`：菜单不存在 / 类型字段违规 / 循环引用 / 有子节点不能改类型

---

### 4.5 删除菜单

```http
DELETE /menus/{id}
Authorization: Bearer {token}
```

**路径参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 菜单 ID |

**成功响应（200）**

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**错误响应**

- `10007`：菜单不存在
- `10008`：请先删除子节点

---

## 5. 文件上传

### 5.1 上传文件

```http
POST /upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数（FormData）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 文件，限制 `jpg,jpeg,png,gif`，最大 2048KB |

**成功响应（200）**

```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "http://localhost:8000/storage/avatars/xxx.jpg"
  }
}
```

---

## 附录 A：数据模型字段定义

### User

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | |
| `name` | string | 用户名 |
| `email` | string | 邮箱 |
| `avatar` | string \| null | 头像 URL |
| `status` | boolean | 是否启用 |
| `expires_at` | datetime \| null | 账号过期时间 |
| `remarks` | string \| null | 备注 |
| `is_super_admin` | boolean | 超级管理员标记 |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### Role

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | |
| `name` | string | 角色标识（英文） |
| `display_name` | string | 显示名称 |
| `description` | string \| null | 描述 |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### Menu

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | |
| `parent_id` | integer \| null | 父节点 ID |
| `name` | string | 菜单名称 |
| `type` | string | `catalog` / `menu` / `permission` |
| `path` | string \| null | 路由路径 |
| `icon` | string \| null | 图标标识 |
| `permission` | string \| null | 权限标识 |
| `sort_order` | integer | 排序权重 |
| `meta` | object \| null | 额外配置 |
| `created_at` | datetime | |
| `updated_at` | datetime | |

---

## 附录 B：前端开发速查

### Axios 封装要点

1. **BaseURL**：`http://localhost:8000/api`
2. **请求拦截器**：从 `localStorage` 读取 `token`，注入 `Authorization: Bearer ${token}` Header。
3. **响应拦截器**：
   - 若 `response.data.code !== 0`，用 `message` 字段弹错误提示。
   - 若 HTTP 状态码 401 或 `code === 10002`，清除 token 并跳转登录页。
4. **登录接口**：`POST /login` 返回 `token`，存入 `localStorage`。
5. **登出接口**：`POST /logout`，成功后清除 token。

### 菜单树处理

- 调用 `GET /menus` 获取当前用户的侧边栏菜单树。
- `type=catalog`：渲染为分组/折叠面板。
- `type=menu`：渲染为可点击的导航项，跳转 `path`。
- `children` 为空数组表示叶子节点。

### 权限分配

- 调用 `GET /menus/all` 获取完整菜单树（含 `permission` 节点）。
- 在角色新增/编辑弹窗中，用 `el-tree` 展示完整树，让用户勾选。
- 提交时把勾选的节点 ID 数组作为 `menu_ids` 发送。

### 分页处理

列表接口使用 `ApiResponse::paginate` 格式，统一处理 `meta`：

```javascript
const pagination = {
  currentPage: response.meta.current_page,
  total: response.meta.total,
  pageSize: response.meta.per_page
};
```

### 通用搜索

用户列表支持 `name` 和 `email` 模糊搜索，作为 Query 参数附加到 URL：

```
GET /users?name=张三&email=zhangsan&per_page=20
```
