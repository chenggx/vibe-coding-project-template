# 前端项目优化规划：迁移至 RTK Query 与工程化重构

## Context

当前前端项目（React 19 + Redux Toolkit + Ant Design 6）采用手写的 `createAsyncThunk` + axios 管理服务端状态。随着模块增多（user/role/menu/auth/upload），产生了严重的样板代码重复、类型断言泛滥（`as unknown as`）、模块间耦合（thunk 中直接 dispatch 其他模块 action）、以及测试质量差等问题。

本规划旨在通过以下核心改造解决上述问题：
1. 引入 RTK Query 替代手写 async thunk，消除 CRUD 样板代码
2. 以 `fetchBaseQuery` 替换 axios，统一 API 层类型契约
3. 利用 RTK Query 的 tag-based 缓存失效替代手动刷新，解耦模块间依赖
4. 抽象 CRUD 页面共同模式，提升组件复用性
5. 重构测试体系，消除重复工具代码和无效测试

## Building

- 单 `adminApi` RTK Query slice 承载所有服务端 API 端点
- 自定义 `baseQuery` 处理响应解包 `{ code, message, data }`、Token 注入、401/10002 重定向
- Auth 模块特殊处理：slice 退化为纯客户端状态容器，`onQueryStarted` 同步 session 信息
- `useCrudTable` hook 封装列表页共同逻辑（Modal 状态、删除确认）
- 共享测试工具 `tests/utils.tsx`
- 移除 axios 及所有手写 api.ts / slice.ts（保留 auth 精简版 slice）

## Not Building

- 不修改后端 API 接口、响应格式、认证协议
- 不升级或替换 Ant Design、React Router、Redux Toolkit 版本
- 不引入 react-admin / refine 等完整框架
- 不修改 UI 视觉风格、动画效果、主题系统
- 不将 Token 从 localStorage 迁移至其他存储
- 不改动路由表结构或懒加载策略

## Approach

**核心方案：单 API Slice + 自定义 BaseQuery + Auth 状态双轨制**

创建一个中心化的 `adminApi`（`src/services/adminApi.ts`），所有服务端数据获取通过 RTK Query 的 endpoints 声明。自定义 `baseQuery` 包装 `fetchBaseQuery`，负责：
- 从 Redux state 读取 Bearer Token 注入请求头
- 解包后端 `{ code, message, data }` 响应格式
- `code !== 0` 时转换为 RTK Query error 对象
- `code === 10002` 或 HTTP 401 时清除 session 并重定向

Auth 模块采用"双轨制"：
- RTK Query 管理与服务端的通信（`login`/`logout`/`getCurrentUser`/`updateProfile` endpoints）
- Auth Slice 保留为 Redux state 中的"会话真相源"，存储 `token`/`user`/`permissions`/`userMenus`
- Endpoint 的 `onQueryStarted` 在查询成功后 dispatch auth slice action 同步状态
- `usePermission`、`AuthGuard`、`Sidebar` 等现有消费者无需改动，继续读取 `state.auth`

**为什么不用 "One createApi per module"：**
RTK Query 官方推荐单 API slice 以获得全局缓存一致性。若按模块拆分，`invalidatesTags` 无法跨 slice 工作（如删除 User 后无法自动让 Role 列表失效——虽然当前业务不需要，但架构上应保持开放）。单 slice 也更易于统一管理 baseQuery 逻辑。未来若 bundle 体积成问题，可通过 `injectEndpoints` 做代码分割。

**为什么 Auth Slice 不删除：**
项目中大量组件（`usePermission`、`AuthGuard`、`Sidebar`、`Header`）直接依赖 `state.auth.user` / `state.auth.permissions`。若将 auth 状态完全交给 RTK Query 缓存管理，需要重构所有权限检查点的数据来源，改动范围会从 3-5 个文件爆炸到 15+ 个文件。保持 Auth Slice 作为"真相源"，由 RTK Query  endpoints 驱动更新，是风险最小的渐进方案。

## Key Decisions

1. **单 `adminApi` 与 tag 体系**
   - `tagTypes: ['User', 'Role', 'Menu', 'Auth', 'Upload']`
   - 列表查询提供 `LIST` tag 和个体 item tags，mutation 精确失效关联缓存
   - 取代当前手动 `dispatch(fetchX())` 的刷新模式

