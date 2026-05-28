# 前端 RTK Query 重构总进度

> 基于 [fronted-reved.md](./fronted-reved.md) 的六阶段重构计划。
> 每个 Phase 完成后应能独立构建、测试、合并。

---

## Phase 1: Foundation — 基础设施搭建

- [ ] 创建 `src/services/adminApi.ts`（自定义 baseQuery + createApi）
- [ ] 修改 `src/store/index.ts`（注入 api middleware）
- [ ] 修改 `src/app/rootReducer.ts`（挂载 `adminApi.reducerPath`）
- [ ] 扩展 `src/types/api.ts`（ApiError 类型补充）
- [ ] 修改 `src/modules/auth/slice.ts`（新增 `setToken` / `setUserAndPermissions`）
- [ ] 验证：`pnpm build` / `pnpm lint` / `pnpm test` 基线通过
- [ ] Commit: `feat(frontend): Phase 1 — RTK Query 基础设施`

## Phase 2: Upload 模块迁移

- [ ] 注入 `uploadFile` endpoint 到 `adminApi`
- [ ] 删除 `src/modules/upload/api.ts`
- [ ] 删除 `src/modules/upload/slice.ts`
- [ ] 移除 `rootReducer` 中的 upload reducer
- [ ] 迁移 `ImageUploader.tsx` 至 `useUploadFileMutation`
- [ ] 清理 `ProfilePage.tsx` 中的旧 upload 引用
- [ ] 删除 `upload/tests/api.test.ts`
- [ ] 手动验证头像上传功能
- [ ] Commit: `refactor(frontend): Phase 2 — Upload 模块迁移至 RTK Query`

## Phase 3: Menu 模块迁移

- [ ] 注入 menu endpoints（getAllMenus / createMenu / updateMenu / deleteMenu）
- [ ] 删除 `src/modules/menu/api.ts` / `slice.ts`
- [ ] 移除 `rootReducer` 中的 menu reducer
- [ ] 迁移 `MenuListPage.tsx`（替换 dispatch + selector）
- [ ] 迁移 `MenuFormModal.tsx`（替换 mutation + 手动刷新）
- [ ] 删除 menu 相关旧测试文件
- [ ] 修改 menu 页面测试（MSW 拦截 + RTK Query hooks）
- [ ] 手动验证菜单增删改查 + 自动刷新
- [ ] Commit: `refactor(frontend): Phase 3 — Menu 模块迁移至 RTK Query`

## Phase 4: User + Role 模块迁移

- [ ] 注入 user endpoints（getUsers / createUser / updateUser / deleteUser）
- [ ] 注入 role endpoints（getRoles / getRole / createRole / updateRole / deleteRole）
- [ ] 删除 `user/api.ts` / `slice.ts` / `role/api.ts` / `slice.ts`
- [ ] 移除 `rootReducer` 中的 user / role reducer
- [ ] 新增 `src/hooks/useCrudTable.ts`
- [ ] 优化 `src/hooks/usePagination.ts`（引用稳定性）
- [ ] 迁移 `UserListPage.tsx` / `UserFormModal.tsx`
- [ ] 迁移 `RoleListPage.tsx` / `RoleFormModal.tsx`
- [ ] 清理跨模块 `dispatch(fetchRoles())` 耦合
- [ ] 删除 user/role 旧测试文件
- [ ] 修改 user/role 页面测试
- [ ] 手动验证分页、搜索、角色下拉、自动刷新
- [ ] Commit: `refactor(frontend): Phase 4 — User/Role 模块迁移 + useCrudTable`

## Phase 5: Auth 模块迁移

- [ ] 注入 auth endpoints（login / logout / getCurrentUser / updateProfile）
- [ ] 重写 `src/modules/auth/slice.ts`（删除 thunk，保留精简 reducer）
- [ ] 迁移 `LoginPage.tsx`（`useLoginMutation`）
- [ ] 迁移 `ProfilePage.tsx`（`useUpdateProfileMutation`）
- [ ] 迁移 `UserDropdown.tsx`（`useLogoutMutation`）
- [ ] 迁移 `AuthGuard`（`useGetCurrentUserQuery`）
- [ ] 删除 `auth/api.ts`
- [ ] 重写 `auth/tests/slice.test.ts`（纯 reducer 测试）
- [ ] 修改 `LoginPage.test.tsx`
- [ ] 手动验证：登录 / 登出 / 刷新恢复 / 个人资料 / 401跳转
- [ ] Commit: `refactor(frontend): Phase 5 — Auth 模块迁移至 RTK Query`

## Phase 6: Cleanup

- [ ] 删除 `src/services/api.ts` / `request.ts` / `errorHandler.ts`
- [ ] 删除 `src/services/tests/`（如存在）
- [ ] 移除 `axios` 依赖（`package.json`）
- [ ] `tests/setup.ts` 添加 `IntersectionObserver` mock
- [ ] 新增 `tests/utils.tsx`（共享 `renderWithProviders` / `createTestStore`）
- [ ] 迁移所有 `*.test.tsx` 至共享测试工具
- [ ] 修复 `usePermission.ts` magic number（`is_super_admin`）
- [ ] 修复 `AppLayout.tsx`（`useResponsive` 替代 `useBreakpoint`）
- [ ] 优化 `utils/menu.ts` 与 `hooks/useMenuTree.ts` 重复逻辑
- [ ] 全局检查：`createAsyncThunk` / `axios` / `as unknown as` / `dispatch(fetch` 残留
- [ ] `pnpm test` 全部通过（目标 106 pass, 0 fail）
- [ ] `pnpm build` / `pnpm lint` 通过
- [ ] Commit: `refactor(frontend): Phase 6 — 移除 axios，统一测试工具，清理遗留`

---

## 当前状态

| Phase | 状态 | 备注 |
|-------|------|------|
| Phase 1 | ✅ 已完成 | RTK Query 基础设施搭建 |
| Phase 2 | ✅ 已完成 | Upload 模块迁移 |
| Phase 3 | ✅ 已完成 | Menu 模块迁移 |
| Phase 4 | ✅ 已完成 | User + Role 模块迁移 |
| Phase 5 | ✅ 已完成 | Auth 模块迁移 |
| Phase 6 | ✅ 已完成 | Cleanup：移除 axios、统一测试工具、修复遗留问题 |

> 全部 6 个 Phase 已完成。构建、测试、Lint 均通过。
