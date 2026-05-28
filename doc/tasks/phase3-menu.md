# Phase 3: Menu 模块迁移（树形数据 + Tag 失效模式）

**目标**：迁移菜单模块，建立 `providesTags` / `invalidatesTags` 的标准模式。树形结构，无分页。

---

## 前置依赖

- [ ] Phase 1 已完成并合并

## 子任务

### adminApi 注入 menu endpoints

- [ ] 在 `src/services/adminApi.ts` 中注入：
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

### 页面组件迁移

- [ ] 修改 `src/modules/menu/pages/MenuListPage.tsx`
  - [ ] `const { data: allMenus = [], isLoading } = useGetAllMenusQuery()`
  - [ ] `const [deleteMenu] = useDeleteMenuMutation()`
  - [ ] 移除 `useEffect(() => dispatch(fetchAllMenus()), [dispatch])`
  - [ ] 移除 `useAppSelector(state => state.menu)`
  - [ ] `columns` 中的删除操作改为调用 `deleteMenu(id).unwrap()`

- [ ] 修改 `src/modules/menu/components/MenuFormModal.tsx`
  - [ ] `const [createMenu] = useCreateMenuMutation()`
  - [ ] `const [updateMenu] = useUpdateMenuMutation()`
  - [ ] 提交成功后调用 `onSuccess()` prop，**无需手动刷新列表**
  - [ ] 错误处理通过 mutation 的 `error` 属性

### 清理旧代码

- [ ] 删除 `src/modules/menu/api.ts`
- [ ] 删除 `src/modules/menu/slice.ts`
- [ ] 修改 `src/app/rootReducer.ts`：移除 `menu` reducer
- [ ] 删除 `src/modules/menu/tests/api.test.ts`
- [ ] 删除 `src/modules/menu/tests/slice.test.ts`

### 测试迁移

- [ ] 修改 `src/modules/menu/tests/MenuListPage.test.tsx`
  - [ ] 使用 MSW 拦截 `/menus/all` 请求
  - [ ] 删除 `vi.mock('@/modules/menu/api')` 或类似 mock
  - [ ] 验证列表渲染、删除操作后列表自动刷新

- [ ] 修改 `src/modules/menu/tests/MenuFormModal.test.tsx`
  - [ ] MSW 拦截 POST/PUT `/menus`
  - [ ] 验证提交后 `onSuccess` 被调用

### 验证

- [ ] 菜单的增删改查手动测试通过
- [ ] 操作后树形列表**自动刷新**（无需手动 F5）
- [ ] `pnpm build` 无错误
- [ ] `grep -r "menu/slice\|menu/api" src/` 无残留
- [ ] `grep -r "as unknown as" src/modules/menu/` 无残留

---

## 关键文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/adminApi.ts` | 修改 | 注入 menu endpoints |
| `src/modules/menu/pages/MenuListPage.tsx` | 修改 | 使用 query/mutation hooks |
| `src/modules/menu/components/MenuFormModal.tsx` | 修改 | 使用 mutation hooks |
| `src/modules/menu/api.ts` | 删除 | |
| `src/modules/menu/slice.ts` | 删除 | |
| `src/modules/menu/tests/api.test.ts` | 删除 | |
| `src/modules/menu/tests/slice.test.ts` | 删除 | |
| `src/modules/menu/tests/MenuListPage.test.tsx` | 修改 | MSW + RTK Query |
| `src/modules/menu/tests/MenuFormModal.test.tsx` | 修改 | MSW + RTK Query |
| `src/app/rootReducer.ts` | 修改 | 移除 menu reducer |

---

## 回滚

恢复 menu 的 api.ts/slice.ts，还原页面和 rootReducer。
