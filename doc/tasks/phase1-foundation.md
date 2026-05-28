# Phase 1: Foundation — 基础设施搭建

**目标**：创建 RTK Query 核心架构，不触碰任何现有业务代码。完成后系统完全可用。

---

## 子任务

### adminApi 创建

- [ ] 新建 `src/services/adminApi.ts`
  - [ ] 导入 `createApi`, `fetchBaseQuery` from `@reduxjs/toolkit/query/react`
  - [ ] 定义 `baseQuery`：`fetchBaseQuery({ baseUrl, prepareHeaders })`，从 `state.auth.token` 读取 Bearer Token
  - [ ] 定义 `customBaseQuery`：
    - 调用 `baseQuery` 获取原始响应
    - 解包 `{ code, message, data }`
    - `code !== 0` → 返回 `{ error: { status: code, data: { message, code } } }`
    - `code === 10002` 或 HTTP 401 → dispatch `resetAuth()` + `window.location.href = '/login'`
    - 含 `meta` → 返回 `{ data: { data, meta } }`
    - 否则返回 `{ data }`
  - [ ] 导出 `adminApi = createApi({ reducerPath: 'adminApi', baseQuery: customBaseQuery, tagTypes: ['User', 'Role', 'Menu', 'Auth', 'Upload'], endpoints: () => ({}) })`

### Store 挂载

- [ ] 修改 `src/store/index.ts`
  - [ ] middleware 中添加 `.concat(adminApi.middleware)`
- [ ] 修改 `src/app/rootReducer.ts`
  - [ ] 导入 `adminApi`
  - [ ] reducer map 中添加 `[adminApi.reducerPath]: adminApi.reducer`

### 类型扩展

- [ ] 修改 `src/types/api.ts`
  - [ ] 确保 `ApiError` 类型包含 `code` 和 `message` 字段（供 baseQuery 使用）

### Auth Slice 扩展

- [ ] 修改 `src/modules/auth/slice.ts`
  - [ ] 新增 `setToken(state, action: PayloadAction<string>)`：设置 `token` 和 `isAuthenticated`
  - [ ] 新增 `setUserAndPermissions(state, action: PayloadAction<CurrentUserResponse>)`：设置 `user`、`userMenus`、`permissions`（调用 `extractPermissions`），清除 `loading`
  - [ ] **保留** `resetAuth` 和 `clearError`
  - [ ] **保留** 所有 `createAsyncThunk`（Phase 5 再删除，避免编译错误）

### 验证

- [ ] `pnpm build` 无错误
- [ ] `pnpm lint` 无错误
- [ ] `pnpm test` 通过数量与基线一致（86 pass, 20 fail）
- [ ] Dev server 启动正常
- [ ] 应用功能无变化

---

## 关键文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/adminApi.ts` | 新增 | RTK Query 核心 |
| `src/store/index.ts` | 修改 | 注入 middleware |
| `src/app/rootReducer.ts` | 修改 | 挂载 reducer |
| `src/types/api.ts` | 修改 | 扩展类型 |
| `src/modules/auth/slice.ts` | 修改 | 新增 reducer，保留 thunk |

---

## 回滚

```bash
git revert <phase1-commit>
# 或直接删除 adminApi.ts，还原 store/rootReducer/authSlice
```
