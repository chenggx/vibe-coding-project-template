# Frontend Vibe Coding 进度追踪

## 项目总览

- **项目名**: Admin Frontend (React + TypeScript + Ant Design)
- **位置**: `frontend/`
- **总模块数**: 8
- **当前阶段**: 等待启动

## 模块清单与状态

### 1. Project Bootstrap — 基础架构搭建

负责初始化整个项目骨架，所有后续模块依赖于此。

- [ ] 创建 `frontend/` 目录并初始化 Vite + React + TypeScript 项目
- [ ] 安装核心依赖：`react`, `react-dom`, `react-router-dom`, `antd`, `@reduxjs/toolkit`, `react-redux`, `axios`, `dayjs`, `lodash-es`
- [ ] 安装开发依赖：`vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `msw`, `typescript`, `typescript-eslint`, `eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier`, `eslint-config-prettier`, `globals`
- [ ] 配置 `vite.config.ts`（含路径别名 `@/`、`server.proxy` 代理 `/api` 到 `http://localhost:8000`）
- [ ] 配置 `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`
- [ ] 配置 `eslint.config.js`（flat config，主流规则集，禁止 `any`）
- [ ] 配置 `vitest.config.ts`（含 `environment: jsdom`、路径别名、MSW 集成）
- [ ] 初始化 MSW：`src/mocks/handlers.ts`、`src/mocks/browser.ts`、`tests/setup.ts`
- [ ] 创建全局类型：`src/types/api.ts`, `src/types/auth.ts`, `src/types/menu.ts`, `src/types/pagination.ts`
- [ ] 创建工具函数：`src/utils/token.ts`, `src/utils/menu.ts`, `src/utils/formatter.ts`
- [ ] 创建 API 基础设施：`src/services/api.ts`, `src/services/request.ts`, `src/services/errorHandler.ts`
- [ ] 创建全局样式：`src/styles/global.css`, `src/styles/antd.override.css`, `src/styles/responsive.css`
- [ ] 创建环境变量文件：`.env.development`, `.env.production`
- [ ] **测试**: 验证 `vite dev` 可正常启动，`vitest run` 可正常执行（无实际测试也应通过）
- [ ] **质量门禁**: `eslint .` 零错误

**依赖**: 无（首个模块）
**阻塞**: Auth, Dashboard, User, Role, Menu, Upload

---

### 2. Auth Module — 认证与权限

负责登录、登出、用户信息获取、权限解析。是整个系统的安全基石。

- [ ] 创建 `src/modules/auth/types.ts`（`User`, `LoginDto`, `LoginResponse`, `CurrentUserResponse`, `AuthState`）
- [ ] 创建 `src/modules/auth/api.ts`（`authApi.login`, `authApi.logout`, `authApi.getCurrentUser`）
- [ ] 创建 `src/modules/auth/slice.ts`（`authSlice` + `login`, `logout`, `fetchCurrentUser` thunks）
- [ ] 创建 `src/modules/auth/pages/LoginPage.tsx`
- [ ] 创建 `src/modules/auth/components/UserDropdown.tsx`
- [ ] 创建 `src/modules/auth/tests/slice.test.ts`（测试 reducer + thunks，MSW mock API）
- [ ] 创建 `src/modules/auth/tests/api.test.ts`（测试 axios 调用参数）
- [ ] 创建 `src/modules/auth/tests/LoginPage.test.tsx`（测试表单提交、错误提示）
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap
**阻塞**: User, Role, Menu, Dashboard（它们依赖 `authSlice` 的 `permissions` 和 `userMenus`）

---

### 3. App Core — 应用级核心与布局

负责 Redux Store、路由、布局、共享组件、Hooks。承上启下。

