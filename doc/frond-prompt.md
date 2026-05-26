# Vibe Coding Prompt — Admin Frontend

## 1. 你的角色与目标

你是一位**全栈前端开发专家**。你的任务是**独立、完整、零人工干预**地实现一个基于 React + TypeScript 的后台管理系统前端。

项目已有详细设计文档，你的工作是：
1. 阅读设计文档和 API 文档
2. 按模块逐个实现代码
3. 每个模块自带完整的单元测试
4. 通过 ESLint 代码检查
5. 更新进度文档
6. 自动推进到下一个模块，直至全部完成

**禁止行为**：
- 不要向用户提问（除非遇到无法自行解决的系统级阻塞）
- 不要跳过测试
- 不要使用 `any` 类型
- 不要在一个模块未通过质量门禁时开始下一个模块

---

## 2. 项目上下文

| 项 | 值 |
|----|-----|
| **项目路径** | `frontend/`（与 `backend/` 同级） |
| **技术栈** | React 18 + TypeScript 5 + Vite 6 + Ant Design 5 + Redux Toolkit 2 + React Router DOM 6 + Axios |
| **测试栈** | Vitest + React Testing Library + MSW (Mock Service Worker) + jsdom |
| **后端 API Base** | `http://localhost:8000/api`（开发时通过 Vite proxy 代理） |
| **参考文档** | `doc/frond-detail.md`（架构与模块设计）、`doc/api-document.md`（API 详情）、`doc/frond-progress.md`（进度追踪） |

---

## 3. 开发工作流（严格执行）

```
Step 1: 读取 doc/frond-progress.md，找到第一个状态为 [ ] 的模块
Step 2: 读取 doc/frond-detail.md 中该模块的详细设计章节
Step 3: 读取 doc/api-document.md 中该模块涉及的所有 API 接口
Step 4: 按顺序实现文件：types.ts → api.ts → slice.ts → components/ → pages/ → tests/
Step 5: 运行质量门禁（见第 8 节）
Step 6: 若门禁未通过，修复问题后重复 Step 5
Step 7: 更新 doc/frond-progress.md，将该模块所有子任务标记为 [x]
Step 8: 若还有未完成的模块，回到 Step 1；否则输出完成报告
```

**关键规则**：
- 每次只聚焦**一个模块**，彻底完成后再切换
- 实现时先写类型定义，再写 API，再写 Redux，再写组件，最后写测试
- 共享组件（如 `DataTable`, `PermissionButton`）在首次被需要时创建，后续模块复用

---

## 4. 核心架构规范

### 4.1 模块目录结构（强制统一）

每个业务模块必须遵循以下结构：

```
src/modules/{moduleName}/
├── types.ts           # 模块专属 TypeScript 接口/类型
├── api.ts             # API 调用函数（只依赖 src/services/api.ts）
├── slice.ts           # Redux slice + createAsyncThunk
├── components/        # 模块级 UI 组件
├── pages/             # 页面级组件（路由直接挂载的组件）
├── tests/             # 单元测试
│   ├── slice.test.ts
│   ├── api.test.ts
│   └── components/    # 或 pages/
└── index.ts           # 统一导出（可选）
```

### 4.2 Redux Toolkit Slice 模板

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { moduleApi } from './api';
import { ModuleState, SomeEntity } from './types';

const initialState: ModuleState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  currentItem: null,
};

// Async Thunks
export const fetchItems = createAsyncThunk(
  'moduleName/fetchItems',
  async (params: FetchParams, { rejectWithValue }) => {
    try {
      return await moduleApi.getItems(params);
    } catch (err: any) {
      return rejectWithValue(err.message || '请求失败');
    }
  }
);

export const createItem = createAsyncThunk(...);
export const updateItem = createAsyncThunk(...);
export const deleteItem = createAsyncThunk(...);

// Slice
const moduleSlice = createSlice({
  name: 'moduleName',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<PaginatedResponse<SomeEntity>>) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      // ... 其他 CRUD cases
  },
});

export const { clearError } = moduleSlice.actions;
export default moduleSlice.reducer;
```

### 4.3 API 封装规范

所有 API 函数通过 `src/services/api.ts` 中的 axios instance 发起请求。

```typescript
// modules/user/api.ts
import api from '@/services/api';
import { User, CreateUserDto, UpdateUserDto, FetchUsersParams, PaginatedResponse, ApiResponse } from './types';

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

**Axios Instance 关键行为**（已实现于 `src/services/api.ts`）：
- Request 拦截器：自动从 `localStorage` 读取 `token` 注入 `Authorization: Bearer {token}`
- Response 拦截器：解构 `{ code, message, data }`
  - `code !== 0`：抛出业务错误
  - `code === 10002` 或 HTTP 401：清除 token，跳转 `/login`
  - 正常时直接返回 `data`

### 4.4 权限系统规范

权限分两层：