2. **`baseQuery` 统一解包响应**
   - 后端返回 `{ code, message, data }`，`baseQuery` 解包后只返回 `data` 或 `{ data, meta }`
   - 调用方不再需要任何 `as unknown as` 类型断言
   - 分页数据保持 `{ data, meta }` 结构，与现有 `PaginationMeta` 类型兼容

3. **Token 从 Redux state 读取**
   - `prepareHeaders` 中通过 `getState()` 读取 `state.auth.token`
   - 保持与现有 auth slice 的单一数据源一致，避免 localStorage 与 Redux state 不同步
   - 测试时可通过 `preloadedState` 注入 token，无需 mock localStorage

4. **`useCrudTable` hook 而非配置化组件**
   - 封装 Modal 开关、编辑对象状态、删除确认弹窗逻辑
   - 保留页面的 JSX 结构自主权，不过度抽象为"配置驱动"
   - 与 Ant Design 的 Table/Form/Modal 保持自然集成

5. **测试策略：MSW 行为测试为主，减少 mock hooks**
   - 删除所有 `api.test.ts` 和纯样板 `slice.test.ts`（RTK Query 保证 endpoint 正确性）
   - 页面测试通过 MSW 拦截 HTTP，验证用户交互后的 UI 状态
   - 引入共享 `renderWithProviders` 消除重复代码

## Phase Breakdown

每个 Phase 都是独立可合并的单元，完成后系统处于可用状态。

### Phase 1: Foundation — 基础设施搭建

**目标**：创建 RTK Query 核心架构，不触碰任何现有业务代码。

**文件变更**：
- 新增 `src/services/adminApi.ts`
- 修改 `src/store/index.ts`（注入 middleware）
- 修改 `src/app/rootReducer.ts`（挂载 api reducer）
- 修改 `src/types/api.ts`（扩展 ApiError 类型定义）
- 修改 `src/modules/auth/slice.ts`（新增 `setToken`、`setUserAndPermissions` reducer）

**关键改动**：

`src/services/adminApi.ts`：
- 定义 `baseQuery = fetchBaseQuery({ baseUrl, prepareHeaders: inject Bearer token from state })`
- 定义 `customBaseQuery` 包装逻辑：
  1. 调用 `baseQuery` 获取原始响应
  2. 解包 `{ code, message, data }`
  3. `code !== 0` → 返回 `{ error: { status: code, data: { message, code } } }`
  4. `code === 10002` 或 HTTP 401 → dispatch `resetAuth()` + `window.location.href = '/login'`
  5. 包含 `meta` → 返回 `{ data: { data, meta } }`
  6. 否则返回 `{ data }`
- 导出 `adminApi = createApi({ reducerPath: 'adminApi', baseQuery: customBaseQuery, tagTypes: ['User', 'Role', 'Menu', 'Auth', 'Upload'], endpoints: () => ({}) })`

`src/modules/auth/slice.ts`：
- 新增 `setToken(state, action: PayloadAction<string>)`：设置 `token` 和 `isAuthenticated`
- 新增 `setUserAndPermissions(state, action: PayloadAction<CurrentUserResponse>)`：设置 `user`、`userMenus`、`permissions`（通过 `extractPermissions`），清除 `loading`
- 保留 `resetAuth` 和 `clearError`
- 删除所有 `createAsyncThunk`（在 Phase 5 中执行，此处先保留以避免编译错误）

**验证标准**：
- `pnpm build` 通过
- `pnpm lint` 通过
- `pnpm test` 通过数量与基线一致（86 pass, 20 fail）
- Dev server 启动无错误
- 应用功能完全无变化

**回滚**：删除 `adminApi.ts`，还原 store/rootReducer/authSlice 改动。

---

### Phase 2: Upload 模块迁移（最简单的端到端验证）

**目标**：迁移单操作 upload 模块，验证 Phase 1 的基础设施可用。

**文件变更**：
- 修改 `src/services/adminApi.ts`（注入 upload endpoints）
- 删除 `src/modules/upload/api.ts`
- 删除 `src/modules/upload/slice.ts`
- 修改 `src/app/rootReducer.ts`（移除 upload reducer）
- 修改 `src/components/common/ImageUploader.tsx`（迁移至 mutation hook）
- 修改 `src/modules/auth/pages/ProfilePage.tsx`（移除直接 API 调用）
- 删除 `src/modules/upload/tests/api.test.ts`

