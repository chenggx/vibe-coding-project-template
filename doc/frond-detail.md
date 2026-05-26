# 前端详细设计方案

## 1. 项目概述

基于 React 18 + TypeScript + Ant Design + Redux Toolkit 的独立后台管理前端，对接 Laravel Sanctum API。项目位于 `frontend/`，与 `backend/` 完全解耦，通过 Vite 独立构建运行。

## 2. 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 构建工具 | Vite | ^6.x | 极速开发体验 |
| 框架 | React | ^18.x | UI 框架 |
| 语言 | TypeScript | ^5.x | 类型安全 |
| 组件库 | Ant Design | ^5.x | 企业级 UI |
| 状态管理 | Redux Toolkit | ^2.x | 全局状态 + 异步逻辑 |
| 路由 | React Router DOM | ^6.x | SPA 路由 |
| HTTP | Axios | ^1.x | API 请求 |
| 测试 | Vitest + React Testing Library + MSW | - | 单元测试 + API Mock |
| 图标 | @ant-design/icons | - | Ant Design 图标 |
| 工具库 | dayjs, lodash-es | - | 日期/工具函数 |

## 3. 项目目录结构

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                    # 应用入口
│   ├── App.tsx                     # 根组件（Provider 挂载）
│   ├── app/                        # 应用级核心
│   │   ├── store.ts                # Redux store 配置
│   │   ├── rootReducer.ts          # 根 reducer 组合
│   │   ├── routes.tsx              # 路由配置与守卫
│   │   └── providers/              # Context / Provider 封装
│   ├── modules/                    # 业务模块（核心）
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── user/
│   │   ├── role/
│   │   ├── menu/
│   │   └── upload/
│   ├── components/                 # 共享组件
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # 主布局（侧边栏 + 头部 + 内容）
│   │   │   ├── Sidebar.tsx         # 侧边栏导航
│   │   │   ├── Header.tsx          # 顶部栏
│   │   │   └── MobileDrawer.tsx    # 移动端侧边栏 Drawer
│   │   ├── common/
│   │   │   ├── PermissionButton.tsx    # 按钮级权限包装
│   │   │   ├── PermissionWrapper.tsx   # 元素级权限包装
│   │   │   ├── DataTable.tsx           # 通用表格（分页 + 排序 + 空状态）
│   │   │   ├── SearchForm.tsx          # 通用搜索表单
│   │   │   ├── ActionConfirm.tsx       # 删除/危险操作确认弹窗
│   │   │   └── ImageUploader.tsx       # 图片上传组件
│   │   └── dashboard/              # Dashboard 专属视觉组件
│   ├── hooks/                      # 全局 Hooks
│   │   ├── usePermission.ts        # 权限检查 hook
│   │   ├── useResponsive.ts        # 响应式断点 hook
│   │   ├── usePagination.ts        # 分页逻辑 hook
│   │   └── useMenuTree.ts          # 菜单树处理 hook
│   ├── services/                   # API 基础设施
│   │   ├── api.ts                  # Axios 实例 + 拦截器
│   │   ├── request.ts              # 请求/响应类型
│   │   └── errorHandler.ts         # 统一错误处理
│   ├── types/                      # 全局类型
│   │   ├── api.ts                  # 通用 API 响应类型
│   │   ├── auth.ts                 # 用户/认证类型
│   │   ├── menu.ts                 # 菜单类型
│   │   └── pagination.ts           # 分页类型
│   ├── utils/                      # 工具函数
│   │   ├── token.ts                # token 存取（localStorage）
│   │   ├── menu.ts                 # 菜单树工具（过滤/扁平化/查找）
│   │   └── formatter.ts            # 日期/状态格式化
│   ├── mocks/                      # MSW Mock（测试用）
│   │   ├── handlers.ts             # API mock handlers
│   │   └── browser.ts              # 浏览器环境初始化
│   └── styles/                     # 全局样式
│       ├── global.css              # 基础样式 + CSS 变量
│       ├── antd.override.css       # Ant Design 全局覆盖
│       └── responsive.css          # 响应式工具类
├── tests/                          # 集成测试 / setup
│   └── setup.ts                    # Vitest 初始化（jsdom, MSW）
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── package.json
```

## 4. 核心架构设计

### 4.1 状态管理（Redux Toolkit）

Store 按业务领域垂直拆分 Slice，每个模块独立管理自己的状态。

#### Slice 划分

| Slice | 职责 | 关键状态 |
|-------|------|----------|
| `authSlice` | 认证与当前用户 | `token`, `user`, `isAuthenticated`, `permissions: string[]` |
| `appSlice` | 应用级 UI 状态 | `sidebarCollapsed`, `mobileDrawerOpen`, `breadcrumbs`, `theme` |
| `userSlice` | 用户列表与操作 | `list`, `meta`, `loading`, `currentUser` |
| `roleSlice` | 角色列表与操作 | `list`, `meta`, `loading`, `currentRole` |
| `menuSlice` | 菜单树管理 | `userMenus` (侧边栏用), `allMenus` (权限分配用), `loading` |

#### 异步 Thunks（以 userSlice 为例）

```typescript
// modules/user/slice.ts
const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: FetchUsersParams, { rejectWithValue }) => {
    try {
      return await userApi.getUsers(params);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const createUser = createAsyncThunk(...);
const updateUser = createAsyncThunk(...);
const deleteUser = createAsyncThunk(...);
```

#### 认证流程状态机

1. `App.tsx` 初始化时，检查 `localStorage` 是否存在 token
2. 若存在，dispatch `fetchCurrentUser()`（调用 `GET /user`）
3. 成功后：解析 `menus` 生成权限数组 `permissions`，写入 `authSlice`
4. 失败（401 / 10002）：清除 token，跳转 `/login`
5. 路由守卫依赖 `isAuthenticated` 与 `permissions` 判断访问权

### 4.2 路由设计

#### 路由表

| 路径 | 组件 | 权限标识 | 说明 |
|------|------|----------|------|
| `/login` | `LoginPage` | - | 公开，无布局 |
| `/` | `AppLayout` | - | 受保护，重定向到 `/dashboard` |
| `/dashboard` | `DashboardPage` | `dashboard.index` | 仪表盘 |
| `/users` | `UserListPage` | `users.index` | 用户列表 |
| `/roles` | `RoleListPage` | `roles.index` | 角色列表 |
| `/menus` | `MenuListPage` | `menus.index` | 菜单列表 |
| `*` | `NotFoundPage` | - | 404 |

#### 动态菜单路由映射

后端 `GET /user` 返回的 `menus` 已过滤为树形结构（仅含 `catalog` + `menu`）。前端做静态路由表与菜单 `path` 的映射：

```typescript
// 路由配置文件中定义 path -> component 的映射
const routeComponentMap: Record<string, React.LazyExoticComponent<any>> = {
  '/dashboard': lazy(() => import('@/modules/dashboard/pages/DashboardPage')),
  '/users': lazy(() => import('@/modules/user/pages/UserListPage')),
  '/roles': lazy(() => import('@/modules/role/pages/RoleListPage')),
  '/menus': lazy(() => import('@/modules/menu/pages/MenuListPage')),
};
```

侧边栏渲染直接使用 `userMenus` 树形数据；路由守卫检查目标 `path` 对应的 `permission` 是否在 `permissions` 数组中。

### 4.3 权限系统

权限系统分两层：**路由/菜单级** 与 **按钮/元素级**。

#### 权限数据结构

```typescript
// 从 /user 返回的 menus 中提取所有 permission 节点
const permissions: string[] = extractPermissions(userMenus);
// 结果示例: ['users.index', 'users.create', 'users.update', 'users.delete', ...]
```

#### 路由/菜单级权限

- **菜单渲染**：`Sidebar` 组件直接消费 `authSlice.userMenus`，已过滤过，无需额外判断
- **路由守卫**：进入受保护路由前，检查该路由对应的 `permission` 是否在 `permissions` 数组中。若不在，渲染 `<Forbidden />` 或跳转 404
- **空目录处理**：后端已剔除空目录，前端无需处理

#### 按钮/元素级权限

提供两种使用方式：

**Hook 方式（灵活）**：
```typescript
const { hasPermission } = usePermission();
if (hasPermission('users.delete')) { ... }
```

**组件方式（声明式）**：
```tsx
<PermissionButton permission="users.create" type="primary">
  新增用户
</PermissionButton>
// 无权限时：组件返回 null（不渲染）

<PermissionWrapper permission="users.update">
  <Button>编辑</Button>
</PermissionWrapper>
// 无权限时：不渲染子元素
```

超级管理员（`is_super_admin = true`）时，`hasPermission` 始终返回 `true`。

### 4.4 API 封装

#### Axios 实例配置

```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

// Request Interceptor: 注入 Token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: 统一错误处理
api.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data;
    if (code !== 0) {
      // 业务错误
      if (code === 10002) { // 账号禁用/过期
        clearToken();
        window.location.href = '/login';
      }
      return Promise.reject(new ApiError(message, code));
    }
    return data; // 直接返回 data，调用方无需解构
  },
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### API 层按模块拆分

```typescript
// modules/user/api.ts
export const userApi = {
  getUsers: (params: FetchUsersParams) => 
    api.get<PaginatedResponse<User>>('/users', { params }),
  getUser: (id: number) => 
    api.get<ApiResponse<User>>(`/users/${id}`),
  createUser: (data: CreateUserDto) => 
    api.post<ApiResponse<User>>('/users', data),
  updateUser: (id: number, data: UpdateUserDto) => 
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  deleteUser: (id: number) => 
    api.delete<ApiResponse<null>>(`/users/${id}`),
};
```

### 4.5 布局与响应式

#### 断点定义

沿用 Ant Design + 自定义扩展：

| 断点名 | 宽度 | 行为 |
|--------|------|------|
| `xs` | < 576px | 手机：Drawer 侧边栏，单列表单，卡片列表替代表格 |
| `sm` | >= 576px | 大手机：Drawer 侧边栏，单列表单 |
| `md` | >= 768px | 平板：Drawer 侧边栏，可两列表单 |
| `lg` | >= 992px | 小桌面：固定可折叠侧边栏（80px 折叠态） |
| `xl` | >= 1200px | 桌面：固定展开侧边栏（240px） |
| `xxl` | >= 1600px | 大桌面：宽内容区，三列表单 |

#### 布局结构

```
+------------------------------------------+
|  Header (64px)  [Logo] [面包屑] [用户下拉] |
+----------+-------------------------------+
|          |                               |
| Sidebar  |        Content Area           |
| (240px)  |        (动态路由页面)          |
|          |                               |
+----------+-------------------------------+
```

- **移动端（< lg）**：侧边栏隐藏，汉堡图标触发 `MobileDrawer`（Ant Design `Drawer` 组件，覆盖全屏）
- **桌面端（>= lg）**：侧边栏固定，支持折叠/展开
- **内容区**：白色背景，24px 内边距，最小高度 `calc(100vh - 64px)`

## 5. 模块详细设计

每个模块遵循统一结构，确保独立可测试：

```
modules/{name}/
├── types.ts        # 模块类型定义（不依赖其他模块）
├── api.ts          # API 函数（只依赖 services/api.ts）
├── slice.ts        # Redux slice + thunks
├── components/     # 模块级组件
├── pages/          # 页面级组件
├── tests/          # 单元测试
│   ├── slice.test.ts
│   ├── api.test.ts       # MSW mock 测试
│   └── components/
└── index.ts        # 统一导出
```

### 5.1 Auth 模块

**职责**：登录、登出、获取当前用户信息、权限解析。

#### 状态设计

```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[];      // 扁平化权限标识数组
  userMenus: MenuTree[];      // 侧边栏菜单树
  isAuthenticated: boolean;
  loading: boolean;
}
```

#### API

```typescript
authApi.login(credentials: LoginDto): Promise<LoginResponse>
authApi.logout(): Promise<void>
authApi.getCurrentUser(): Promise<CurrentUserResponse>
```

#### 关键逻辑

- `login thunk`：调用 `POST /login`，成功后 `localStorage.setItem('token', token)`，再 dispatch `fetchCurrentUser()`
- `fetchCurrentUser thunk`：调用 `GET /user`，成功后解析 `menus` 生成 `permissions` 和 `userMenus`
- `logout thunk`：调用 `POST /logout`，无论成功失败都清除 localStorage 并重置 state

#### 组件

- `LoginPage`：居中卡片布局，邮箱 + 密码输入，登录按钮带 loading，错误提示。
- `UserDropdown`：Header 右上角，显示用户名/头像，下拉项：个人资料（预留）、退出登录。

### 5.2 Dashboard 模块

**职责**：系统概览、数据可视化、快捷入口。

#### 页面结构

```
DashboardPage
├── WelcomeSection        # 顶部问候语 + 当前日期
├── StatsCards            # 4 个关键指标卡片（用户总数、角色数、菜单节点数、系统状态）
├── QuickActions          # 快捷操作按钮（新增用户、新增角色）
└── RecentActivity        # 最近系统活动列表（预留/静态模拟）
```

#### 视觉设计方向（基于 frontend-design skill）

**主题：Refined Industrial Minimalism（精致工业极简）**

- **色调**：深炭色 `#1a1a1a` 为标题/文本主色，暖灰白 `#f8f5f0` 为页面背景，铁锈红 `#c45c3e` 为强调色/主按钮色。拒绝蓝紫渐变与纯白背景。
- **排版**：
  - 西文标题/数据：Outfit（Google Fonts，几何现代感）+ JetBrains Mono（等宽数据）
  - 中文回退：`"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- **空间**：卡片使用 1px `#e8e8e3` 细边框 + 极淡阴影，大量负空间，模块间 32px 间距。
- **质感**：全局背景添加极淡的噪点纹理（CSS `background-image: url(...)` 或伪元素叠加），避免纯平色。
- **动效**：页面加载时指标卡片 staggered fade-up（间隔 80ms），数字变化时无动画（后台要求简洁），hover 时卡片轻微上移 `translateY(-2px)` + 边框色变深。
- **Ant Design 改造**：
  - `ConfigProvider` 全局覆盖：`borderRadius: 2`（小圆角，更锐利）
  - 按钮：`borderRadius: 2`，主色改为 `#c45c3e`
  - 卡片：`boxShadow: '0 1px 2px rgba(0,0,0,0.04)'`

**Dashboard 组件清单**：

- `StatsCard`：大数字 + 标签 + 较上周变化指示器（静态）。独立组件，props：`title`, `value`, `suffix`, `color`
- `QuickActionGrid`：2x2 网格快捷按钮，带图标
- `ActivityTimeline`：最近活动时间线（Ant Design `Timeline` 组件定制样式）

### 5.3 User 模块

**职责**：用户增删改查、搜索、分页、分配角色。

#### 页面：UserListPage

**布局**：

```
UserListPage
├── PageHeader            # 标题 "用户管理" + 新增用户按钮（permission: users.create）
├── SearchForm            # 姓名/邮箱输入 + 搜索/重置按钮
├── DataTable             # 用户列表表格
│   ├── 列：ID、姓名、邮箱、角色标签、状态开关、创建时间、操作列
│   └── 操作列：查看、编辑、删除（均受权限控制）
└── Pagination            # 底部分页器
```

**交互**：
- 搜索：输入姓名/邮箱，点击搜索或回车触发 `fetchUsers`（带 `name`/`email` query）
- 分页：切换页码或每页条数时触发 `fetchUsers`
- 状态开关：表格内 `Switch` 组件切换用户 `status`（需要 `users.update` 权限）
- 新增/编辑：Modal 弹窗表单（`UserFormModal`），表单字段对应 API 的 `CreateUserDto` / `UpdateUserDto`
- 删除：`ActionConfirm` 二次确认，调用 `deleteUser thunk`
- 角色分配：表单中 `Select mode="multiple"`，选项从 `roleSlice.list` 中获取

#### 组件

- `UserFormModal`：新增/编辑共用，props：`open`, `user?`, `onSubmit`, `onCancel`。字段：name, email, password（编辑时可选）, avatar, status, expires_at, remarks, role_ids。
- `RoleTag`：显示用户关联角色，多角色用 Tag 列表展示。
- `StatusSwitch`：受控 Switch，切换时确认提示。

### 5.4 Role 模块

**职责**：角色增删改查、分页、分配菜单权限。

#### 页面：RoleListPage

**布局**：

```
RoleListPage
├── PageHeader            # 标题 "角色管理" + 新增角色按钮（permission: roles.create）
├── DataTable             # 角色列表
│   ├── 列：ID、标识名、显示名称、描述、关联用户数、创建时间、操作列
│   └── 操作列：编辑、删除
└── Pagination
```

**交互**：
- 新增/编辑：`RoleFormModal` Modal 弹窗
- 权限分配：表单中使用 `MenuPermissionTree` 组件展示完整菜单树（`GET /menus/all`），支持勾选 `catalog`/`menu`/`permission` 节点。提交时收集所有勾选节点 ID 作为 `menu_ids`

#### 核心组件：MenuPermissionTree

```typescript
interface MenuPermissionTreeProps {
  value: number[];              // 已勾选的 menu IDs
  onChange: (ids: number[]) => void;
  menuData: MenuTree[];         // GET /menus/all 的完整树
}
```

- 使用 Ant Design `Tree` 组件
- `checkable = true`
- `checkStrictly = false`（父子节点关联勾选）
- 展示 `name` 字段作为节点标题
- 不同类型的节点可以有不同的前缀图标区分

### 5.5 Menu 模块

**职责**：菜单/目录/权限点的增删改查、树形管理。

#### 页面：MenuListPage

**布局**：

```
MenuListPage
├── PageHeader            # 标题 "菜单管理" + 新增菜单按钮（permission: menus.create）
└── MenuTreeTable         # 树形表格展示完整菜单结构
```

**交互**：
- 展示：使用 Ant Design `Table` 的 `childrenColumnName` 实现树形展示，或通过递归组件渲染自定义树形列表
- 新增/编辑：`MenuFormModal`，表单字段：
  - `parent_id`：上级菜单选择器（`TreeSelect`，从 `allMenus` 加载，排除 `permission` 类型和自身及其子节点）
  - `name`：菜单名称
  - `type`：`Radio.Group`（catalog/menu/permission），切换时动态显示/隐藏 path/icon/permission 字段
  - `path`：`menu` 类型必填
  - `icon`：`catalog`/`menu` 可选，`permission` 必须为 null
  - `permission`：根据类型动态校验必填
  - `sort_order`：数字输入
- 删除：确认弹窗。若后端返回 `10008`（请先删除子节点），前端提示用户先删除子节点

#### 类型联动逻辑（前端预校验）

与后端 `after` 验证器对齐，提交前做基础校验：
- `catalog`：path/icon/permission 必须为空
- `menu`：path 必填，permission 必填，icon 可选
- `permission`：path 必须为空，icon 必须为空，permission 必填

### 5.6 Upload 模块

**职责**：文件上传，专供头像上传使用。

#### API

```typescript
uploadApi.uploadFile(file: File): Promise<{ url: string }>
```

#### 组件：ImageUploader

```typescript
interface ImageUploaderProps {
  value?: string;           // 当前图片 URL
  onChange: (url: string) => void;
  maxSize?: number;         // 默认 2048 (KB)
  accept?: string;          // 默认 'image/jpeg,image/png,image/gif'
}
```

- 使用 Ant Design `Upload` 组件
- `beforeUpload` 做客户端文件类型和大小校验
- 上传时显示 loading
- 上传成功后 `onChange(url)`
- 支持预览和删除

## 6. 共享组件设计

### 6.1 PermissionButton / PermissionWrapper

```tsx
// components/common/PermissionButton.tsx
interface Props extends ButtonProps {
  permission: string;
  fallback?: React.ReactNode;   // 无权限时的替代渲染，默认 null
}

export const PermissionButton: React.FC<Props> = ({ permission, fallback = null, children, ...props }) => {
  const { hasPermission } = usePermission();
  if (!hasPermission(permission)) return fallback;
  return <Button {...props}>{children}</Button>;
};
```

### 6.2 DataTable

通用分页表格封装，统一处理：
- loading 状态
- 空状态（Empty + 自定义描述）
- 分页器位置（底部右对齐）
- 排序变化回调
- 行选择（可选）

```typescript
interface DataTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onChange: (pagination: TablePaginationConfig) => void;
  rowKey: string;
}
```

### 6.3 SearchForm

通用搜索表单，支持响应式布局：
- `xl` 下 4 列（3 个输入 + 1 个按钮组）
- `md` 下 2 列
- `xs` 下单列
- 自动处理表单值收集和重置

## 7. 测试策略

### 7.1 测试框架配置

- **Vitest**：替代 Jest，与 Vite 原生集成
- **@testing-library/react**：组件渲染与交互测试
- **@testing-library/user-event**：模拟用户行为
- **MSW (Mock Service Worker)**：拦截 HTTP 请求，提供统一的 API mock
- **jsdom**：DOM 环境

### 7.2 各模块测试范围

每个模块的 `tests/` 目录独立，可单独运行：

```bash
vitest run src/modules/user/tests
vitest run src/modules/role/tests
```

#### 测试分层

| 类型 | 目标 | 示例 |
|------|------|------|
| **Slice 测试** | Reducer 纯函数、Thunk 异步流程 | `userSlice.test.ts`：测试 `fetchUsers.fulfilled` 是否正确更新 `list` 和 `meta` |
| **API 测试** | API 函数与 MSW mock 的交互 | `userApi.test.ts`：测试 `getUsers` 是否发送正确的 query params |
| **组件测试** | 组件渲染、props、事件回调 | `UserFormModal.test.tsx`：测试表单提交时是否调用 onSubmit 并传入正确数据 |
| **Hook 测试** | 自定义 Hook 逻辑 | `usePermission.test.ts`：测试超级管理员返回 true，普通用户按权限返回 |

#### MSW 示例

```typescript
// mocks/handlers.ts
export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({
      code: 0,
      message: 'success',
      data: [{ id: 1, name: 'Test', ... }],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 }
    }));
  }),
  // ... 其他 mock
];
```

### 7.3 测试运行命令

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 8. 开发规范

### 8.1 命名规范

- **目录/文件**：kebab-case（`user-form-modal.tsx`）
- **组件名**：PascalCase（`UserFormModal`）
- **Hooks**：camelCase，前缀 `use`（`usePermission`）
- **Slice/Actions**：camelCase，`userSlice`, `fetchUsers`
- **类型/接口**：PascalCase，后缀可选（`User`, `CreateUserDto`）

### 8.2 导入顺序

```typescript
// 1. React / 第三方库
import React from 'react';
import { useDispatch } from 'react-redux';

// 2. Ant Design
import { Button } from 'antd';

// 3. 绝对路径模块
import { usePermission } from '@/hooks/usePermission';
import { userApi } from '@/modules/user/api';

// 4. 相对路径
import { UserForm } from './components/UserForm';
```

### 8.3 类型安全

- 所有 API 请求/响应必须定义 TypeScript 接口
- Redux slice 的 `initialState` 必须显式标注类型
- 组件 props 必须定义 `interface`
- 禁止使用 `any`，必须使用 `unknown` + 类型收窄

### 8.4 环境变量

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api

# .env.production
VITE_API_BASE_URL=/api
```

## 9. 构建与部署

### 9.1 开发脚本

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }
}
```

### 9.2 代理配置

开发时前端运行在 `http://localhost:5173`，API 在 `http://localhost:8000`。通过 Vite `server.proxy` 解决 CORS：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

生产环境由 Nginx 或 Laravel 统一反向代理。

## 10. 风险与注意事项

1. **Ant Design 5 与 Tailwind CSS**：两者都大量使用 CSS 变量和原子类，可能出现样式冲突。方案：Ant Design 样式优先，Tailwind 仅用于布局工具类（`flex`, `grid`, `gap` 等），不用于覆盖组件样式。
2. **Redux Toolkit 与模块热替换**：Vite HMR 可能导致 Redux store 状态丢失。需配置 `store.ts` 支持 HMR。
3. **菜单权限缓存**：用户权限变更后，需要重新登录或提供刷新权限的机制。
4. **Token 过期**：Sanctum token 24 小时有效。需要在 axios interceptor 中捕获 401 并跳转登录。
5. **树形数据性能**：菜单树深度通常不超过 3 层，无需虚拟滚动。若未来扩展，再考虑 `react-window`。