- [ ] 创建 `src/app/store.ts`（Store 配置，含 RTK 中间件、HMR 支持）
- [ ] 创建 `src/app/rootReducer.ts`（组合所有 slice）
- [ ] 创建 `src/app/routes.tsx`（路由表 + `AuthGuard` 路由守卫 + `LazyRoute` 懒加载）
- [ ] 创建 `src/components/layout/AppLayout.tsx`
- [ ] 创建 `src/components/layout/Sidebar.tsx`（消费 `authSlice.userMenus`，树形渲染）
- [ ] 创建 `src/components/layout/Header.tsx`（Logo、面包屑、用户下拉、移动端汉堡菜单）
- [ ] 创建 `src/components/layout/MobileDrawer.tsx`
- [ ] 创建 `src/components/common/PermissionButton.tsx`
- [ ] 创建 `src/components/common/PermissionWrapper.tsx`
- [ ] 创建 `src/hooks/usePermission.ts`
- [ ] 创建 `src/hooks/useResponsive.ts`
- [ ] 创建 `src/hooks/usePagination.ts`
- [ ] 创建 `src/hooks/useMenuTree.ts`
- [ ] 更新 `src/App.tsx`（挂载 Provider、Router、ConfigProvider）
- [ ] 更新 `src/main.tsx`（入口文件）
- [ ] **测试**:
  - `src/app/tests/routes.test.tsx`（测试路由守卫，有/无权限场景）
  - `src/components/layout/tests/Sidebar.test.tsx`（测试菜单渲染）
  - `src/hooks/tests/usePermission.test.ts`（测试超级管理员/普通用户权限判断）
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap, Auth Module
**阻塞**: Dashboard, User, Role, Menu

---

### 4. Dashboard Module — 仪表盘首页

系统概览页面，采用 Refined Industrial Minimalism 视觉风格。

- [ ] 创建 `src/modules/dashboard/pages/DashboardPage.tsx`
- [ ] 创建 `src/modules/dashboard/components/StatsCard.tsx`
- [ ] 创建 `src/modules/dashboard/components/QuickActionGrid.tsx`
- [ ] 创建 `src/modules/dashboard/components/ActivityTimeline.tsx`
- [ ] 创建 `src/modules/dashboard/components/WelcomeSection.tsx`
- [ ] 在 `index.html` 中引入国内 CDN Google Fonts（Outfit + JetBrains Mono）
- [ ] 在 `src/styles/global.css` 中定义 CSS 变量和噪点纹理背景
- [ ] 在 `src/App.tsx` 中配置 Ant Design `ConfigProvider`（覆盖主题色、圆角、阴影）
- [ ] **测试**:
  - `src/modules/dashboard/tests/DashboardPage.test.tsx`（测试组件渲染、关键文本存在）
  - `src/modules/dashboard/tests/StatsCard.test.tsx`（测试 props 渲染）
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap, Auth Module, App Core
**阻塞**: 无

---

### 5. User Module — 用户管理

用户 CRUD + 搜索 + 分页 + 角色分配。

- [ ] 创建 `src/modules/user/types.ts`（`User`, `FetchUsersParams`, `CreateUserDto`, `UpdateUserDto`, `UserState`）
- [ ] 创建 `src/modules/user/api.ts`（`userApi.getUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser`）
- [ ] 创建 `src/modules/user/slice.ts`（`userSlice` + 所有 CRUD thunks）
- [ ] 创建 `src/modules/user/pages/UserListPage.tsx`
- [ ] 创建 `src/modules/user/components/UserFormModal.tsx`
- [ ] 创建 `src/modules/user/components/RoleTag.tsx`
- [ ] 创建 `src/modules/user/components/StatusSwitch.tsx`
- [ ] 创建共享组件 `src/components/common/DataTable.tsx`
- [ ] 创建共享组件 `src/components/common/SearchForm.tsx`
- [ ] 创建共享组件 `src/components/common/ActionConfirm.tsx`
- [ ] **测试**:
  - `src/modules/user/tests/slice.test.ts`
  - `src/modules/user/tests/api.test.ts`
  - `src/modules/user/tests/UserListPage.test.tsx`
  - `src/modules/user/tests/UserFormModal.test.tsx`
  - `src/components/common/tests/DataTable.test.tsx`
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap, Auth Module, App Core
**阻塞**: 无

---

### 6. Role Module — 角色管理

角色 CRUD + 分页 + 菜单权限分配。