**关键改动**：

`adminApi` 新增 endpoint：
```ts
uploadFile: build.mutation<{ url: string }, File>({
  query: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return { url: '/upload', method: 'POST', body: formData };
  },
})
```

`ImageUploader.tsx`：
- `const [uploadFile, { isLoading }] = useUploadFileMutation()`
- 替换 `uploadApi.uploadFile(file)` 为 `uploadFile(file).unwrap()`

`ProfilePage.tsx`：
- 移除 `import { uploadApi } from '@/modules/upload/api'`
- 使用 `ImageUploader` 组件的 onChange 回调处理上传结果（如果之前直接调用了 uploadApi，现在通过 ImageUploader 内部完成）

**验证标准**：
- 头像上传功能手动测试通过
- `pnpm build` 通过
- `grep -r "uploadApi\|upload/slice" src/` 无残留引用
- 测试基线不变

**回滚**：恢复删除的文件，还原 rootReducer 和页面改动。

---

### Phase 3: Menu 模块迁移（树形数据，引入 Tag 失效模式）

**目标**：迁移菜单模块（无分页，树形结构），建立 `providesTags` / `invalidatesTags` 的标准模式。

**文件变更**：
- 修改 `src/services/adminApi.ts`（注入 menu endpoints）
- 删除 `src/modules/menu/api.ts`、`slice.ts`
- 修改 `src/app/rootReducer.ts`（移除 menu reducer）
- 修改 `src/modules/menu/pages/MenuListPage.tsx`
- 修改 `src/modules/menu/components/MenuFormModal.tsx`
- 删除 `src/modules/menu/tests/api.test.ts`、`slice.test.ts`
- 修改 `src/modules/menu/tests/MenuListPage.test.tsx`、`MenuFormModal.test.tsx`

**关键改动**：

`adminApi` 新增 endpoints：
```ts
getAllMenus: build.query<MenuTree[], void>({
  query: () => '/menus/all',
  providesTags: ['Menu'],
})
createMenu: build.mutation<MenuTree, CreateMenuDto>({
  query: (body) => ({ url: '/menus', method: 'POST', body }),
  invalidatesTags: ['Menu'],
})
updateMenu: build.mutation<MenuTree, { id: number; data: UpdateMenuDto }>({
  query: ({ id, data }) => ({ url: `/menus/${id}`, method: 'PUT', body: data }),
  invalidatesTags: ['Menu'],
})
deleteMenu: build.mutation<void, number>({
  query: (id) => ({ url: `/menus/${id}`, method: 'DELETE' }),
  invalidatesTags: ['Menu'],
})
```

`MenuListPage.tsx`：
- `const { data: allMenus = [], isLoading } = useGetAllMenusQuery()`
- `const [deleteMenu] = useDeleteMenuMutation()`
- 移除 `useEffect(() => dispatch(fetchAllMenus()), [dispatch])`
- 移除 `useAppSelector(state => state.menu)`

`MenuFormModal.tsx`：
- 使用 `useCreateMenuMutation()` / `useUpdateMenuMutation()`
- 提交成功后调用 `onSuccess()` prop，无需手动刷新列表（RTK Query 自动失效缓存）

**验证标准**：
- 菜单的增删改查手动测试通过
- 操作后树形列表自动刷新
- `pnpm build` 通过
- 无 `as unknown as` 残留

**回滚**：恢复 menu 的 api.ts/slice.ts，还原页面和 rootReducer。

---

### Phase 4: User + Role 模块迁移（分页 CRUD，页面抽象）

**目标**：迁移两个标准分页 CRUD 模块，提取 `useCrudTable` hook，消除跨模块耦合。

**文件变更**：
- 修改 `src/services/adminApi.ts`（注入 user/role endpoints）
- 删除 `src/modules/user/api.ts`、`slice.ts`
- 删除 `src/modules/role/api.ts`、`slice.ts`
- 修改 `src/app/rootReducer.ts`（移除 user/role reducer）
- 新增 `src/hooks/useCrudTable.ts`
- 修改 `src/hooks/usePagination.ts`（优化引用稳定性）
- 修改 `src/modules/user/pages/UserListPage.tsx`、`components/UserFormModal.tsx`
- 修改 `src/modules/role/pages/RoleListPage.tsx`、`components/RoleFormModal.tsx`
- 删除 `src/modules/user/tests/api.test.ts`、`slice.test.ts`
- 删除 `src/modules/role/tests/api.test.ts`、`slice.test.ts`
- 修改相关页面测试文件