**A. 路由/菜单级权限**
- 侧边栏菜单直接渲染 `authSlice.userMenus`（后端已过滤）
- 路由守卫检查目标路由的 `permission` 是否在 `authSlice.permissions` 中

**B. 按钮/元素级权限**
- 提供 `usePermission()` hook：`const { hasPermission } = usePermission()`
- 提供 `<PermissionButton permission="users.create">` 组件
- 提供 `<PermissionWrapper permission="users.update">` 组件
- 超级管理员（`is_super_admin = true`）始终返回 `true`

### 4.5 响应式断点

| 断点 | 宽度 | 行为 |
|------|------|------|
| `xs` | < 576px | 手机：Drawer 侧边栏，单列，表格横向滚动 |
| `sm` | ≥ 576px | 大手机：Drawer 侧边栏 |
| `md` | ≥ 768px | 平板：Drawer 侧边栏，可两列 |
| `lg` | ≥ 992px | 小桌面：固定可折叠侧边栏（80px 折叠态） |
| `xl` | ≥ 1200px | 桌面：固定展开侧边栏（240px） |
| `xxl` | ≥ 1600px | 大桌面：宽内容区 |

使用 `useResponsive()` hook 或 Ant Design Grid 的 `useBreakpoint()` 实现。

---

## 5. 组件开发规范

### 5.1 命名
- 目录/文件：`kebab-case`（`user-form-modal.tsx`）
- 组件名：`PascalCase`（`UserFormModal`）
- Hooks：`use` 前缀，`camelCase`（`usePermission`）
- Slice：`camelCase`（`userSlice`）
- 类型：`PascalCase`（`CreateUserDto`）

### 5.2 导入顺序
```typescript
// 1. React / 第三方库
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// 2. Ant Design
import { Button, Modal } from 'antd';

// 3. 绝对路径模块（@/）
import { usePermission } from '@/hooks/usePermission';
import { userApi } from '@/modules/user/api';

// 4. 相对路径
import { UserForm } from './components/UserForm';
```

### 5.3 类型安全
- 所有 Props 必须定义 `interface`
- 所有 API 参数/响应必须定义类型
- Redux `initialState` 必须显式标注类型
- **禁止**使用 `any`，使用 `unknown` + 类型收窄

---

## 6. 测试规范

### 6.1 测试框架
- **Vitest**：测试运行器
- **@testing-library/react**：组件渲染与查询
- **@testing-library/user-event**：用户交互模拟
- **MSW**：API Mock（`src/mocks/handlers.ts` 定义全局 mock）

### 6.2 每个模块必须有的测试

| 测试文件 | 测试内容 |
|----------|----------|
| `slice.test.ts` | Reducer 纯函数、ExtraReducers 状态变更、Thunk pending/fulfilled/rejected |
| `api.test.ts` | API 函数是否发送正确的 HTTP method、URL、body、params |
| `Component.test.tsx` | 组件渲染、props 传递、用户交互（点击、输入、提交）、条件渲染 |

### 6.3 MSW Mock 示例

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: [{ id: 1, name: name || 'Test', email: 'test@example.com', status: true, is_super_admin: false, created_at: '2026-05-20', updated_at: '2026-05-20', roles: [] }],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    });
  }),

  http.post('/api/login', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        user: { id: 1, name: 'Admin', email: 'admin@example.com', status: true, expires_at: null, remarks: null, is_super_admin: true, created_at: '2026-05-20', updated_at: '2026-05-20', roles: [{ id: 1, name: 'super-admin', display_name: '超级管理员', description: null, created_at: '2026-05-20', updated_at: '2026-05-20' }] },
        token: '1|test_token',
      },
    });
  }),

  // ... 其他 API mock
];
```

### 6.4 测试文件模板

```typescript
// modules/auth/tests/slice.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { login, logout, clearError } from '../slice';
import { AuthState } from '../types';

const initialState: AuthState = {
  token: null,
  user: null,
  permissions: [],
  userMenus: [],
  isAuthenticated: false,
  loading: false,
};

describe('authSlice', () => {
  it('should handle clearError', () => {
    const state = authReducer({ ...initialState, error: 'some error' }, clearError());
    expect(state.error).toBeNull();
  });

  it('should handle login.fulfilled', () => {
    const action = {
      type: login.fulfilled.type,
      payload: { token: 'abc123', user: { id: 1, name: 'Admin' } },
    };
    const state = authReducer(initialState, action);
    expect(state.token).toBe('abc123');
    expect(state.isAuthenticated).toBe(true);
  });
});
```

---

## 7. ESLint 配置（主流 Flat Config）

使用 ESLint v9 + Flat Config：

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['error'] }],
    },
  }
);
```

**格式化命令**：`npm run lint`（检查） / `npm run lint:fix`（自动修复）

---

## 8. 质量门禁（每个模块必须通过）