- [ ] 创建 `src/modules/role/types.ts`（`Role`, `CreateRoleDto`, `UpdateRoleDto`, `RoleState`）
- [ ] 创建 `src/modules/role/api.ts`（`roleApi.getRoles`, `getRole`, `createRole`, `updateRole`, `deleteRole`）
- [ ] 创建 `src/modules/role/slice.ts`（`roleSlice` + CRUD thunks）
- [ ] 创建 `src/modules/role/pages/RoleListPage.tsx`
- [ ] 创建 `src/modules/role/components/RoleFormModal.tsx`
- [ ] 创建 `src/modules/role/components/MenuPermissionTree.tsx`
- [ ] **测试**:
  - `src/modules/role/tests/slice.test.ts`
  - `src/modules/role/tests/api.test.ts`
  - `src/modules/role/tests/RoleListPage.test.tsx`
  - `src/modules/role/tests/MenuPermissionTree.test.tsx`
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap, Auth Module, App Core, Menu Module（`MenuPermissionTree` 需要 `allMenus`）
**阻塞**: 无

---

### 7. Menu Module — 菜单管理

菜单树 CRUD，支持 catalog/menu/permission 三种类型联动。

- [ ] 创建 `src/modules/menu/types.ts`（`Menu`, `MenuTree`, `CreateMenuDto`, `UpdateMenuDto`, `MenuState`）
- [ ] 创建 `src/modules/menu/api.ts`（`menuApi.getMenus`, `getAllMenus`, `getMenu`, `createMenu`, `updateMenu`, `deleteMenu`）
- [ ] 创建 `src/modules/menu/slice.ts`（`menuSlice` + thunks，含 `userMenus` 和 `allMenus`）
- [ ] 创建 `src/modules/menu/pages/MenuListPage.tsx`
- [ ] 创建 `src/modules/menu/components/MenuTreeTable.tsx`
- [ ] 创建 `src/modules/menu/components/MenuFormModal.tsx`
- [ ] **测试**:
  - `src/modules/menu/tests/slice.test.ts`
  - `src/modules/menu/tests/api.test.ts`
  - `src/modules/menu/tests/MenuListPage.test.tsx`
  - `src/modules/menu/tests/MenuFormModal.test.tsx`
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap, Auth Module, App Core
**阻塞**: Role Module（`MenuPermissionTree` 依赖此模块的 `allMenus`）

---

### 8. Upload Module — 文件上传

头像上传功能，封装为通用组件。

- [ ] 创建 `src/modules/upload/types.ts`
- [ ] 创建 `src/modules/upload/api.ts`（`uploadApi.uploadFile`）
- [ ] 创建 `src/modules/upload/slice.ts`（可选，简单状态管理）
- [ ] 创建共享组件 `src/components/common/ImageUploader.tsx`
- [ ] **测试**:
  - `src/modules/upload/tests/api.test.ts`
  - `src/components/common/tests/ImageUploader.test.tsx`
- [ ] **质量门禁**: `eslint` 零错误，所有测试通过

**依赖**: Project Bootstrap
**阻塞**: User Module（`UserFormModal` 使用 `ImageUploader`）

---

## 依赖关系图

```
Project Bootstrap
    │
    ├── Auth Module
    │       │
    │       └── App Core ──┬── Dashboard Module
    │                      │
    │                      ├── User Module
    │                      │       │
    │                      │       └── Upload Module (被 User 的表单使用)
    │                      │
    │                      ├── Menu Module
    │                      │       │
    │                      │       └── Role Module (MenuPermissionTree 需要 allMenus)
    │                      │
    │                      └── Role Module
    │
    └── Upload Module
```

## 执行顺序建议

1. **Phase 1**: Project Bootstrap
2. **Phase 2**: Auth Module → App Core（顺序不可颠倒）
3. **Phase 3**: Dashboard Module（可独立，验证 UI 基础设施）
4. **Phase 4**: Menu Module → Role Module（Role 依赖 Menu 的 allMenus）
5. **Phase 5**: Upload Module → User Module（User 依赖 Upload 的 ImageUploader）

## 质量门禁（每个模块通用）

- [ ] `eslint . --ext ts,tsx` 零错误（无警告更佳）
- [ ] `vitest run src/modules/{module}/tests` 全部通过
- [ ] TypeScript 编译无错误（`tsc --noEmit`）
- [ ] 无 `any` 类型（`@typescript-eslint/no-explicit-any: error`）
- [ ] 每个新文件/组件/函数都有对应测试覆盖核心逻辑