**关键改动**：

`adminApi` 新增 endpoints（user 和 role 遵循相同模式）：
```ts
getUsers: build.query<{ data: User[]; meta: PaginationMeta }, FetchUsersParams>({
  query: (params) => ({ url: '/users', params }),
  providesTags: (result) =>
    result ? [...result.data.map(u => ({ type: 'User' as const, id: u.id })), 'User'] : ['User'],
})
createUser: build.mutation<User, CreateUserDto>({
  query: (body) => ({ url: '/users', method: 'POST', body }),
  invalidatesTags: ['User'],
})
updateUser: build.mutation<User, { id: number; data: UpdateUserDto }>({
  query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
  invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
})
deleteUser: build.mutation<void, number>({
  query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
  invalidatesTags: ['User'],
})
```

`getRole` endpoint（RoleListPage 编辑时需要获取详情）：
```ts
getRole: build.query<Role, number>({
  query: (id) => `/roles/${id}`,
  providesTags: (result, error, id) => [{ type: 'Role', id }],
})
```

`UserListPage.tsx` / `RoleListPage.tsx`：
- 使用 `useGetUsersQuery(params)` / `useGetRolesQuery(params)`，参数包含分页和搜索值
- 使用 mutation hooks 替代 dispatch
- 引入 `useCrudTable` 管理 Modal 状态和删除确认
- `columns` 使用 `useMemo` 包装，避免每次渲染重建
- `pagination` 配置使用 `useMemo` 包装

`UserFormModal.tsx`：
- 移除 `import { fetchRoles } from '@/modules/role/slice'`
- 使用 `const { data: rolesData } = useGetRolesQuery({ per_page: 100 }, { skip: !open })` 获取角色下拉选项
- 使用 `useCreateUserMutation()` / `useUpdateUserMutation()`

`RoleFormModal.tsx`：
- 使用 `useCreateRoleMutation()` / `useUpdateRoleMutation()`

