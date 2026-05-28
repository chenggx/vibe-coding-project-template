# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

后台管理系统前端，React 19 + TypeScript + Vite + Redux Toolkit + Ant Design 6 + React Router 7。

## 常用命令

```bash
# 强制使用 pnpm（package.json 的 preinstall 会阻止 npm/yarn）
pnpm install

# 开发
pnpm dev          # 启动 dev server (http://localhost:5173)
pnpm build        # tsc && vite build
pnpm preview      # 预览生产构建

# 测试（Vitest + jsdom + Testing Library + MSW）
pnpm test         # vitest run（单次）
pnpm test:watch   # vitest（watch 模式）

# 代码风格
pnpm lint         # eslint .
pnpm lint:fix     # eslint . --fix
```

## 架构

### 目录组织

- `src/modules/{auth,dashboard,menu,role,theme,upload,user}/` — 按领域分模块，每个模块包含：
  - `types.ts` — 模块类型定义
  - `pages/` — 页面级组件（路由直接挂载）
  - `components/` — 模块内可复用组件
  - `tests/` — 模块测试
  - 仅 `auth` 和 `theme` 保留 `slice.ts`（纯 reducer，无 `createAsyncThunk`）
- `src/services/adminApi.ts` — 集中式 RTK Query API（详见「API 层」）
- `src/store/index.ts` — Redux Store，`rootReducer` 聚合 `adminApi.reducer`、`authSlice`、`themeSlice`
- `src/app/routes.tsx` — 路由定义，页面使用 `React.lazy` 懒加载
- `src/app/rootReducer.ts` — `combineReducers` 入口
- `src/hooks/` — 自定义 hooks：`usePermission`、`useAppDispatch`、`useAppSelector`、`useMenuTree`、`usePagination`、`useResponsive`
- `src/components/layout/` — 布局：`AppLayout`、`Sidebar`、`Header`
- `src/components/common/` — 通用：`PermissionButton`、`PermissionWrapper`、`ImageUploader`
- `src/mocks/` — MSW mock 服务，用于测试
- `src/types/` — 全局类型（`auth.ts`、`menu.ts`、`pagination.ts`）
- `src/utils/` — 工具函数：`token.ts`（localStorage 读写）、`menu.ts`（权限提取/菜单扁平化）
- `tests/setup.ts` — Vitest 初始化，mock `matchMedia` 和 `ResizeObserver`

### API 层

`src/services/adminApi.ts` 是唯一的 RTK Query API 入口：
- 使用 `createApi` + `fetchBaseQuery`，`baseUrl` 默认 `http://localhost:8000/api`
- `customBaseQuery` 自动注入 `Authorization: Bearer {token}`，并统一处理后端响应格式 `{ code, message, data }`
- `code === 0` 时返回 `data`；分页数据返回 `{ data, meta }`
- `code === 10002` 或 HTTP 401：清除 Token 并跳转登录页
- 所有 endpoints 集中定义在此（如 `login`、`getUsers`、`createRole`、`getAllMenus` 等）
- 组件通过生成的 hooks 调用（如 `useLoginMutation()`、`useGetUsersQuery()`）

不再使用模块级 `api.ts`。新增接口时直接在 `adminApi.ts` 中添加 endpoint。

### 状态管理

使用 Redux Toolkit，Store 由以下部分组成：
- `adminApi.reducer` — RTK Query 自动生成的 reducer，处理所有 API 缓存状态
- `auth` slice — `createSlice` 管理 token、user、permissions、userMenus。`setUserAndPermissions` action 由 `getCurrentUser` / `updateProfile` 的 `onQueryStarted` 调用
- `theme` slice — 管理主题配置

`auth` slice 的 `setUserAndPermissions` 会调用 `extractPermissions()` 从菜单树提取权限列表。

### 路由与权限

`src/app/routes.tsx`：
- 登录页 `/login` 无守卫
- 其他路由包裹 `AuthGuard`，行为：
  1. 无 Token → 跳转 `/login`
  2. 有 Token 但无 `user` → 自动调用 `useGetCurrentUserQuery()` 获取用户信息
  3. 根据 `routePermissionMap` 校验路由权限（非超管且无权限 → 显示"无权访问"）
- 超管（`user.is_super_admin === true`）自动跳过权限校验
- 权限映射：`/users` → `users.index`，`/roles` → `roles.index`，`/menus` → `menus.all`

### 权限控制组件

- `PermissionButton` — 根据权限字符串决定是否渲染按钮
- `PermissionWrapper` — 根据权限字符串决定是否渲染子元素
- `usePermission` hook — `hasPermission(permission)`，超管始终返回 `true`

### 类型文件注意事项

纯类型模块（`src/types/*.ts`、`src/modules/*/types.ts`）必须包含至少一个运行时导出，否则 Vite 可能将其视为空模块导致 HMR 或构建问题。例如：
```ts
export const MENU_TYPE_CATALOG = 'catalog' as const;
```

## 测试

- 框架：Vitest + jsdom + Testing Library + MSW
- 配置：`vitest.config.ts`，`globals: true`，setup 文件 `tests/setup.ts`
- MSW 在 `tests/setup.ts` 中启动，`src/mocks/handlers.ts` 定义 mock 路由
- 运行单个测试文件：`pnpm test -- src/modules/auth/tests/LoginPage.test.tsx`
- 运行单个测试：`pnpm test -- --testNamePattern="testName"`
- Ant Design 组件在测试环境需要 `matchMedia` 和 `ResizeObserver` mock（已在 `tests/setup.ts` 配置）

## 代码风格

- ESLint 配置：`eslint.config.js`，使用 `typescript-eslint` + `react-hooks` + `react-refresh`
- 严格规则：`@typescript-eslint/no-explicit-any: error`，`no-console: warn`（仅允许 `console.error`）
- 未使用变量：`@typescript-eslint/no-unused-vars: error`，参数名以 `_` 开头可忽略