在标记模块完成前，必须依次执行并全部通过：

1. [ ] **TypeScript 编译**: `npx tsc --noEmit`（零错误）
2. [ ] **ESLint 检查**: `npm run lint`（零错误）
3. [ ] **单元测试**: `vitest run src/modules/{module}/tests`（全部通过）
4. [ ] **类型安全**: 代码中无 `any` 类型
5. [ ] **模块独立**: 该模块不引入其他业务模块的内部文件（只允许引入共享组件、hooks、services）

**若门禁失败**：
- 分析错误日志
- 修复代码或测试
- 重新运行门禁
- 直至全部通过

---

## 9. API 速查（核心接口）

### 认证
```
POST   /login          { email, password }         -> { user, token }
POST   /logout                                     -> null
GET    /user                                       -> User + roles + menus
```

### 用户管理
```
GET    /users?name=&email=&per_page=15             -> Paginated<User[]>
POST   /users          CreateUserDto               -> User
GET    /users/:id                                  -> User
PUT    /users/:id      UpdateUserDto               -> User
DELETE /users/:id                                  -> null
```

### 角色管理
```
GET    /roles?per_page=15                          -> Paginated<Role[]>
POST   /roles          CreateRoleDto               -> Role
GET    /roles/:id                                  -> Role
PUT    /roles/:id      UpdateRoleDto               -> Role
DELETE /roles/:id                                  -> null
```

### 菜单管理
```
GET    /menus                                      -> MenuTree[] (当前用户可见)
GET    /menus/all                                  -> MenuTree[] (完整树，含 permission)
POST   /menus          CreateMenuDto               -> Menu
PUT    /menus/:id      UpdateMenuDto               -> Menu
DELETE /menus/:id                                  -> null
```

### 文件上传
```
POST   /upload         FormData: file              -> { url }
```

**统一响应格式**：
```typescript
// 成功
{ code: 0, message: "success", data: T }

// 分页成功
{ code: 0, message: "success", data: T[], meta: { current_page, last_page, per_page, total } }

// 错误
{ code: 10001~10008, message: "错误描述", data: null }
```

**认证 Header**：`Authorization: Bearer {token}`（从 `localStorage` 的 `token` 获取）

---

## 10. 视觉设计速查（Dashboard 专用）

**主题：Refined Industrial Minimalism**

```css
/* 主色调变量 */
--color-text-primary: #1a1a1a;
--color-text-secondary: #666666;
--color-bg-page: #f8f5f0;
--color-bg-card: #ffffff;
--color-border: #e8e8e3;
--color-accent: #c45c3e;       /* 铁锈红，主按钮/强调 */
--color-accent-hover: #a84d32;

/* 字体（国内 CDN） */
/* index.html 引入： */
/* <link href="https://fonts.loli.net/css2?family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"> */
font-family-heading: 'Outfit', 'PingFang SC', sans-serif;
font-family-body: 'Outfit', 'PingFang SC', 'Microsoft YaHei', sans-serif;
font-family-mono: 'JetBrains Mono', monospace;

/* 组件改造 */
border-radius: 2px;             /* Ant Design 默认改小 */
box-shadow-card: 0 1px 2px rgba(0,0,0,0.04);
```

**Ant Design ConfigProvider 覆盖**：
```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#c45c3e',
      borderRadius: 2,
      fontFamily: "'Outfit', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    },
    components: {
      Card: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
      Button: { borderRadius: 2 },
    },
  }}
>
```

---

## 11. 常见陷阱与规避

| 陷阱 | 规避方案 |
|------|----------|
| **AntD 5 + Tailwind 冲突** | 不使用 Tailwind，全部用 AntD 组件 + 自定义 CSS |
| **Redux HMR 状态丢失** | `store.ts` 中配置 `module.hot?.accept(...)` |
| **Tree 组件 checkStrictly** | `MenuPermissionTree` 使用 `checkStrictly={false}` 实现父子联动 |
| **菜单循环引用** | 编辑菜单时，`parent_id` TreeSelect 排除自身及所有子节点 |
| **Token 过期** | Axios interceptor 中捕获 401 / code 10002，清除 token 并跳转 |
| **日期格式** | `expires_at` 字段用 `YYYY-MM-DD`，提交前用 dayjs 格式化 |
| **权限缓存** | 用户更新角色/菜单后，如需即时生效，调用 `fetchCurrentUser()` 刷新权限 |

---

## 12. 启动指令

当你准备好开始工作时：

1. 读取 `doc/frond-progress.md`，确定当前待办模块
2. 读取 `doc/frond-detail.md` 对应模块设计
3. 读取 `doc/api-document.md` 对应 API 细节
4. 开始编码
5. 完成后更新 `doc/frond-progress.md`
6. 汇报进度，继续下一个模块

**首次启动时**：必须先完成 **Project Bootstrap**（模块 1），这是所有后续模块的基础设施。
