# Phase 6: Cleanup — 移除 Axios、统一测试工具、修复遗留问题

**目标**：清理旧代码，修复测试体系，优化剩余工程问题。全部完成后系统达到最终目标状态。

---

## 前置依赖

- [ ] Phase 1-5 全部完成并合并

## 子任务

### 移除 Axios 及旧服务层

- [ ] 删除 `src/services/api.ts`
- [ ] 删除 `src/services/request.ts`（如存在）
- [ ] 删除 `src/services/errorHandler.ts`（如存在）
- [ ] 删除 `src/services/tests/` 目录（如存在）
- [ ] 修改 `package.json`
  - [ ] 移除 `axios` 依赖
  - [ ] 运行 `pnpm install` 更新 lockfile

### 测试基础设施增强

- [ ] 修改 `tests/setup.ts`
  - [ ] 添加 `IntersectionObserver` mock（Ant Design 组件可能需要）：
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

- [ ] 新建 `tests/utils.tsx`
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

### 测试文件统一迁移

- [ ] 遍历所有 `src/**/*.test.tsx`
  - [ ] 删除每个测试文件中私有的 `createTestStore` / `renderWithProviders`
  - [ ] 统一改为 `import { renderWithProviders } from '@/tests/utils'`
  - [ ] 删除未使用的 `vi.mock('@/services/api')`
  - [ ] 删除未使用的 `vi.mock('@/modules/...')`（MSW 已覆盖）
  - [ ] 确保 MSW handler 覆盖该测试所需的全部接口

### 遗留问题修复

- [ ] 修改 `src/hooks/usePermission.ts`
  - [ ] 如果后端 `CurrentUserResponse` 已包含 `is_super_admin`：改为 `user?.is_super_admin === true`
  - [ ] 否则保持 `user?.id === 1` 并添加 TODO 注释说明待后端支持

- [ ] 修改 `src/components/layout/AppLayout.tsx`
  - [ ] 将 `import { useBreakpoint } from 'antd/es/grid'` 改为 `import { useResponsive } from '@/hooks'`

- [ ] 优化 `src/utils/menu.ts` 与 `src/hooks/useMenuTree.ts`
  - [ ] 识别重复逻辑
  - [ ] 将重复部分抽取到其中一个文件，另一个引用之
  - [ ] 或合并为一个统一工具

### 全局代码质量检查

- [ ] `grep -r "axios" src/` → 应为空
- [ ] `grep -r "createAsyncThunk" src/` → 应为空
- [ ] `grep -r "as unknown as" src/modules/` → 应为空
- [ ] `grep -r "from '@/modules/.*/api'" src/` → 应为空
- [ ] `grep -r "dispatch(fetch" src/` → 应为空（dashboard 可能的聚合查询除外，需人工确认）

### 最终验证

- [ ] `pnpm test`：全部通过（目标 106 pass, 0 fail）
- [ ] `pnpm build`：成功
- [ ] `pnpm lint`：无错误
- [ ] 手动回归测试：
  - [ ] 登录 → Dashboard
  - [ ] 用户管理：搜索、分页、新增、编辑、删除
  - [ ] 角色管理：新增、编辑（加载菜单树）、删除
  - [ ] 菜单管理：新增、编辑、删除（树自动刷新）
  - [ ] 个人资料：修改头像、修改信息
  - [ ] 登出 → 跳转登录页
  - [ ] 直接访问需要权限的路由 → 权限拦截
  - [ ] 清除 Token 后刷新页面 → 重定向登录

---

## 关键文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/api.ts` | 删除 | Axios 实例 |
| `src/services/request.ts` | 删除 | 如存在 |
| `src/services/errorHandler.ts` | 删除 | 如存在 |
| `src/services/tests/` | 删除 | 如存在 |
| `package.json` | 修改 | 移除 axios |
| `pnpm-lock.yaml` | 修改 | 移除 axios |
| `tests/setup.ts` | 修改 | 添加 IntersectionObserver mock |
| `tests/utils.tsx` | 新增 | 共享测试工具 |
| `src/**/*.test.tsx` | 批量修改 | 统一使用 renderWithProviders |
| `src/hooks/usePermission.ts` | 修改 | 修复 magic number |
| `src/components/layout/AppLayout.tsx` | 修改 | useResponsive |
| `src/utils/menu.ts` / `useMenuTree.ts` | 修改 | 消除重复 |

---

## 回滚

重新安装 axios，恢复 `api.ts`/`request.ts`/`errorHandler.ts`，还原测试文件。