`useCrudTable.ts`：
```ts
export function useCrudTable<T extends { id: number }>() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const { modal, message } = App.useApp();
  
  const handleAdd = useCallback(() => { setEditingItem(null); setModalOpen(true); }, []);
  const handleEdit = useCallback((item: T) => { setEditingItem(item); setModalOpen(true); }, []);
  const handleDelete = useCallback((options: { item: T; onConfirm: (id: number) => Promise<void> }) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除吗？`,
      onOk: async () => {
        await options.onConfirm(options.item.id);
        message.success('删除成功');
      },
    });
  }, [modal, message]);
  
  return { modalOpen, editingItem, handleAdd, handleEdit, handleDelete, setModalOpen, setEditingItem };
}
```

`usePagination.ts` 优化：
- `getPaginationConfig` 改为返回 memoized 对象
- 或改为 `paginationConfig` 返回值（用 useMemo 根据传入的 meta 计算）

**验证标准**：
- 用户管理、角色管理的增删改查、分页、搜索手动测试通过
- 创建/编辑用户时角色下拉列表正常加载
- 操作后列表自动刷新
- `pnpm build` 通过
- 无跨模块的 `dispatch(fetchX())` 残留（grep 验证）
- `useCrudTable` hook 被至少两个页面使用

**回滚**：恢复 user/role 的 api.ts/slice.ts，还原页面和 rootReducer。

---

### Phase 5: Auth 模块迁移（Token 与会话管理）

**目标**：迁移最复杂的 auth 模块，将服务端通信移交 RTK Query，slice 退化为客户端状态管理。

**文件变更**：
- 修改 `src/services/adminApi.ts`（注入 auth endpoints）
- 删除 `src/modules/auth/api.ts`
- 重写 `src/modules/auth/slice.ts`（删除所有 thunk，保留精简 reducer）
- 修改 `src/app/routes.tsx`（`AuthGuard` 使用 RTK Query hook）
- 修改 `src/modules/auth/pages/LoginPage.tsx`
- 修改 `src/modules/auth/pages/ProfilePage.tsx`
- 修改 `src/modules/auth/components/UserDropdown.tsx`
- 删除 `src/modules/auth/tests/api.test.ts`
- 重写 `src/modules/auth/tests/slice.test.ts`
- 修改 `src/modules/auth/tests/LoginPage.test.tsx`

**关键改动**：

`adminApi` 新增 auth endpoints：
```ts
login: build.mutation<LoginResponse, LoginDto>({
  query: (body) => ({ url: '/login', method: 'POST', body }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      setToken(data.token);
      dispatch(authSlice.actions.setToken(data.token));
    } catch {}
  },
})
logout: build.mutation<void, void>({
  query: () => ({ url: '/logout', method: 'POST' }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try { await queryFulfilled; } catch {}
    clearToken();
    dispatch(authSlice.actions.resetAuth());
  },
})
getCurrentUser: build.query<CurrentUserResponse, void>({
  query: () => '/user',
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(authSlice.actions.setUserAndPermissions(data));
    } catch {
      clearToken();
      dispatch(authSlice.actions.resetAuth());
    }
  },
})
updateProfile: build.mutation<CurrentUserResponse, UpdateProfileDto>({
  query: (body) => ({ url: '/profile', method: 'PUT', body }),
  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(authSlice.actions.setUserAndPermissions(data));
    } catch {}
  },
})
```

`auth/slice.ts` 重写：
- 删除 `login`、`fetchCurrentUser`、`logout`、`updateProfile` 四个 thunk
- 删除 `extractErrorMessage` 辅助函数
- 保留 `initialState`、`AuthState` 类型
- 保留 `resetAuth`、`clearError` reducer
- 新增 `setToken` reducer
- 新增 `setUserAndPermissions` reducer（调用 `extractPermissions`）
- 导出精简后的 reducer 和 actions

`AuthGuard`（`routes.tsx`）：
- 移除 `dispatch(fetchCurrentUser())` 的 useEffect
- 使用 `const { isLoading: isFetchingUser } = useGetCurrentUserQuery(undefined, { skip: !token || !!user })`
- `loading` 状态从 RTK Query 获取，不再从 `state.auth.loading` 读取
- 权限检查逻辑保持不变

`LoginPage.tsx`：
- `const [login, { isLoading }] = useLoginMutation()`
- 提交时 `await login(values).unwrap()`，成功后 `navigate('/dashboard')`
- 错误处理通过 mutation 的 `error` 属性

`ProfilePage.tsx`：
- `const [updateProfile] = useUpdateProfileMutation()`
- 提交时 `await updateProfile(data).unwrap()`

`UserDropdown.tsx`：
- `const [logout] = useLogoutMutation()`
- 点击时 `logout().unwrap()`

`auth/slice.test.ts` 重写：
- 删除所有 thunk 相关测试
- 测试 `setToken`：设置 token 和 isAuthenticated
- 测试 `setUserAndPermissions`：设置 user、menus、permissions
- 测试 `resetAuth`：恢复初始状态
- 测试 `clearError`：清除 error

**验证标准**：
- 登录、登出、页面刷新（会话恢复）、个人资料更新手动测试通过
- 401/10002 响应正确跳转登录页
- `state.auth.loading` 不再被任何组件使用（grep 验证）
- `pnpm build` 通过
- `auth/slice.test.ts` 测试通过

**回滚**：恢复 auth/api.ts 和旧版 slice.ts（含 thunk），还原 LoginPage/ProfilePage/UserDropdown/AuthGuard。

---

### Phase 6: Cleanup — 移除 Axios、统一测试工具、修复遗留问题

**目标**：清理旧代码，修复测试体系，优化剩余工程问题。

**文件变更**：
- 删除 `src/services/api.ts`、`request.ts`、`errorHandler.ts`
- 删除 `src/services/tests/`（如果存在）
- 修改 `package.json`（移除 `axios`）
- 修改 `tests/setup.ts`（添加 `IntersectionObserver` mock）
- 新增 `tests/utils.tsx`（共享测试工具）
- 修改所有 `*.test.tsx` 文件（迁移至共享工具，修复 mock）
- 修改 `src/hooks/usePermission.ts`（修复 magic number 为 `user?.is_super_admin` — 若后端已支持）
- 修改 `src/components/layout/AppLayout.tsx`（使用 `useResponsive` 替代直接 `useBreakpoint`）
- 优化 `src/utils/menu.ts` 与 `src/hooks/useMenuTree.ts` 的重复逻辑

**关键改动**：

`tests/setup.ts`：
```ts
class IntersectionObserverMock {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
});
```

`tests/utils.tsx`：
```tsx
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import rootReducer from '@/app/rootReducer';
import { adminApi } from '@/services/adminApi';

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(adminApi.middleware),
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, store = createTestStore(preloadedState), route = '/' } = {}
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}
```

测试文件重构：
- 所有页面测试删除自身的 `createTestStore` / `renderWithProviders`
- 统一 `import { renderWithProviders } from '@/tests/utils'`（需要配置 path alias 或相对路径）
- 使用 MSW 拦截请求进行行为测试
- 删除未使用的 `vi.mock('@/services/api')`

`usePermission.ts`：
- 如果后端 `CurrentUserResponse` 包含 `is_super_admin`，改为 `user?.is_super_admin === true`
- 否则保持 `user?.id === 1` 并添加 TODO 注释

`AppLayout.tsx`：
- 将 `import { useBreakpoint } from 'antd/es/grid'` 改为 `import { useResponsive } from '@/hooks'`

**验证标准**：
- `pnpm test`：全部通过（目标 106 pass, 0 fail）
- `pnpm build` 通过
- `pnpm lint` 通过
- `grep -r "axios" src/` 无残留
- `grep -r "createAsyncThunk" src/` 无残留
- `grep -r "as unknown as" src/` 无残留（已迁移代码中）
- `grep -r "from '@/modules/.*/api'" src/` 无残留（所有模块 api.ts 已删除）

**回滚**：重新安装 axios，恢复 `api.ts`/`request.ts`/`errorHandler.ts`，还原测试文件。

---

## 全局回滚策略

每个 Phase 完成后创建一个 git commit。若某阶段出现问题：

```bash
git revert <phase-commit>
# 若有冲突，手动 checkout 上一阶段文件
pnpm install  # 若 package.json 变更
pnpm build && pnpm test
```

最高风险阶段是 Phase 5（Auth 迁移）。若登录流程被破坏，立即 revert Phase 5 并排查。Phase 1-4 的 revert 不会影响 Auth 功能。

---

## 风险评估与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| Auth 会话流程被破坏 | 中 | 高 | Phase 5 单独作为一个 commit；手动完整测试 login/logout/refresh/profile；保留 auth slice 作为真相源 |
| RTK Query 缓存未正确失效 | 中 | 中 | 每个 mutation 都显式声明 `invalidatesTags`；Phase 3-4 中手动验证增删改后的自动刷新 |
| `fetchBaseQuery` 与 axios 行为差异（如 params 序列化） | 低 | 中 | Phase 4 中重点测试分页和搜索参数传递 |
| 测试迁移工作量超预期 | 中 | 低 | Phase 6 集中处理；使用共享 `renderWithProviders` 大幅减少重复代码；对低价值测试直接删除而非重写 |
| 构建失败（`verbatimModuleSyntax` / `noUnusedLocals`） | 低 | 低 | 每个 Phase 都运行 `pnpm build`；TypeScript 严格模式在开发时即捕获问题 |

---

## 验收检查清单

实施全部完成后，运行以下命令验证：

```bash
cd /d/Project/frontend
pnpm lint        # 应无错误
pnpm build       # 应成功
pnpm test        # 应全部通过

# 代码质量检查
grep -r "createAsyncThunk" src/        # 应为空
grep -r "as unknown as" src/modules/   # 应为空
grep -r "axios" src/                   # 应为空
grep -r "from '@/modules/.*/api'" src/ # 应为空
grep -r "dispatch(fetch" src/          # 应为空（除了 dashboard 可能的聚合查询）
```

手动测试路径：
1. 登录 → 进入 Dashboard
2. 用户管理：搜索、分页、新增、编辑、删除
3. 角色管理：新增、编辑（加载菜单树）、删除
4. 菜单管理：新增、编辑、删除（观察树自动刷新）
5. 个人资料：修改头像、修改信息
6. 登出 → 验证跳转登录页
7. 直接访问需要权限的路由 → 验证权限拦截
8. 清除 Token 后刷新页面 → 验证重定向登录
