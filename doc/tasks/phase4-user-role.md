# Phase 4: User + Role 模块迁移（分页 CRUD + 页面抽象）

**目标**：迁移两个标准分页 CRUD 模块，提取 `useCrudTable` hook，消除跨模块耦合。

---

## 前置依赖

- [ ] Phase 1 已完成并合并

## 子任务

### adminApi 注入 user endpoints

- [ ] 注入：
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

### adminApi 注入 role endpoints

- [ ] 注入：
  ```ts
  getRoles: build.query<{ data: Role[]; meta: PaginationMeta }, FetchRolesParams>({
    query: (params) => ({ url: '/roles', params }),
    providesTags: (result) =>
      result ? [...result.data.map(r => ({ type: 'Role' as const, id: r.id })), 'Role'] : ['Role'],
  })
  getRole: build.query<Role, number>({
    query: (id) => `/roles/${id}`,
    providesTags: (result, error, id) => [{ type: 'Role', id }],
  })
  createRole: build.mutation<Role, CreateRoleDto>({
    query: (body) => ({ url: '/roles', method: 'POST', body }),
    invalidatesTags: ['Role'],
  })
  updateRole: build.mutation<Role, { id: number; data: UpdateRoleDto }>({
    query: ({ id, data }) => ({ url: `/roles/${id}`, method: 'PUT', body: data }),
    invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }, 'Role'],
  })
  deleteRole: build.mutation<void, number>({
    query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
    invalidatesTags: ['Role'],
  })
  ```

### 新增 useCrudTable hook

- [ ] 新建 `src/hooks/useCrudTable.ts`：
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

### 优化 usePagination

- [ ] 修改 `src/hooks/usePagination.ts`
  - [ ] `getPaginationConfig` 返回 memoized 对象（`useMemo`）
  - [ ] 或改为 `paginationConfig` 返回值，避免每次渲染重建引用

### User 页面迁移

- [ ] 修改 `src/modules/user/pages/UserListPage.tsx`
  - [ ] `const { data, isLoading } = useGetUsersQuery(params)`
  - [ ] `const [deleteUser] = useDeleteUserMutation()`
  - [ ] 引入 `useCrudTable<User>()` 管理 Modal 和删除确认
  - [ ] `columns` 用 `useMemo` 包装
  - [ ] `pagination` 配置用 `useMemo` 包装

- [ ] 修改 `src/modules/user/components/UserFormModal.tsx`
  - [ ] `const [createUser] = useCreateUserMutation()`
  - [ ] `const [updateUser] = useUpdateUserMutation()`
  - [ ] **移除** `import { fetchRoles } from '@/modules/role/slice'`
  - [ ] 使用 `const { data: rolesData } = useGetRolesQuery({ per_page: 100 }, { skip: !open })` 获取角色下拉
  - [ ] 提交成功后调用 `onSuccess()`

### Role 页面迁移

- [ ] 修改 `src/modules/role/pages/RoleListPage.tsx`
  - [ ] `const { data, isLoading } = useGetRolesQuery(params)`
  - [ ] `const [deleteRole] = useDeleteRoleMutation()`
  - [ ] 引入 `useCrudTable<Role>()`

- [ ] 修改 `src/modules/role/components/RoleFormModal.tsx`
  - [ ] `const [createRole] = useCreateRoleMutation()`
  - [ ] `const [updateRole] = useUpdateRoleMutation()`
  - [ ] 编辑时如需角色详情，使用 `useGetRoleQuery(id, { skip: !id })`

### 清理旧代码

- [ ] 删除 `src/modules/user/api.ts` / `slice.ts`
- [ ] 删除 `src/modules/role/api.ts` / `slice.ts`
- [ ] 修改 `src/app/rootReducer.ts`：移除 user / role reducer
- [ ] 删除 `src/modules/user/tests/api.test.ts` / `slice.test.ts`
- [ ] 删除 `src/modules/role/tests/api.test.ts` / `slice.test.ts`

### 测试迁移

- [ ] 修改 `src/modules/user/tests/UserListPage.test.tsx`
- [ ] 修改 `src/modules/user/tests/UserFormModal.test.tsx`
- [ ] 修改 `src/modules/role/tests/RoleListPage.test.tsx`
- [ ] 修改 `src/modules/role/tests/RoleFormModal.test.tsx`
  - [ ] 统一使用 MSW 拦截 HTTP
  - [ ] 删除 `vi.mock('@/modules/...')` 式 mock
  - [ ] 使用共享 `renderWithProviders`（如果 Phase 6 已提前完成，否则保持独立）

### 验证

- [ ] 用户管理增删改查、分页、搜索手动测试通过
- [ ] 角色管理增删改查手动测试通过
- [ ] 创建/编辑用户时角色下拉列表正常加载
- [ ] 操作后列表自动刷新
- [ ] `pnpm build` 无错误
- [ ] `grep -r "dispatch(fetch" src/modules/user/` 无残留
- [ ] `grep -r "dispatch(fetch" src/modules/role/` 无残留
- [ ] `useCrudTable` 被至少两个页面使用

---

## 关键文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/adminApi.ts` | 修改 | 注入 user/role endpoints |
| `src/hooks/useCrudTable.ts` | 新增 | CRUD 页面通用逻辑 |
| `src/hooks/usePagination.ts` | 修改 | 引用稳定性优化 |
| `src/modules/user/pages/UserListPage.tsx` | 修改 | RTK Query + useCrudTable |
| `src/modules/user/components/UserFormModal.tsx` | 修改 | RTK Query，移除跨模块 dispatch |
| `src/modules/role/pages/RoleListPage.tsx` | 修改 | RTK Query + useCrudTable |
| `src/modules/role/components/RoleFormModal.tsx` | 修改 | RTK Query |
| `src/modules/user/api.ts` | 删除 | |
| `src/modules/user/slice.ts` | 删除 | |
| `src/modules/role/api.ts` | 删除 | |
| `src/modules/role/slice.ts` | 删除 | |
| `src/app/rootReducer.ts` | 修改 | 移除 user/role reducer |
| user/role tests | 修改 | MSW + RTK Query |

---

## 回滚

恢复 user/role 的 api.ts/slice.ts，还原页面和 rootReducer。
