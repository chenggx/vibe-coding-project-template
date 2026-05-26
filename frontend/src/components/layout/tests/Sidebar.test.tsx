import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/modules/auth/slice';
import Sidebar from '../Sidebar';

const mockMenus = [
  {
    id: 1,
    parent_id: null,
    name: '仪表盘',
    type: 'menu' as const,
    path: '/dashboard',
    icon: 'Setting',
    permission: 'dashboard.index',
    sort_order: 1,
    meta: null,
    created_at: '2026-05-20',
    updated_at: '2026-05-20',
    children: [],
  },
  {
    id: 2,
    parent_id: null,
    name: '系统管理',
    type: 'catalog' as const,
    path: null,
    icon: 'Setting',
    permission: null,
    sort_order: 2,
    meta: null,
    created_at: '2026-05-20',
    updated_at: '2026-05-20',
    children: [
      {
        id: 3,
        parent_id: 2,
        name: '用户管理',
        type: 'menu' as const,
        path: '/users',
        icon: 'User',
        permission: 'users.index',
        sort_order: 1,
        meta: null,
        created_at: '2026-05-20',
        updated_at: '2026-05-20',
        children: [],
      },
      {
        id: 4,
        parent_id: 2,
        name: '角色管理',
        type: 'menu' as const,
        path: '/roles',
        icon: 'Team',
        permission: 'roles.index',
        sort_order: 2,
        meta: null,
        created_at: '2026-05-20',
        updated_at: '2026-05-20',
        children: [],
      },
    ],
  },
  {
    id: 5,
    parent_id: null,
    name: '权限详情',
    type: 'permission' as const,
    path: null,
    icon: null,
    permission: 'menus.view',
    sort_order: 3,
    meta: null,
    created_at: '2026-05-20',
    updated_at: '2026-05-20',
    children: [],
  },
];

function createTestStore(authState = {}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token: 'test-token',
        user: null,
        permissions: [],
        userMenus: [],
        isAuthenticated: false,
        loading: false,
        error: null,
        ...authState,
      },
    },
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  store: ReturnType<typeof createTestStore>,
) {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>,
  );
}

describe('Sidebar', () => {
  it('应该渲染 Logo', () => {
    const store = createTestStore();
    renderWithProviders(<Sidebar collapsed={false} />, store);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('折叠时应显示简短 Logo', () => {
    const store = createTestStore();
    renderWithProviders(<Sidebar collapsed={true} />, store);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('应该渲染菜单项（过滤 permission 类型）', () => {
    const store = createTestStore({ userMenus: mockMenus });
    renderWithProviders(<Sidebar collapsed={false} />, store);
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('系统管理')).toBeInTheDocument();
    // permission type menu should be filtered out
    expect(
      screen.queryByText('权限详情'),
    ).not.toBeInTheDocument();
  });

  it('应该渲染子菜单', async () => {
    const user = userEvent.setup();
    const store = createTestStore({ userMenus: mockMenus });
    renderWithProviders(<Sidebar collapsed={false} />, store);
    // 展开系统管理子菜单
    await user.click(screen.getByText('系统管理'));
    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('角色管理')).toBeInTheDocument();
  });
});
