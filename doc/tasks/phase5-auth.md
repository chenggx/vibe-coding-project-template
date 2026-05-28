# Phase 5: Auth 模块迁移（Token 与会话管理）

**目标**：迁移最复杂的 auth 模块，将服务端通信移交 RTK Query，slice 退化为客户端状态管理。

---

## 前置依赖

- [ ] Phase 1-4 已完成并合并（至少 Phase 1 必须完成，因为需要 adminApi 基础设施）

## 子任务

### adminApi 注入 auth endpoints

- [ ] 在 `src/services/adminApi.ts` 中注入：
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

### Auth Slice 重写

- [ ] 重写 `src/modules/auth/slice.ts`
  - [ ] **删除** `login`、`fetchCurrentUser`、`logout`、`updateProfile` 四个 thunk
  - [ ] **删除** `extractErrorMessage` 辅助函数（如无其他用途）
  - [ ] **保留** `initialState`、`AuthState` 类型定义
  - [ ] **保留** `resetAuth`、`clearError` reducer
  - [ ] **新增** `setToken` reducer（设置 token + isAuthenticated）
  - [ ] **新增** `setUserAndPermissions` reducer（设置 user / userMenus / permissions，清除 loading）
  - [ ] 导出精简后的 reducer 和 actions

### 路由与守卫迁移

- [ ] 修改 `src/app/routes.tsx` 中的 `AuthGuard`
  - [ ] **移除** `useEffect(() => { if (token && !user) dispatch(fetchCurrentUser()) }, [dispatch, token, user])`
  - [ ] 使用 `const { isLoading: isFetchingUser } = useGetCurrentUserQuery(undefined, { skip: !token || !!user })`
  - [ ] `loading` 判断改为 `isFetchingUser || state.auth.loading`（或直接 `isFetchingUser`）
  - [ ] 权限检查逻辑保持不变（继续读取 `state.auth.permissions`）

### 页面组件迁移

- [ ] 修改 `src/modules/auth/pages/LoginPage.tsx`
  - [ ] `const [login, { isLoading, error }] = useLoginMutation()`
  - [ ] 提交时 `await login(values).unwrap()`
  - [ ] 成功后 `navigate('/dashboard')`
  - [ ] 错误展示通过 `error` 属性转换（无需再处理 thunk rejected）

- [ ] 修改 `src/modules/auth/pages/ProfilePage.tsx`
  - [ ] `const [updateProfile, { isLoading }] = useUpdateProfileMutation()`
  - [ ] 提交时 `await updateProfile(data).unwrap()`
  - [ ] 成功后提示并更新本地状态（`onQueryStarted` 已同步 Redux）

- [ ] 修改 `src/modules/auth/components/UserDropdown.tsx`
  - [ ] `const [logout] = useLogoutMutation()`
  - [ ] 点击时 `logout().unwrap()`
  - [ ] 成功后导航到 `/login`（`onQueryStarted` 已清除状态）

### 清理旧代码

- [ ] 删除 `src/modules/auth/api.ts`
- [ ] 检查 `src/services/api.ts` 是否还有 auth 相关引用（Phase 6 统一删除）

### 测试重写

- [ ] 重写 `src/modules/auth/tests/slice.test.ts`
  - [ ] **删除** 所有 thunk 相关测试（pending/fulfilled/rejected）
  - [ ] 测试 `setToken`：设置 token 和 isAuthenticated
  - [ ] 测试 `setUserAndPermissions`：设置 user、menus、permissions
  - [ ] 测试 `resetAuth`：恢复初始状态
  - [ ] 测试 `clearError`：清除 error

- [ ] 修改 `src/modules/auth/tests/LoginPage.test.tsx`
  - [ ] MSW 拦截 POST `/login`
  - [ ] 验证登录成功后跳转到 dashboard
  - [ ] 验证登录失败后显示错误信息

### 验证

- [ ] 登录流程手动测试通过
- [ ] 登出流程手动测试通过
- [ ] 页面刷新后会话恢复手动测试通过（清除 Redux 后刷新，能自动获取当前用户）
- [ ] 个人资料更新手动测试通过
- [ ] 401/10002 响应正确跳转登录页
- [ ] `grep -r "state.auth.loading" src/` 不再被组件使用（仅 slice 内部可能保留）
- [ ] `pnpm build` 无错误
- [ ] `auth/slice.test.ts` 测试通过

---

## 关键文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/adminApi.ts` | 修改 | 注入 auth endpoints |
| `src/modules/auth/slice.ts` | 重写 | 删除 thunk，精简 reducer |
| `src/app/routes.tsx` | 修改 | AuthGuard 使用 RTK Query hook |
| `src/modules/auth/pages/LoginPage.tsx` | 修改 | useLoginMutation |
| `src/modules/auth/pages/ProfilePage.tsx` | 修改 | useUpdateProfileMutation |
| `src/modules/auth/components/UserDropdown.tsx` | 修改 | useLogoutMutation |
| `src/modules/auth/api.ts` | 删除 | |
| `src/modules/auth/tests/slice.test.ts` | 重写 | 纯 reducer 测试 |
| `src/modules/auth/tests/LoginPage.test.tsx` | 修改 | MSW + RTK Query |

---

## 回滚

恢复 auth/api.ts 和旧版 slice.ts（含 thunk），还原 LoginPage/ProfilePage/UserDropdown/AuthGuard。

**⚠️ 本阶段为高风险阶段。若登录流程被破坏，立即 revert 并排查。**
